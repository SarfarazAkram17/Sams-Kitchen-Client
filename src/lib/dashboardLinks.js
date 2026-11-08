import { FiList, FiPlusCircle, FiUser } from "react-icons/fi";
import { TbLayoutDashboard } from "react-icons/tb";
import { LuChefHat, LuCodesandbox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaTasks,
  FaUserClock,
  FaUsers,
  FaWallet,
} from "react-icons/fa";

const commonLinks = [
  { to: "/dashboard", label: "Dashboard", icon: TbLayoutDashboard, end: true },
  { to: "/dashboard/manageProfile", label: "Manage Profile", icon: FiUser },
];

const linksByRole = {
  admin: [
    { to: "/dashboard/kitchenOrders", label: "Kitchen Orders", icon: LuChefHat },
    { to: "/dashboard/allOrders", label: "All Orders", icon: FiList },
    { to: "/dashboard/addFood", label: "Add Food", icon: FiPlusCircle },
    { to: "/dashboard/manageFoods", label: "Manage Foods", icon: IoFastFoodOutline },
    { to: "/dashboard/manageUsers", label: "Manage Users", icon: FaUsers },
    { to: "/dashboard/pendingRiders", label: "Pending Riders", icon: FaUserClock },
    { to: "/dashboard/cashoutRequests", label: "Cashout Requests", icon: FaMoneyBillWave },
  ],
  customer: [
    { to: "/dashboard/myOrders", label: "My Orders", icon: LuCodesandbox },
  ],
  rider: [
    { to: "/dashboard/pendingDeliveries", label: "Pending Deliveries", icon: FaTasks },
    { to: "/dashboard/completedDeliveries", label: "Completed Deliveries", icon: FaCheckCircle },
    { to: "/dashboard/cashouts", label: "Cashouts", icon: FaWallet },
  ],
};

// Dashboard menu for the role the database reports (none while it is loading).
// An application that is under review or rejected only gets the common links.
export const getDashboardLinks = (role, riderStatus = null) => [
  ...commonLinks,
  ...(["pending", "rejected"].includes(riderStatus) ? [] : linksByRole[role] || []),
];
