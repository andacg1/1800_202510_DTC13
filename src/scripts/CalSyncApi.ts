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
  updateDoc,
  where,
  WithFieldValue,
} from "firebase/firestore";
import {
  CustomEventData,
  EventData,
  FaqData,
  TagData,
  TagName,
  UserData,
  DocumentReference,
  WithId,
} from "./Api";
import { getUserRef } from "./lib/auth.ts";
import { getDateParts, getTimeParts } from "./lib/temporal.ts";
import { toast } from "./lib/toast.ts";
import store, { type CalSyncStore, ShortISODate, Time } from "./store.ts";
import { deleteDoc } from "firebase/firestore";

export class CalSyncApi {
  static #store: CalSyncStore;
  static db: Firestore;
  static auth: Auth;
  private constructor() {
    throw new Error("CalSyncApi is a static class");
  }

  static async deleteEvent(eventId: string): Promise<void> {
  try {
    const eventRef = doc(this.db, "events", eventId);
    await deleteDoc(eventRef);
    toast("Event deleted successfully.", "success");
    setTimeout(() => {
      window.location.assign("/main.html");
    }, 500);
    } catch (e) {
      toast("Event deletion failed.", "error");
    }
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
    toFirestore: (data: WithId<T>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) =>
      ({
        id: snap.id,
        ...(snap.data() as T),
      }) as WithId<T>,
  });

  static collection = <T extends WithFieldValue<DocumentData>>(
    collectionPath: string,
  ) => collection(this.db, collectionPath).withConverter(this.converter<T>());
  static userConverter = this.converter<UserData>();
  static tagConverter = {
    toFirestore: (data: WithId<TagData>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => {
      const data = snap.data() as WithId<TagData>;
      return {
        ...data,
        id: snap.id,
      } as WithId<TagData>;
    },
  };

  static faqConverter = this.converter<FaqData>();
  static eventConverter = {
    toFirestore: (data: CustomEventData) => data,
    fromFirestore: (snap: QueryDocumentSnapshot) => {
      const data = snap.data() as EventData;
      return {
        ...data,
        id: snap.id,
        startTimeParts: this.getDateParts(data.startTime.seconds),
        tag: data?.tag
          ? {
              ...data.tag,
              id: data.tag.id,
            }
          : null,
      } as CustomEventData;
    },
  };

  static getDateParts(seconds: number) {
    const date = new Date(seconds * 1000);
    const [dateISO, timeISO, amPm] = date
      .toLocaleString("en-US")
      .replace(",", "")
      .split(" ");
    const [hours, minutes] = timeISO.split(":");

    return {
      date,
      dateISO,
      timeISO,
      amPm,
      hours,
      minutes,
    } as {
      date: Date;
      dateISO: string;
      timeISO: string;
      amPm: "am" | "pm";
      hours: string;
      minutes: string;
    };
  }

  static async createEvent({
    title,
    description,
    duration = 60,
    startDate,
    startTime,
    tagName,
  }: {
    title: string | undefined;
    description: string | undefined;
    duration: number | undefined;
    startDate: ShortISODate;
    startTime: Time;
    tagName: string | null;
  }) {
    const [year, month, day] = getDateParts(startDate);
    const [hours, minutes] = getTimeParts(startTime);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    const newEventRef = doc(collection(this.db, "events"));
    const userRef = await getUserRef();
    let tagRef = null;
    const allTags = store.getState().tags;

    if (tagName) {
      const matchingTag = allTags.find((tag) => tag.name === tagName);
      if (matchingTag) {
        tagRef = doc(this.db, "tags", matchingTag.id);
      } else {
        tagRef = doc(collection(this.db, "tags"));
        await setDoc(tagRef, {
          name: tagName,
        });
      }
    }

    try {
      await setDoc(newEventRef, {
        title,
        description,
        duration,
        startTime: eventDate,
        user: userRef,
        tag: tagRef,
      });

      toast("Event successfully created.", "success");
      setTimeout(() => {
        window.location.assign("/main.html");
      }, 500);
    } catch (e) {
      console.error(e);
      toast("Event creation failed.", "error");
    }
  }

  static async getUser(): Promise<WithId<UserData> | undefined> {
    const userRef = await getUserRef();
    const userSnapshot = await getDoc(
      userRef.withConverter(CalSyncApi.converter<UserData>()),
    );

    return userSnapshot.data();
  }

  static async getUserEvents(): Promise<WithId<EventData>[]> {
    const q = query(
      this.collection<EventData>("events"),
      where("user", "==", await getUserRef()),
    ).withConverter(CalSyncApi.eventConverter);

    const querySnapshot = await getDocs(q.withConverter(this.eventConverter));
    return querySnapshot.docs.map((doc) =>
      CalSyncApi.eventConverter.fromFirestore(doc),
    );
  }

  static async getEvent(eventId: string): Promise<CustomEventData | undefined> {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      CalSyncApi.eventConverter,
    );

    const eventSnapshot = await getDoc(
      eventRef.withConverter(CalSyncApi.eventConverter),
    );
    return eventSnapshot.data();
  }

  static async findEvents(searchFor: string): Promise<WithId<EventData>[]> {}

  static async updateEvent(eventId: string, event: Partial<EventData>) {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      CalSyncApi.eventConverter,
    );

    await updateDoc(eventRef, {
      ...event,
    });

    toast("Event successfully updated.", "success");
  }

  static async updateUser(userId: string, user: Partial<UserData>) {
    const userRef = doc(this.db, "users", userId).withConverter(
      CalSyncApi.userConverter,
    );

    await updateDoc(userRef, {
      ...user,
    });

    toast("User successfully updated.", "success");
  }

  static async getAllTags() {
    const q = query(this.collection<EventData>("tags"));

    const querySnapshot = await getDocs(q);
    const tags = querySnapshot.docs.map((doc) =>
      CalSyncApi.tagConverter.fromFirestore(doc),
    );
    store.getState().setTags(tags);
    return tags;
  }

  static async getAllFaqs() {
    const q = query(this.collection<FaqData>("faqs")).withConverter(
      CalSyncApi.faqConverter,
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      CalSyncApi.faqConverter.fromFirestore(doc),
    );
  }
}
