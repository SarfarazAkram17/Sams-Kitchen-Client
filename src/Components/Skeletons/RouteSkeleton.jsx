import { use } from "react";
import { matchPath, useLocation } from "react-router";
import PublicFrame from "../../Layouts/PublicFrame";
import DashboardFrame from "../../Layouts/DashboardFrame";
import { ShellContext } from "../../Layouts/ShellContext";
import {
  AboutSkeleton,
  AddFoodSkeleton,
  AllOrdersSkeleton,
  AllFoodsSkeleton,
  CashoutRequestsSkeleton,
  CheckoutSkeleton,
  CompletedDeliveriesSkeleton,
  DashboardGateSkeleton,
  EditFoodSkeleton,
  ErrorPageSkeleton,
  ForbiddenSkeleton,
  FoodDetailsSkeleton,
  HomeSkeleton,
  KitchenOrdersSkeleton,
  LoginSkeleton,
  ManageFoodsSkeleton,
  ManageUsersSkeleton,
  MyOrdersSkeleton,
  OffersSkeleton,
  OnboardingSkeleton,
  PaymentSkeleton,
  PendingDeliveriesSkeleton,
  PendingRidersSkeleton,
  ProfileSkeleton,
  RegisterSkeleton,
  RiderCashoutsSkeleton,
  TrackingSkeleton,
} from "./PageSkeletons";

const routes = [
  ["/", HomeSkeleton, "public"],
  ["/allFoods", AllFoodsSkeleton, "public"],
  ["/offers", OffersSkeleton, "public"],
  ["/foods/:foodId", FoodDetailsSkeleton, "public"],
  ["/about", AboutSkeleton, "public"],
  ["/placeOrder", CheckoutSkeleton, "public"],
  ["/login", LoginSkeleton, null],
  ["/register", RegisterSkeleton, null],
  ["/onboarding", OnboardingSkeleton, null],
  ["/forbidden", ForbiddenSkeleton, null],
  ["/dashboard", DashboardGateSkeleton, "dashboard"],
  ["/dashboard/manageProfile", ProfileSkeleton, "dashboard"],
  ["/dashboard/myOrders", MyOrdersSkeleton, "dashboard"],
  ["/dashboard/order-tracking/:orderId", TrackingSkeleton, "dashboard"],
  ["/dashboard/payment/:orderId", PaymentSkeleton, "dashboard"],
  ["/dashboard/kitchenOrders", KitchenOrdersSkeleton, "dashboard"],
  ["/dashboard/allOrders", AllOrdersSkeleton, "dashboard"],
  ["/dashboard/cashoutRequests", CashoutRequestsSkeleton, "dashboard"],
  ["/dashboard/addFood", AddFoodSkeleton, "dashboard"],
  ["/dashboard/manageFoods", ManageFoodsSkeleton, "dashboard"],
  ["/dashboard/editFood/:foodId", EditFoodSkeleton, "dashboard"],
  ["/dashboard/manageUsers", ManageUsersSkeleton, "dashboard"],
  ["/dashboard/pendingRiders", PendingRidersSkeleton, "dashboard"],
  ["/dashboard/pendingDeliveries", PendingDeliveriesSkeleton, "dashboard"],
  ["/dashboard/completedDeliveries", CompletedDeliveriesSkeleton, "dashboard"],
  ["/dashboard/cashouts", RiderCashoutsSkeleton, "dashboard"],
];

const frames = { public: PublicFrame, dashboard: DashboardFrame };

// Route guards and lazy pages wait on something before their page can draw.
// This shows the skeleton of the page that is about to appear. When the guard
// sits outside the page's layout, the real header, navbar and sidebar are drawn
// around the skeleton so they stay where they will be once the page loads.
const RouteSkeleton = () => {
  const { pathname } = useLocation();
  const insideFrame = use(ShellContext);
  const match = routes.find(([path]) => matchPath({ path, end: true }, pathname));
  // A path that is not in the table is a page that does not exist.
  const Skeleton = match ? match[1] : ErrorPageSkeleton;
  const Frame = match && !insideFrame ? frames[match[2]] : null;
  return Frame ? (
    <Frame>
      <Skeleton />
    </Frame>
  ) : (
    <Skeleton />
  );
};

export default RouteSkeleton;
