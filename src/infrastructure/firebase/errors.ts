import { FirebaseError } from "firebase/app";

// As regras do Firestore negam a leitura de documento alheio e também de
// documento inexistente, então para o cliente os dois casos são iguais.
export function isPermissionDenied(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "permission-denied";
}
