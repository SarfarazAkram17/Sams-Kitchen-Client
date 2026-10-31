import { Link, NavLink } from "react-router";
import logo from "../../assets/images/logo.png";
import { RxCross2 } from "react-icons/rx";
import { useState, useRef, useEffect } from "react";
import { RiMenu2Line } from "react-icons/ri";
import { FiLogOut, FiPlusCircle, FiUser } from "react-icons/fi";
import { TbLayoutDashboard } from "react-icons/tb";
import { LuChefHat, LuCodesandbox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import {
  FaCheckCircle,
  FaTasks,
  FaUserClock,
  FaUsers,
  FaMotorcycle,
  FaWallet,
  FaMoneyBillWave,
} from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import useUserRole from "../../Hooks/useUserRole";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, userEmail, logOutUser } = useAuth();
  const { roleLoading, role } = useUserRole();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // Ref for mobile menu

  const displayName =
    user?.displayName?.trim() || userEmail?.split("@")[0] || "Your account";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const roleLabel = roleLoading
    ? "Loading role"
    : role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Member";

  // Dashboard links (same role logic as DashboardLayout)
  const commonLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: TbLayoutDashboard,
      end: true,
    },
    { to: "/dashboard/manageProfile", label: "Manage Profile", icon: FiUser },
  ];

  const roleLinks = roleLoading
    ? []
    : role === "admin"
      ? [
          {
            to: "/dashboard/kitchenOrders",
            label: "Kitchen Orders",
            icon: LuChefHat,
          },
          { to: "/dashboard/addFood", label: "Add Food", icon: FiPlusCircle },
          {
            to: "/dashboard/manageFoods",
            label: "Manage Foods",
            icon: IoFastFoodOutline,
          },
          {
            to: "/dashboard/manageUsers",
            label: "Manage Users",
            icon: FaUsers,
          },
          {
            to: "/dashboard/pendingRiders",
            label: "Pending Riders",
            icon: FaUserClock,
          },
          {
            to: "/dashboard/cashoutRequests",
            label: "Cashout Requests",
            icon: FaMoneyBillWave,
          },
        ]
      : role === "customer"
        ? [
            {
              to: "/dashboard/myOrders",
              label: "My Orders",
              icon: LuCodesandbox,
            },
            {
              to: "/dashboard/beARider",
              label: "Be a Rider",
              icon: FaMotorcycle,
            },
          ]
        : role === "rider"
          ? [
              {
                to: "/dashboard/pendingDeliveries",
                label: "Pending Deliveries",
                icon: FaTasks,
              },
              {
                to: "/dashboard/completedDeliveries",
                label: "Completed Deliveries",
                icon: FaCheckCircle,
              },
              {
                to: "/dashboard/cashouts",
                label: "Cashouts",
                icon: FaWallet,
              },
            ]
          : [];

  const dashboardLinks = [...commonLinks, ...roleLinks];

  // Close the daisyUI dropdown by removing focus from it
  const closeProfileMenu = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logOutUser();
      closeProfileMenu();
      toast.warn("You Logout from Sam's Kitchen");
    } catch (error) {
      toast.error(error.message || "Could not complete sign out.");
    }
  };

  const navLinkClass =
    "shared-route-link px-3 py-2 text-xs lg:text-sm font-semibold";

  const navLinks = (
    <>
      <NavLink
        onClick={() => setIsOpen(false)}
        className={navLinkClass}
        to="/"
        end
      >
        Home
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className={navLinkClass}
        to="/about"
      >
        About Us
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className={navLinkClass}
        to="/allFoods"
      >
        All Foods
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className={navLinkClass}
        to="/offers"
      >
        Offers
      </NavLink>
    </>
  );

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Shared avatar renderer (photo or initial fallback)
  const Avatar = () =>
    user?.photoURL ? (
      <img
        src={user.photoURL}
        alt=""
        className="size-10 shrink-0 rounded-full object-cover cursor-pointer"
      />
    ) : (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold leading-none text-primary-content cursor-pointer">
        {avatarInitial}
      </span>
    );

  return (
    <div className="bg-base-100/95 p-0 shadow-sm backdrop-blur-xl border-b border-base-300">
      <div
        ref={menuRef}
        className="navbar min-h-[72px] px-2 sm:px-5 max-w-[1500px] mx-auto"
      >
        <div className="navbar-start min-w-0">
          <div className="mr-1 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
              className="btn btn-ghost"
            >
              {isOpen ? <RxCross2 size={20} /> : <RiMenu2Line size={20} />}
            </button>
          </div>

          <Link
            to="/"
            className="flex min-w-0 items-center gap-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img
              src={logo}
              alt="Sam's Kitchen Logo"
              className="h-10 md:h-14 w-auto bg-transparent object-contain"
            />
            <span className="text-base-content text-sm font-bold sm:text-base md:text-xl whitespace-nowrap tracking-tight">
              Sam's Kitchen
            </span>
          </Link>
        </div>

        <div className="hidden navbar-center items-center gap-1 lg:flex">
          {navLinks}
        </div>

        <div className="flex navbar-end items-center gap-2 sm:gap-3 relative">
          {/* Auth Section */}
          {user ? (
            <div className="dropdown dropdown-bottom dropdown-end">
              {/* Trigger: avatar only */}
              <button
                type="button"
                tabIndex={0}
                aria-label={`Open account menu for ${displayName}`}
                aria-haspopup="menu"
                className="inline-flex items-center justify-center rounded-full border border-base-300 bg-base-100 p-[3px] leading-none transition-colors hover:border-primary hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Avatar />
              </button>

              {/* Dropdown panel */}
              <div
                tabIndex={0}
                role="menu"
                className="dropdown-content z-[80] mt-3 flex max-h-[calc(100dvh-6rem)] w-72 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-base-300 bg-base-100 p-2.5 text-left text-base-content shadow-xl"
              >
                {/* Fixed: user info */}
                <div className="mb-1.5 flex shrink-0 items-center gap-3 border-b border-base-300 px-2 pb-3 pt-2">
                  <Avatar />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{displayName}</p>
                    <p className="break-all text-xs text-base-content/60">
                      {userEmail || "Signed-in account"}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {roleLabel}
                    </span>
                  </div>
                </div>

                {/* Scrollable (scrollbar hidden): role-based dashboard links */}
                <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {dashboardLinks.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      role="menuitem"
                      onClick={closeProfileMenu}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-primary/10 ${
                          isActive ? "bg-primary/10 text-primary" : ""
                        }`
                      }
                    >
                      <Icon aria-hidden="true" size={17} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* Fixed: sign out */}
                <div className="mt-1.5 shrink-0 border-t border-base-300 pt-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <FiLogOut aria-hidden="true" size={17} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink
                to="/login"
                className="shared-route-link btn btn-sm rounded-full px-4"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="shared-route-link btn btn-sm rounded-full px-4"
              >
                Create account
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%-4px)] left-3 right-3 z-[70] lg:hidden bg-base-100 border border-base-300 rounded-2xl p-3 shadow-xl">
            <ul className="menu w-full space-y-1">
              {navLinks}
              {!user && (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="shared-route-link mt-2 w-full justify-center py-2.5 text-sm font-semibold"
                  >
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="shared-route-link w-full justify-center py-2.5 text-sm font-semibold"
                  >
                    Create account
                  </NavLink>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;