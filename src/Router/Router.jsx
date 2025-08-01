import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout";
import Home from "../Pages/Home/Home/Home";
import Register from "../Pages/Register/Register";
import Login from "../Pages/Login/Login";
import AboutUs from "../Pages/AboutUs/AboutUs";
import Community from "../Pages/Community/Community";
import AllFoods from "../Pages/AllFoods/AllFoods";
import Offers from "../Pages/Offers/Offers";
import DashboardLayout from "../Layouts/DashboardLayout";
import Dashboard from "../Pages/Dashboard/Dashboard/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "/register",
        Component: Register,
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/about",
        Component: AboutUs,
      },
      {
        path: "/community",
        Component: Community,
      },
      {
        path: "/foods",
        Component: AllFoods,
      },
      {
        path: "/offers",
        Component: Offers,
      },
    ],
  },
  {
    path: '/dashboard',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard
      },
      // {
      //   path: '/manageProfile'
      // }
    ]
  }
]);
