import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc, // Añadimos deleteDoc para poder eliminar
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
}

export const AppointmentsService = {
  // Usuario crea una cita → queda en "pending"
  async createAppointment(
    data: Omit<Appointment, "id" | "status" | "createdAt">
  ) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      status: "pending",
      createdAt: Timestamp.now(),
    });
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