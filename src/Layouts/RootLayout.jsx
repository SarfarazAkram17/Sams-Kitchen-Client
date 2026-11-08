import { Outlet } from "react-router";
import PublicFrame from "./PublicFrame";

const RootLayout = () => (
  <PublicFrame>
    <Outlet />
  </PublicFrame>
);

export default RootLayout;
