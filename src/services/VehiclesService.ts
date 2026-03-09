import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "vehicles";
export const VehiclesService = {
  // El usuario solicita el alta
  async requestVehicle(userId: string, data: { model: string, year: string, plate: string, currentKm: number }) {
    return await addDoc(collection(db, COLLECTION), {
      ...data,
      userId,
      status: 'pending', // Estado inicial
      createdAt: Timestamp.now(),
    });
  },
  // Obtener vehículos del usuario en tiempo real
  subscribeUserVehicles(userId: string, callback: (vehicles: any[]) => void) {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(vehicles);
    });
  },
  // Obtener solicitudes pendientes para el Admin
  subscribePendingRequests(callback: (vehicles: any[]) => void) {
    const q = query(collection(db, COLLECTION), where("status", "==", "pending"));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(requests);
    });
},
  // Admin aprueba o rechaza
async approveVehicle(vehicleId: string) {
    const docRef = doc(db, COLLECTION, vehicleId);
    return await updateDoc(docRef, { status: 'approved' });
  },
  // Eliminar perfil (Baja)
  async deleteVehicle(vehicleId: string) {
    return await deleteDoc(doc(db, COLLECTION, vehicleId));
  }
};