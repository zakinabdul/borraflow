import { getAuth, GoogleAuthProvider } from "firebase/auth";
import app from "./firebaseConfig";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();