import { useEffect, useState } from "react";
import { popFlashMessage, FLASH_EVENT_NAME } from "@/shared/hooks/flashMessage";
import "../assets/css/flashMessage.css";

function FlashMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    //Check if there's an existing flash message from a redirect page mount
    const initialFlash = popFlashMessage();
    if (initialFlash) {
      setMessage(initialFlash);
    }

    // Timer handler to clear the message
    let timeoutId: ReturnType<typeof setTimeout>;
    const startTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMessage("");
      }, 3000);
    };

    if (initialFlash) startTimer();

    //Listen for immediate live updates on the current page
    const handleLiveFlash = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setMessage(customEvent.detail);

      // Clean up storage just in case it was written
      sessionStorage.removeItem("flash.message");

      startTimer();
    };

    window.addEventListener(FLASH_EVENT_NAME, handleLiveFlash);

    // Clean up listeners on unmount
    return () => {
      window.removeEventListener(FLASH_EVENT_NAME, handleLiveFlash);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!message) return null;

  return <div className="modal-box">{message}</div>;
}

export default FlashMessage;
