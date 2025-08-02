import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout";
import Community from "../Pages/Community/Community";
import AllFoods from "../Pages/AllFoods/AllFoods";
// import Offers from "../Pages/Offers/Offers";
import DashboardLayout from "../Layouts/DashboardLayout";
import Dashboard from "../Pages/Dashboard/Dashboard/Dashboard";
import PrivateRoutes from "../Routes/PrivateRoutes";
import ManageProfile from "../Pages/Dashboard/ManageProfile/ManageProfile";
import { lazy, Suspense } from "react";
import Loading from "../Components/Loading/Loading";
import AdminRoutes from "../Routes/AdminRoutes";
import ManageUsers from "../Pages/Dashboard/ManageUsers/ManageUsers";
import MyOrders from "../Pages/Dashboard/MyOrders/MyOrders";
import AddFood from "../Pages/Dashboard/AddFood/AddFood";
import ManageFoods from "../Pages/Dashboard/ManageFoods/ManageFoods";
import EditFood from "../Pages/Dashboard/EditFood/EditFood";
import FoodDetails from "../Pages/FoodDetails/FoodDetails";

const Home = lazy(() => import("../Pages/Home/Home/Home"));
const AboutUs = lazy(() => import("../Pages/AboutUs/AboutUs"));
const Login = lazy(() => import("../Pages/Login/Login"));
const Register = lazy(() => import("../Pages/Register/Register"));
const ErrorPage = lazy(() => import("../Pages/ErrorPage/ErrorPage"));
const Forbidden = lazy(() => import("../Pages/Forbidden/Forbidden"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading></Loading>}>
            <Home></Home>
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={<Loading></Loading>}>
            <Register></Register>
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<Loading></Loading>}>
            <Login></Login>
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<Loading></Loading>}>
            <AboutUs></AboutUs>
          </Suspense>
        ),
      },
      {
        path: "/community",
        Component: Community,
      },
      {
        path: "/allFoods",
        Component: AllFoods,
      },
      {
        path: "/foods/:foodId",
        Component: FoodDetails,
      },
      // {
      //   path: "/offers",
      //   Component: Offers,
      // },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <DashboardLayout></DashboardLayout>
      </PrivateRoutes>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "manageProfile",
        Component: ManageProfile,
      },
      {
        path: "myOrders",
        Component: MyOrders,
      },
      {
        path: "manageUsers",
        element: <AdminRoutes><ManageUsers></ManageUsers></AdminRoutes>
      },
      {
        path: "addFood",
        element: <AdminRoutes><AddFood></AddFood></AdminRoutes>
      },
      {
        path: "manageFoods",
        element: <AdminRoutes><ManageFoods></ManageFoods></AdminRoutes>
      },
      {
        path: "/dashboard/editFood/:foodId",
        element: <AdminRoutes><EditFood></EditFood></AdminRoutes>
      },
    ],
  },
  {
    path: "/forbidden",
    element: (
      <Suspense fallback={<Loading></Loading>}>
        <Forbidden></Forbidden>
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<Loading></Loading>}>
        <ErrorPage></ErrorPage>
      </Suspense>
    ),
  },
]);
