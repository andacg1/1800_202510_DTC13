import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { createStore } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import { CalSyncApi } from "./CalSyncApi.ts";

export type ShortISODate = `${number}-${number}-${number}`;
export type Time = `${number}:${number}`;
type DraftEvent = {
  title?: string;
  description?: string;
  duration?: number;
  startDate?: ShortISODate;
  startTime?: Time;
};

export type AppStoreState = {
  draftEvent: DraftEvent;
  userId: string;
  db: Firestore;
  auth: Auth;
  filteredEvents: Awaited<ReturnType<typeof CalSyncApi.getUserEvents>>;
};

type AppStoreActions = {
  setDraftEvent: (newDraftEvent: AppStoreState["draftEvent"]) => void;
  setFilteredEvents: (
    newFilteredEvents: AppStoreState["filteredEvents"],
  ) => void;
};

type AppStore = AppStoreState & AppStoreActions;

const store = createStore<AppStore>()(
  devtools((set) => ({
    draftEvent: {
      title: "",
      description: "",
      startDate: new Date().toISOString().substring(0, 10) as ShortISODate,
      startTime: new Date().toISOString().substring(11, 16) as Time,
      duration: 60,
    } satisfies Required<DraftEvent>,
    setDraftEvent: (draftEvent: DraftEvent) =>
      set((state) => ({
        draftEvent: { ...state.draftEvent, ...draftEvent },
      })),
    setFilteredEvents: (filteredEvents: AppStoreState["filteredEvents"]) =>
      set((state) => ({
        filteredEvents: [...filteredEvents],
      })),
    filteredEvents: [],
    userId: "",
    db: null,
  })),
);
export type CalSyncStore = typeof store;

export default store;
