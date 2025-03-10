import type { DocumentReference } from "@firebase";

export type UserData = { email: string; name: string };
export interface EventData {
  title: string;
  duration: number;
  startTime: StartTime;
  description: string;
  user: DocumentReference;
}
