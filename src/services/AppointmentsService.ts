import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "appointments";

type AppointmentStatus = "pending" | "confirmed" | "rejected";

export interface Appointment {
  id?: string;
  userId: string;
  userEmail: string;
  serviceName: string;
  date: string;
  dateISO: string;
  time: string;
  status: AppointmentStatus;
  createdAt: any;
  /** Kilometraje del vehículo en el momento en que se realizó el servicio */
  mileageAtService?: number;
  /** Costo del servicio en pesos MXN (lo registra el admin al confirmar) */
  cost?: number;
}

export const AppointmentsService = {
  // Usuario crea una cita → queda en "pending"
  async createAppointment(
    data: Omit<Appointment, "id" | "status" | "createdAt">
  ) {
    const payload: Record<string, unknown> = {
      ...data,
      status: "pending",
      createdAt: Timestamp.now(),
    };
    // Solo persiste mileageAtService si el usuario lo proporcionó
    if (data.mileageAtService === undefined) {
      delete payload.mileageAtService;
    }
    return await addDoc(collection(db, COLLECTION), payload);
  },

  /**
   * Devuelve el kilometraje registrado en la cita confirmada más reciente
   * del usuario para un tipo de servicio dado, siempre que la cita sea de
   * una fecha pasada (dateISO ≤ hoy).
   *
   * Regla de negocio (Opción B + C):
   *   - Solo citas con status === "confirmed"
   *   - Que tengan dateISO ≤ fecha actual (ya ocurrieron)
   *   - Que tengan mileageAtService definido
   *   - Ordenadas por dateISO DESC → se toma la más reciente
   *
   * Requiere índice compuesto en Firestore:
   *   userId ASC · serviceName ASC · status ASC · dateISO DESC
   *   (ver firestore.indexes.json en la raíz del proyecto)
   */
  async getLatestMileageByService(
    userId: string,
    serviceName: string
  ): Promise<number | null> {
    const todayISO = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const q = query(
      collection(db, COLLECTION),
      where("userId",      "==", userId),
      where("serviceName", "==", serviceName),
      where("status",      "==", "confirmed"),
      where("dateISO",     "<=", todayISO),
      orderBy("dateISO", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    const data = snap.docs[0].data() as Appointment;
    return typeof data.mileageAtService === "number" ? data.mileageAtService : null;
  },

  // Usuario: escucha sus propias citas en tiempo real
  subscribeUserAppointments(
    userId: string,
    callback: (items: Appointment[]) => void
  ) {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const sorted = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Appointment))
          .sort((a, b) => (a.createdAt?.seconds > b.createdAt?.seconds ? -1 : 1));
        callback(sorted);
      },
      (error) => console.error("Error citas usuario:", error)
    );
  },

  // Admin: escucha todas las citas pendientes en tiempo real
  subscribePendingAppointments(
    callback: (items: Appointment[]) => void
  ) {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", "pending")
    );
    return onSnapshot(
      q,
      (snap) => {
        callback(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment))
        );
      },
      (error) => console.error("Error citas admin:", error)
    );
  },

  // Admin aprueba la cita
  async confirmAppointment(id: string) {
    return await updateDoc(doc(db, COLLECTION, id), { status: "confirmed" });
  },

  // --- MÉTODO AGREGADO PARA RECHAZAR/ELIMINAR ---
  async rejectAppointment(id: string) {
    return await deleteDoc(doc(db, COLLECTION, id));
  },

  // Admin: escucha todas las citas confirmadas en tiempo real
  subscribeConfirmedAppointments(
    callback: (items: Appointment[]) => void
  ) {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", "confirmed")
    );
    return onSnapshot(
      q,
      (snap) => {
        callback(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment))
        );
      },
      (error) => console.error("Error citas confirmadas:", error)
    );
  },
};