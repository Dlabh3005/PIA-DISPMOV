import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "appointments";

export interface Appointment {
  id?: string;
  userId: string;
  userEmail: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "rejected";
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

  // Admin rechaza la cita
  async rejectAppointment(id: string) {
    return await updateDoc(doc(db, COLLECTION, id), { status: "rejected" });
  },
};
