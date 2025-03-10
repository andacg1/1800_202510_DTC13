import type { Auth } from "firebase/auth";

import {
  collection,
  doc,
  DocumentData,
  type Firestore,
  getDoc,
  getDocs,
  query,
  type QueryDocumentSnapshot,
  setDoc,
  where,
  WithFieldValue,
} from "firebase/firestore";
import { EventData, UserData } from "./Api";
import { getUserRef } from "./lib/auth.ts";
import { toast } from "./lib/toast.ts";
import store, { type CalSyncStore, ShortISODate, Time } from "./store.ts";

export class CalSyncApi {
  static #store: CalSyncStore;
  static db: Firestore;
  static auth: Auth;
  private constructor() {
    throw new Error("CalSyncApi is a static class");
  }
  static {
    this.#store = store;
    this.db = store.getState().db;
    if (!this.db) {
      throw Error("Could not find Firestore Database");
    }
    this.auth = store.getState().auth;
    if (!this.auth) {
      throw Error("Could not find Firebase Auth");
    }
  }
  static converter = <T>() => ({
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
  });
  static collection = <T extends WithFieldValue<DocumentData>>(
    collectionPath: string,
  ) => collection(this.db, collectionPath).withConverter(this.converter<T>());
  static userConverter = this.converter<UserData>();
  static eventConverter = this.converter<EventData>();

  static async createEvent({
    title,
    description,
    duration = 60,
    startDate,
    startTime,
  }: {
    title: string | undefined;
    description: string | undefined;
    duration: number | undefined;
    startDate: ShortISODate;
    startTime: Time;
  }) {
    const [year, month, day] = startDate.split("-").map((s) => Number(s));
    const [hours, minutes] = startTime.split(":").map((s) => Number(s));
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    const newEventRef = doc(collection(this.db, "events"));
    const userRef = await getUserRef();

    try {
      await setDoc(newEventRef, {
        title,
        description,
        duration,
        startTime: eventDate,
        user: userRef,
      });

      toast("Event created successfully.", "success");
      setTimeout(() => {
        window.location.assign("/main.html");
      }, 500);
    } catch (e) {
      toast("Event creation failed.", "error");
    }
  }

  static async getUser(): Promise<UserData | undefined> {
    const userRef = await getUserRef();
    const userSnapshot = await getDoc(userRef);

    return userSnapshot.data();
  }

  static async getUserEvents() {
    const q = query(
      this.collection<EventData>("events"),
      where("user", "==", await getUserRef()),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
  }

  static async getEvent(eventId: string) {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      CalSyncApi.converter<EventData>(),
    );

    const eventSnapshot = await getDoc(eventRef);
    return eventSnapshot.data();
  }
}
