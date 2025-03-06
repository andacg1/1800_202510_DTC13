export default function safeOnLoad(fn: (e?: Event) => void): void {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    fn();
  } else {
    document.addEventListener("load", fn);
  }
}
