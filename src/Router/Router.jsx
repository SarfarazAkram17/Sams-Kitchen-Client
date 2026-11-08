import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout";
import AllFoods from "../Pages/AllFoods/AllFoods";
import DashboardLayout from "../Layouts/DashboardLayout";
import Dashboard from "../Pages/Dashboard/Dashboard/Dashboard";
import PrivateRoutes from "../Routes/PrivateRoutes";
import SessionGate from "../Routes/SessionGate";
import ManageProfile from "../Pages/Dashboard/ManageProfile/ManageProfile";
import { lazy, Suspense } from "react";
import RouteSkeleton from "../Components/Skeletons/RouteSkeleton";
import AdminRoutes from "../Routes/AdminRoutes";
import ManageUsers from "../Pages/Dashboard/ManageUsers/ManageUsers";
import MyOrders from "../Pages/Dashboard/MyOrders/MyOrders";
import AddFood from "../Pages/Dashboard/AddFood/AddFood";
import ManageFoods from "../Pages/Dashboard/ManageFoods/ManageFoods";
import EditFood from "../Pages/Dashboard/EditFood/EditFood";
import FoodDetails from "../Pages/FoodDetails/FoodDetails";
import PlaceOrder from "../Pages/PlaceOrder/PlaceOrder";
import Payment from "../Pages/Dashboard/Payment/Payment";
import CustomerRoutes from "../Routes/CustomerRoutes";
import PendingRiders from "../Pages/Dashboard/PendingRiders/PendingRiders";
import RiderRoutes from "../Routes/RiderRoutes";
import PendingDeliveries from "../Pages/Dashboard/PendingDeliveries/PendingDeliveries";
import CompletedDeliveries from "../Pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
import Offers from "../Pages/Offers/Offers";
import OrderTracking from "../Pages/Dashboard/OrderTracking/OrderTracking";
import KitchenOrders from "../Pages/Dashboard/KitchenOrders/KitchenOrders";
import AllOrders from "../Pages/Dashboard/AllOrders/AllOrders";
import CashoutRequests from "../Pages/Dashboard/CashoutRequests/CashoutRequests";
import RiderCashouts from "../Pages/Dashboard/RiderCashouts/RiderCashouts";

const Home = lazy(() => import("../Pages/Home/Home/Home"));
const AboutUs = lazy(() => import("../Pages/AboutUs/AboutUs"));
const Login = lazy(() => import("../Pages/Login/Login"));
const Register = lazy(() => import("../Pages/Register/Register"));
const Onboarding = lazy(() => import("../Pages/Onboarding/Onboarding"));
const ErrorPage = lazy(() => import("../Pages/ErrorPage/ErrorPage"));
const Forbidden = lazy(() => import("../Pages/Forbidden/Forbidden"));

export const router = createBrowserRouter([
  {
    Component: SessionGate,
    children: [
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteSkeleton />}>
            <Home></Home>
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<RouteSkeleton />}>
            <AboutUs></AboutUs>
          </Suspense>
        ),
      },
      {
        path: "/offers",
        Component: Offers,
      },
      {
        path: "/allFoods",
        Component: AllFoods,
      },
      {
        path: "/foods/:foodId",
        Component: FoodDetails,
      },
      {
        path: "/placeOrder",
        element: (
          <PrivateRoutes>
            <CustomerRoutes>
              <PlaceOrder></PlaceOrder>
            </CustomerRoutes>
          </PrivateRoutes>
        ),
      },
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
        element: (
          <CustomerRoutes>
            <MyOrders></MyOrders>
          </CustomerRoutes>
        ),
      },
      {
        path: "order-tracking/:orderId",
        element: (
          <CustomerRoutes>
            <OrderTracking></OrderTracking>
          </CustomerRoutes>
        ),
      },
      {
        path: "/dashboard/payment/:orderId",
        element: (
          <CustomerRoutes>
            <Payment></Payment>
          </CustomerRoutes>
        ),
      },

      // admin routes
      {
        path: "manageUsers",
        element: (
          <AdminRoutes>
            <ManageUsers></ManageUsers>
          </AdminRoutes>
        ),
      },
      {
        path: "addFood",
        element: (
          <AdminRoutes>
            <AddFood></AddFood>
          </AdminRoutes>
        ),
      },
      {
        path: "manageFoods",
        element: (
          <AdminRoutes>
            <ManageFoods></ManageFoods>
          </AdminRoutes>
        ),
      },
      {
        path: "/dashboard/editFood/:foodId",
        element: (
          <AdminRoutes>
            <EditFood></EditFood>
          </AdminRoutes>
        ),
      },
      {
        path: "/dashboard/pendingRiders",
        element: (
          <AdminRoutes>
            <PendingRiders></PendingRiders>
          </AdminRoutes>
        ),
      },

      {
        path: "kitchenOrders",
        element: (
          <AdminRoutes>
            <KitchenOrders></KitchenOrders>
          </AdminRoutes>
        ),
      },
      {
        path: "allOrders",
        element: (
          <AdminRoutes>
            <AllOrders></AllOrders>
          </AdminRoutes>
        ),
      },
      {
        path: "cashoutRequests",
        element: (
          <AdminRoutes>
            <CashoutRequests></CashoutRequests>
          </AdminRoutes>
        ),
      },

      // rider router
      {
        path: "/dashboard/pendingDeliveries",
        element: (
          <RiderRoutes>
            <PendingDeliveries></PendingDeliveries>
          </RiderRoutes>
        ),
      },
      {
        path: "/dashboard/completedDeliveries",
        element: (
          <RiderRoutes>
            <CompletedDeliveries></CompletedDeliveries>
          </RiderRoutes>
        ),
      },
      {
        path: "/dashboard/cashouts",
        element: (
          <RiderRoutes>
            <RiderCashouts></RiderCashouts>
          </RiderRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<RouteSkeleton />}>
        <Login></Login>
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<RouteSkeleton />}>
        <Register></Register>
      </Suspense>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<RouteSkeleton />}>
        <Onboarding></Onboarding>
      </Suspense>
    ),
  },
  {
    path: "/forbidden",
    element: (
      <Suspense fallback={<RouteSkeleton />}>
        <Forbidden></Forbidden>
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<RouteSkeleton />}>
        <ErrorPage></ErrorPage>
      </Suspense>
    ),
  },
    ],
  },
]);
