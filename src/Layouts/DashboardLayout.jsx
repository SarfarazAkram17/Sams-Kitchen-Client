import { createElement, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import logo from "../assets/images/logo.png";
import useAuth from "../Hooks/useAuth";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiLogOut, FiPlusCircle, FiUser } from "react-icons/fi";
import {
  FaCheckCircle,
  FaTasks,
  FaUserClock,
  FaUsers,
  FaMotorcycle,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";
import useUserRole from "../Hooks/useUserRole";
import { LuChefHat, LuCodesandbox } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";
import Header from "../Components/Shared/Header";
import { toast } from "react-toastify";

const DashboardLayout = () => {
  const { user, userEmail, logOutUser } = useAuth();
  const { roleLoading, role } = useUserRole();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const mobileNavTriggerRef = useRef(null);
  const mobileNavRef = useRef(null);

  const displayName =
    user?.displayName?.trim() || userEmail?.split("@")[0] || "Your account";
  const initials = displayName.slice(0, 1).toUpperCase();
  const roleLabel = roleLoading
    ? "Loading role"
    : role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Member";

  const commonLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: TbLayoutDashboard,
      end: true,
    },
    { to: "/dashboard/manageProfile", label: "Manage Profile", icon: FiUser },
  ];

  const roleLinks =
    roleLoading || role === "admin"
      ? roleLoading
        ? []
        : [
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

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = mobileNavTriggerRef.current;
    const drawer = mobileNavRef.current;
    const focusableElements = drawer?.querySelectorAll(
      "a[href], button:not([disabled])",
    );
    const firstFocusable = focusableElements?.[0];
    const lastFocusable = focusableElements?.[focusableElements.length - 1];
    firstFocusable?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        return;
      }
      if (event.key !== "Tab" || !firstFocusable || !lastFocusable) return;

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (window.matchMedia("(max-width: 1023px)").matches) {
        trigger?.focus({ preventScroll: true });
      }
    };
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    try {
      await logOutUser();
      closeMobileNav();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Could not complete sign out.");
    }
  };

  /*
   * Sidebar layout:
   *  - top block (logo + "Workspace" label): fixed, never scrolls
   *  - nav: the ONLY scrollable part (flex-1 + min-h-0 + overflow-y-auto), scrollbar hidden
   *  - footer (profile / logout / back link): fixed, never scrolls
   */
  const sidebarContent = (
    <>
      <div className="shrink-0">
        <Link
          to="/"
          onClick={closeMobileNav}
          className="mb-7 flex w-fit items-center gap-2 rounded-xl"
        >
          <img
            src={logo}
            alt="Sam's Kitchen"
            className="h-12 w-auto object-contain"
          />
          <span className="font-bold tracking-tight text-base-content">
            Sam’s Kitchen
          </span>
        </Link>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-base-content/45">
          Workspace
        </p>
      </div>

      <div className="dashboard-nav-clip min-h-0 flex-1 overflow-hidden">
        <nav
          aria-label="Dashboard navigation"
          className="dashboard-nav-scroll h-full overflow-y-auto"
        >
          <ul className="space-y-1">
            {[...commonLinks, ...roleLinks].map(
              ({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `dashboard-nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "dashboard-nav-link-active"
                          : "text-base-content/65 hover:bg-primary/8 hover:text-primary"
                      }`
                    }
                  >
                    {createElement(Icon, { size: 18, "aria-hidden": true })}
                    <span>{label}</span>
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>

      <div className="mt-4 shrink-0 border-t border-base-300 pt-4">
        <Link
          to="/dashboard/manageProfile"
          onClick={closeMobileNav}
          className="mb-2 flex min-w-0 items-center gap-3 rounded-2xl border border-base-300 bg-base-100/75 p-3 transition-colors hover:border-primary/40 hover:bg-base-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Profile for ${displayName}`}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="size-11 shrink-0 rounded-full border border-base-300 object-cover"
            />
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-content">
              {initials}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span
              title={displayName}
              className="block truncate text-sm font-bold text-base-content"
            >
              {displayName}
            </span>
            <span
              title={userEmail}
              className="block truncate text-xs text-base-content/65"
            >
              {userEmail || "Email unavailable"}
            </span>
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {roleLabel}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-base-content/70 transition-colors hover:bg-error/10 hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
        >
          <FiLogOut size={17} aria-hidden="true" />
          <span>Log out</span>
        </button>
        <Link
          to="/"
          onClick={closeMobileNav}
          className="mt-1 flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-base-content/60 transition hover:bg-base-100 hover:text-primary"
        >
          <span aria-hidden="true">←</span> Back to restaurant
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-base-100 text-base-content">
      <header className="fixed inset-x-0 top-0 z-60">
        <Header />
      </header>

      <div className="min-h-dvh pt-16">
        <aside className="dashboard-sidebar fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col overflow-hidden border-r border-base-300 bg-base-200 px-4 py-6 lg:flex">
          {sidebarContent}
        </aside>

        <div className="min-w-0 lg:ml-64">
          <div className="flex min-h-14 items-center justify-between border-b border-base-300 bg-base-200 px-3 sm:px-5 lg:hidden">
            <div className="flex min-w-0 items-center gap-2.5">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-content">
                  {initials}
                </span>
              )}
              <span className="truncate text-sm font-semibold">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              ref={mobileNavTriggerRef}
              aria-label={
                mobileNavOpen
                  ? "Close dashboard navigation"
                  : "Open dashboard navigation"
              }
              aria-controls="dashboard-mobile-navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-base-300 bg-base-100 text-base-content transition hover:border-primary hover:text-primary"
            >
              {mobileNavOpen ? (
                <span aria-hidden="true" className="text-xl leading-none">
                  ×
                </span>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current"
                  strokeWidth="1.8"
                >
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>

          <div
            className={`fixed inset-x-0 bottom-0 top-16 z-50 transition-[visibility] duration-300 lg:hidden ${
              mobileNavOpen ? "visible" : "invisible"
            }`}
            aria-hidden={!mobileNavOpen}
          >
            <button
              type="button"
              aria-label="Close dashboard navigation"
              tabIndex={mobileNavOpen ? 0 : -1}
              onClick={closeMobileNav}
              className={`absolute inset-0 h-full w-full bg-[#10120f]/65 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                mobileNavOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />
            <aside
              id="dashboard-mobile-navigation"
              role="dialog"
              aria-modal={mobileNavOpen || undefined}
              aria-label="Dashboard navigation"
              ref={mobileNavRef}
              inert={!mobileNavOpen}
              tabIndex={-1}
              className={`dashboard-sidebar absolute inset-y-0 left-0 flex h-full w-[min(18rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-base-300 bg-base-200 px-4 py-6 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
                mobileNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {sidebarContent}
            </aside>
          </div>

          <main className="page-enter mx-auto min-h-[calc(100dvh-8rem)] w-full max-w-[1700px] px-3 py-6 sm:px-5 lg:px-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
