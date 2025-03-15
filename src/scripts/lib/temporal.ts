export function toShortISO(date: Date): string {
  return date.toISOString().substring(0, 10);
}

export const getDateParts = (date: string) => {
  const [year, month, day] = date.split("-")
    .map((s: string) => Number(s));
  return [year, month, day]
}

export const getTimeParts = (time: string) => {
  const [hours, minutes] = time.split(":").map((s) => Number(s));
  return [hours, minutes]
}
