import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

type DraftEvent = {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: Date;
  endTime?: Date;
};

type App = {
  state: {
    create: {
      step: number;
      draftEvent: DraftEvent;
    };
  };
  db: Firestore | null;
  app: FirebaseApp | null;
  auth: Auth | null;
};

declare global {
  interface Window {
    App: App;
  }
}
