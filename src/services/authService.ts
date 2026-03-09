import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const authService = {
  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async register(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  async logout() {
    return await signOut(auth);
  },
};