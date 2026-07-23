import { clearAuthSession } from "../../../shared/hooks/authSession";
import { setFlashMessage } from "@/shared/hooks/flashMessage";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function Logout(){
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if(response.ok){
        setFlashMessage("Logout Successfully");
        clearAuthSession();
      }
}
export default Logout