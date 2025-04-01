import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import { updateFirestore } from "./src/scripts/app.ts";

type App = {
  state: {
    create: {
      step: number;
    };
  };
  db: Firestore | null;
  app: FirebaseApp | null;
  auth: Auth | null;
};

declare global {
  interface Window {
    App: App;
    updateFirestore: () => Promise<void>;
  }
}
