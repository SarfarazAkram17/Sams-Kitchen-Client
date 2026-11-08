import { Outlet } from "react-router";
import DashboardFrame from "./DashboardFrame";

const DashboardLayout = () => (
  <DashboardFrame>
    <Outlet />
  </DashboardFrame>
);

export default DashboardLayout;
