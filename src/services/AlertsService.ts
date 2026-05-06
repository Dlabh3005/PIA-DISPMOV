import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "alerts";

export interface AppAlert {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  read: boolean;
  createdAt: any;
}

export const AlertsService = {
  /**
   * Crea una nueva alerta para un usuario específico.
   * Llamado por el admin.
   */
  async createAlert(
    userId: string,
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ): Promise<void> {
    const alertsRef = collection(db, COLLECTION);
    await addDoc(alertsRef, {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Se suscribe a las alertas no leídas de un usuario.
   * Llamado por la app del usuario (InAppAlert component).
   */
  subscribeToUnreadAlerts(userId: string, callback: (alerts: AppAlert[]) => void) {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    return onSnapshot(q, (snapshot) => {
      const unreadAlerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppAlert[];

      // Ordenar localmente por fecha de creación (ascendente, la más vieja primero para procesarlas en orden)
      unreadAlerts.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeA - timeB;
      });

      callback(unreadAlerts);
    });
  },

  /**
   * Marca una alerta como leída para que desaparezca y no vuelva a cargar.
   */
  async markAsRead(alertId: string): Promise<void> {
    const alertRef = doc(db, COLLECTION, alertId);
    await updateDoc(alertRef, { read: true });
  },
};
