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
  deleteDoc,
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
  AttendanceData,
} from "./Api";
import { EventElement } from "./components.ts";
import { getUserRef } from "./lib/auth.ts";
import { getDateParts, getTimeParts, toShortISO } from "./lib/temporal.ts";
import { toast } from "./lib/toast.ts";
import store, { type CalSyncStore, ShortISODate, Time } from "./store.ts";

export class CalSyncApi {
  static #store: CalSyncStore;
  static db: Firestore;
  static auth: Auth;
  private constructor() {
    throw new Error("CalSyncApi is a static class");
  }

  static async refreshEventList() {
    // TODO: Make this dependent on currently selected date
    console.debug("Refreshing event list...");
    const events = await this.getUserEvents();
    store.getState().setFilteredEvents(events);
    const eventList = document.getElementById("main-event-list");

    store.getState().setFilteredEvents(events);

    if (!eventList) {
      console.error("Event list element not found!");
      return;
    }

    const rows = events.map((event) =>
      EventElement(event as WithId<EventData>),
    );
    eventList?.replaceChildren(...rows);

    console.debug("Event list updated.");
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      console.debug(`Attempting to delete event with ID: ${eventId}`);

      const eventRef = doc(this.db, "events", eventId);
      await deleteDoc(eventRef);

      console.debug(`Event ${eventId} deleted successfully.`);
      toast("Event deleted successfully.", "success");

      // Refresh the event list after deletion
      await this.refreshEventList();

      // Redirect only if on event.html
      if (window.location.pathname.includes("event.html")) {
        setTimeout(() => {
          window.location.href = "/main.html";
        }, 500);
      }
    } catch (e) {
      console.error("Error deleting event:", e);
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
  static attendanceConverter = this.converter<AttendanceData>();
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
    const [_dateISO, timeISO, amPm] = date
      .toLocaleString("en-US")
      .replace(",", "")
      .split(" ");
    const [hours, minutes] = timeISO.split(":");
    const dateISO = toShortISO(date);

    console.log({
      date,
      dateISO,
      timeISO,
      amPm,
      hours,
      minutes,
    });

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
    isPublic = false,
  }: {
    title: string | undefined;
    description: string | undefined;
    duration: number | undefined;
    startDate: ShortISODate;
    startTime: Time;
    tagName: string | null;
    isPublic: boolean;
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
        isPublic,
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
    const mappedEvents = querySnapshot.docs.map((doc) =>
      CalSyncApi.eventConverter.fromFirestore(doc),
    );
    try {
      store.getState().setFilteredEvents(mappedEvents);
    } catch (e) {
      console.error(e);
    }
    return mappedEvents;
  }

  static async getUserAttendance(): Promise<WithId<AttendanceData>[]> {
    const q = query(
      this.collection<AttendanceData>("attendance"),
      where("user", "==", await getUserRef()),
    ).withConverter(CalSyncApi.attendanceConverter);

    const querySnapshot = await getDocs(
      q.withConverter(this.attendanceConverter),
    );
    const mappedAttendance = querySnapshot.docs.map((doc) =>
      CalSyncApi.attendanceConverter.fromFirestore(doc),
    );
    try {
      store
        .getState()
        .setUserAttendance(
          mappedAttendance.map((attendance) => attendance.event.id),
        );
    } catch (e) {
      console.error(e);
    }
    return mappedAttendance;
  }

  static async getUserAttendanceFor(
    eventId: string,
  ): Promise<WithId<AttendanceData> | null> {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      this.eventConverter,
    );
    const q = query(
      this.collection<AttendanceData>("attendance"),
      where("user", "==", await getUserRef()),
      where("event", "==", eventRef),
    ).withConverter(CalSyncApi.attendanceConverter);

    const querySnapshot = await getDocs(
      q.withConverter(this.attendanceConverter),
    );
    const mappedDocs = querySnapshot.docs.map((doc) =>
      CalSyncApi.attendanceConverter.fromFirestore(doc),
    );
    return mappedDocs.length > 0 ? mappedDocs[0] : null;
  }

  static async setUserAttendanceFor(
    eventId: string,
    attending: boolean,
  ): Promise<void> {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      this.eventConverter,
    );
    const userRef = await getUserRef();

    if (attending) {
      const newAttendantRef = doc(
        this.db,
        "attendance",
        `${userRef.id}_${eventId}`,
      );
      try {
        const attendance = {
          user: userRef,
          event: eventRef,
        };
        await setDoc(newAttendantRef, attendance);

        store.getState().addUserAttendance(eventRef.id);

        toast("Event attendance confirmed.", "success");
      } catch (e) {
        console.error(e);
        toast("Failed to confirm attendance.", "error");
      }
      return;
    }

    // delete attendance
    const attendanceRef = doc(
      this.db,
      "attendance",
      `${userRef.id}_${eventId}`,
    );
    if (attendanceRef) {
      try {
        await deleteDoc(attendanceRef);
        store.getState().removeUserAttendance(eventRef.id);

        toast("Removed from your events.", "success");
      } catch (e) {
        console.error(e);
        toast("Failed to remove from your events.", "error");
      }
    }
  }

  static async getEvent(eventId: string): Promise<CustomEventData | undefined> {
    try {
      console.debug(`Fetching event with ID: ${eventId}`);
      const eventRef = doc(this.db, "events", eventId).withConverter(
        this.eventConverter,
      );
      const eventSnapshot = await getDoc(eventRef);

      if (!eventSnapshot.exists()) {
        console.error(`Event not found: ${eventId}`);
        return undefined;
      }

      return eventSnapshot.data();
    } catch (error) {
      console.error("Error fetching event:", error);
      return undefined;
    }
  }

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
