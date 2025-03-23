import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { createStore } from "zustand/vanilla";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { TagData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import createDeepMerge from "@fastify/deepmerge";

export type ShortISODate = `${number}-${number}-${number}`;
export type Time = `${number}:${number}`;
export type EventId = string;
type DraftEvent = {
  title?: string;
  description?: string;
  duration?: number;
  startDate?: ShortISODate;
  startTime?: Time;
  tagName?: string | null;
  isPublic?: boolean;
};

export type AppStoreState = {
  draftEvent: DraftEvent;
  userId: string;
  db: Firestore;
  auth: Auth;
  filteredEvents: Awaited<ReturnType<typeof CalSyncApi.getUserEvents>>;
  tags: Awaited<ReturnType<typeof CalSyncApi.getAllTags>>;
  currentTag: WithId<TagData> | null;
  userAttendance: EventId[];
};

type AppStoreActions = {
  setDraftEvent: (newDraftEvent: AppStoreState["draftEvent"]) => void;
  setFilteredEvents: (
    newFilteredEvents: AppStoreState["filteredEvents"],
  ) => void;
  setTags: (tags: AppStoreState["tags"]) => void;
  setCurrentTag: (tag: AppStoreState["currentTag"]) => void;
  setUserAttendance: (attendance: AppStoreState["userAttendance"]) => void;
  addUserAttendance: (eventId: EventId) => void;
  removeUserAttendance: (eventId: EventId) => void;
};

type AppStore = AppStoreState & AppStoreActions;

const deepMerge = createDeepMerge({ all: true });

const store = createStore<AppStore>()(
  persist(
    devtools(
      (set) => ({
        draftEvent: {
          title: "",
          description: "",
          startDate: new Date().toISOString().substring(0, 10) as ShortISODate,
          startTime: new Date().toISOString().substring(11, 16) as Time,
          duration: 60,
          tagName: null,
          isPublic: false,
        } satisfies Required<DraftEvent>,
        setDraftEvent: (draftEvent: DraftEvent) =>
          set(
            (state) => ({
              draftEvent: { ...state.draftEvent, ...draftEvent },
            }),
            undefined,
            "calsync/setDraftEvent",
          ),
        setFilteredEvents: (filteredEvents: AppStoreState["filteredEvents"]) =>
          set(
            (state) => ({
              filteredEvents: [...filteredEvents],
            }),
            undefined,
            "calsync/setFilteredEvents",
          ),
        filteredEvents: [],
        tags: [],
        setTags: (tags: AppStoreState["tags"]) =>
          set(
            (state) => ({
              tags: [...tags],
            }),
            undefined,
            "calsync/setTags",
          ),
        setCurrentTag: (currentTag: AppStoreState["currentTag"]) =>
          set(
            (state) => ({
              currentTag: currentTag,
            }),
            undefined,
            "calsync/setCurrentTag",
          ),
        userAttendance: [],
        setUserAttendance: (userAttendance: AppStoreState["userAttendance"]) =>
          set(
            (state) => ({
              userAttendance: [...userAttendance],
            }),
            undefined,
            "calsync/setUserAttendance",
          ),
        addUserAttendance: (eventId: EventId) =>
          set(
            (state) => ({
              userAttendance: Array.from(
                new Set(state.userAttendance).add(eventId),
              ),
            }),
            undefined,
            "calsync/addUserAttendance",
          ),
        removeUserAttendance: (eventId: EventId) =>
          set(
            (state) => ({
              userAttendance: [
                ...state.userAttendance.filter((id) => id !== eventId),
              ],
            }),
            undefined,
            "calsync/removeUserAttendance",
          ),
        userId: "",
        db: null,
      }),
      { name: "CalSync", enabled: true, anonymousActionType: "calsync" },
    ),
    {
      name: "calsync-storage",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => deepMerge(current, persisted) as never,
    },
  ),
);
export type CalSyncStore = typeof store;

export default store;
