import { useEffect, useState } from "react";

import { popFlashMessage } from "../hooks/flashMessage";

function FlashMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const flash = popFlashMessage();

    if (flash) {
      setMessage(flash);
    }
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Message</h2>

        <p>{message}</p>

        <button onClick={() => setMessage("")}>Close</button>
      </div>
    </div>
  );
}

export default FlashMessage;
