const FLASH_KEY = "flash.message";
const FLASH_EVENT_NAME = "flash_message_trigger";

export function setFlashMessage(message: string) {
  // Keep it in storage for cross-page redirects
  sessionStorage.setItem(FLASH_KEY, message);

  // Dispatch a global event for immediate display if the component is already mounted
  const event = new CustomEvent(FLASH_EVENT_NAME, { detail: message });
  window.dispatchEvent(event);
}

export function popFlashMessage() {
  const message = sessionStorage.getItem(FLASH_KEY);
  if (message) {
    sessionStorage.removeItem(FLASH_KEY);
  }
  return message;
}

export { FLASH_EVENT_NAME };