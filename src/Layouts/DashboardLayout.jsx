import { Link, NavLink, Outlet } from "react-router";
import logo from "../assets/images/logo.png";
import useAuth from "../Hooks/useAuth";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiPlusCircle, FiUser } from "react-icons/fi";
import { FaCheckCircle, FaMotorcycle, FaTasks, FaUserClock, FaUsers } from "react-icons/fa";
import useUserRole from "../Hooks/useUserRole";
import { LuCodesandbox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { roleLoading, role } = useUserRole();

  return (
    <div className="drawer lg:drawer-open h-screen xl:container mx-auto">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Main Content Area */}
      <div className="drawer-content flex flex-col overflow-y-auto">
        {/* Mobile Navbar */}
        <div className="navbar bg-base-300 w-full lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 font-bold px-2 flex gap-2 items-center">
            <img
              src={user?.photoURL}
              alt={user?.displayName}
              className="h-14 w-14 object-cover rounded-full"
            />
            <span>{user?.displayName} Dashboard</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="mt-12 mb-16">
          <Outlet />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40 lg:fixed lg:top-0 lg:left-0 lg:h-screen">
        <label
          htmlFor="my-drawer-2"
          className="drawer-overlay lg:hidden"
        ></label>

        {/* ✅ Keep sidebar scrollable and single-column */}
        <ul className="menu bg-base-200 text-base-content w-60 lg:w-64 p-4 h-full overflow-y-auto flex flex-col flex-nowrap hide-scrollbar">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 mb-4">
            <img
              src={logo}
              alt="Sam's Kitchen Logo"
              className="h-12 lg:h-14 w-auto"
            />
            <span className="text-[#392B12] font-bold text-lg">
              Sam's Kitchen
            </span>
          </Link>

          {/* Navigation Links */}
          <li className="my-1 font-semibold">
            <NavLink className="rounded-md" to="/dashboard" end>
              <TbLayoutDashboard size={19} /> Dashboard
            </NavLink>
          </li>
          <li className="my-1 font-semibold">
            <NavLink className="rounded-md" to="/dashboard/manageProfile">
              <FiUser size={17} /> Manage Profile
            </NavLink>
          </li>

          <li className="my-1 font-semibold">
            <NavLink className="rounded-md" to="/dashboard/myOrders">
              <LuCodesandbox size={18} /> My Orders
            </NavLink>
          </li>

          {!roleLoading && role === "admin" && (
            <>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/addFood">
                  <FiPlusCircle size={18} /> Add Food
                </NavLink>
              </li>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/manageFoods">
                  <IoFastFoodOutline size={20} /> Manage Foods
                </NavLink>
              </li>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/manageUsers">
                  <FaUsers size={20} /> Manage Users
                </NavLink>
              </li>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/pendingRiders">
                  <FaUserClock size={20} /> Pending Riders
                </NavLink>
              </li>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/assignRider">
                  <FaMotorcycle size={20} /> Assign Rider
                </NavLink>
              </li>
            </>
          )}

          {!roleLoading && role === "customer" && (
            <>
              <li className="my-1 font-semibold">
                <NavLink className="rounded-md" to="/dashboard/beARider">
                  <FaMotorcycle size={20} /> Be a Rider
                </NavLink>
              </li>
            </>
          )}

          {!roleLoading && role === "rider" && (
            <>
              <li className="my-1 font-semibold">
                <NavLink
                  className="rounded-md"
                  to="/dashboard/pendingDeliveries"
                >
                  <FaTasks size={16} /> Pending Deliveries
                </NavLink>
              </li>
              <li className="my-1 font-semibold">
                <NavLink
                  className="rounded-md"
                  to="/dashboard/completedDeliveries"
                >
                  <FaCheckCircle size={16} /> Completed Deliveries
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
