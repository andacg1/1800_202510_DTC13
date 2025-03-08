type AlertType =
  | "info"
  | "warning"
  | "success"
  | "error"
  | "primary"
  | "secondary"
  | "accent";
export function toast(
  message: string,
  alertType: AlertType = "info",
  duration = 5000,
) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.warn("Could not find toast container");
    return;
  }
  const toastEl = document.createElement("div");
  toastEl.classList.add("alert", `alert-${alertType}`);
  const spanEl = document.createElement("span");
  spanEl.innerText = message;
  toastEl.appendChild(spanEl);
  container.appendChild(toastEl);
  setTimeout(() => {
    toastEl.remove();
  }, duration);
}
