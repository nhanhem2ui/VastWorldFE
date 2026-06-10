const FLASH_KEY = "flash.message";

export function setFlashMessage(
  message: string
) {
  sessionStorage.setItem(
    FLASH_KEY,
    message
  );
}

export function popFlashMessage() {

  const message =
    sessionStorage.getItem(
      FLASH_KEY
    );

  if(message){
    sessionStorage.removeItem(
      FLASH_KEY
    );
  }

  return message;
}