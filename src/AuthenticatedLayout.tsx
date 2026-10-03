import { Outlet } from "react-router-dom";
import { QuestCompletedToast } from "@/shared/components/QuestCompletedToast";

export function AuthenticatedLayout() {
  return (
    <>
      <QuestCompletedToast />
      <Outlet />
    </>
  );
}
