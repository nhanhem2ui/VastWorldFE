import { useEffect, useState } from "react";
import { popFlashMessage } from "@/shared/hooks/flashMessage";
import "../assets/css/flashMessage.css";
function FlashMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const flash = popFlashMessage();
    if (flash) {
      setMessage(flash);
      setTimeout(() => setMessage(""), 1000);
    }
  }, []);

  if (!message) return null;

  return <div className="modal-box">{message}</div>;
}

export default FlashMessage;
