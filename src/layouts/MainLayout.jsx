import { Outlet } from "react-router-dom";
import Appbar from "../components/Appbar";

export const MainLayout = () => {
  return (
    <>
        <Appbar />
        <main className="pt-10">
           <Outlet />
        </main>
    </>
  );
}