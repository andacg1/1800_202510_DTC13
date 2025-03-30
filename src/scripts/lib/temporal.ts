import { format, getDate } from "date-fns";
import { tz } from "@date-fns/tz";

export function toShortISO(date: Date): string {
  return format(date, "yyyy-MM-dd", { in: tz("UTC") });
}

export const getDateParts = (date: string) => {
  const [year, month, day] = date.split("-").map((s: string) => Number(s));
  return [year, month, day];
};

export const getTimeParts = (time: string) => {
  const [hours, minutes] = time.split(":").map((s) => Number(s));
  return [hours, minutes];
};

export const getPaddedTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};
