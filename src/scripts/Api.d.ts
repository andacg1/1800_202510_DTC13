import type { DocumentReference } from "@firebase";

export type WithId<T> = T & { id: string };
export type UserData = { email: string; name: string };

export type TagName = "networking" | "education" | "gaming" | "casual" | string;
export type TagData = {
  name: TagName;
};

export interface StartTime {
  seconds: number;
  nanoseconds: number;
}

export type EventData = {
  title: string;
  duration: number;
  startTime: StartTime;
  description: string;
  user: DocumentReference;
};

export type DateParts = {
  date: Date;
  dateISO: string;
  timeISO: string;
  amPm: string;
  hours: string;
  minutes: string;
};

export type CustomEventData = WithId<EventData> & {
  startTimeParts: DateParts;
};

export type FaqData = {
  title: string;
  description: string;
};
