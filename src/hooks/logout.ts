import { clearAuthSession } from "./authSession";
import { setFlashMessage } from "./flashMessage";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
export async function Logout(){
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if(response.ok){
        clearAuthSession();
        setFlashMessage("Logout Successfully");
      }
}
export default Logout