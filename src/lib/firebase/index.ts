import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from "firebase/auth";
import { app, db } from "./app";

type ReactNativeAuthModule = {
  getReactNativePersistence: (
    storage: typeof AsyncStorage,
  ) => Persistence;
};

function createAuth() {
  try {
    const { getReactNativePersistence } =
      require("firebase/auth") as ReactNativeAuthModule;

    if (typeof getReactNativePersistence !== "function") {
      return getAuth(app);
    }

    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

const auth = createAuth();

export { app, auth, db };
