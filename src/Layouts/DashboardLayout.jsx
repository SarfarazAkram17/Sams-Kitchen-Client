import { Link, NavLink, Outlet } from "react-router";
import logo from "../assets/images/logo.png";
import useAuth from "../Hooks/useAuth";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiUser } from "react-icons/fi";

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="drawer lg:drawer-open h-screen">
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
        <ul className="menu bg-base-200 text-base-content w-64 p-4 h-full overflow-y-auto flex flex-col flex-nowrap hide-scrollbar">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 mb-4">
            <img src={logo} alt="Sam's Kitchen Logo" className="h-14 w-auto" />
            <span className="text-[#392B12] font-bold sm:text-xl">
              Sam's Kitchen
            </span>
          </Link>

          {/* Navigation Links */}
          <li className="my-1 font-semibold">
            <NavLink to="/dashboard" end>
              <TbLayoutDashboard size={19} /> Dashboard
            </NavLink>
          </li>
          <li className="my-1 font-semibold">
            <NavLink to="/dashboard/manageProfile">
              <FiUser size={17} /> Manage Profile
            </NavLink>
          </li>
          <li className="my-1 font-semibold">
            <NavLink to="/dashboard/changePassword">
              <FiUser size={17} /> Change Password
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
