import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import { db } from "../config/firebase";

const COLLECTION = "services";

export const ServicesService = {

  subscribeServices(callback: (services: any[]) => void) {
    const ref = collection(db, COLLECTION);

    return onSnapshot(ref, (snapshot) => {
      const services = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(services);
    });
  },

  async addService(service: any) {
    await addDoc(collection(db, COLLECTION), service);
  },

  async deleteService(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async updateService(id: string, data: any) {
    await updateDoc(doc(db, COLLECTION, id), data);
  }
};