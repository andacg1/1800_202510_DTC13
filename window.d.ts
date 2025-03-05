import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

type App = {
  state: {
    create: {
      step: number;
    };
  };
  db: Firestore;
  app: FirebaseApp;
  auth: Auth;
};

declare global {
  interface Window {
    App: App;
  }
}
