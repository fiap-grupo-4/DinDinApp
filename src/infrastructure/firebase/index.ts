import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from "firebase/auth";
import { app, db, storage } from "./app";

type ReactNativeAuthModule = {
  getReactNativePersistence: (
    asyncStorage: typeof AsyncStorage,
  ) => Persistence;
};

function createAuth() {
  const { getReactNativePersistence } =
    require("firebase/auth") as ReactNativeAuthModule;

  if (typeof getReactNativePersistence !== "function") {
    throw new Error("A persistência de autenticação do React Native não está disponível.");
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "auth/already-initialized"
    ) {
      return getAuth(app);
    }
    throw error;
  }
}

const auth = createAuth();

export { app, auth, db, storage };
