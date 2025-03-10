import { collection, doc, type Firestore, setDoc } from "firebase/firestore";
import { getUserRef } from "./lib/auth.ts";
import { toast } from "./lib/toast.ts";
import store, { type CalSyncStore, ShortISODate, Time } from "./store.ts";
import type { Auth } from "firebase/auth";

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
}
