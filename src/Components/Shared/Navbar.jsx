import { Link, NavLink } from "react-router";
import logo from "../../assets/images/logo.png";
import { RxCross2 } from "react-icons/rx";
import { useState, useRef, useEffect } from "react";
import { RiMenu2Line } from "react-icons/ri";
import { FiLogOut, FiUser } from "react-icons/fi";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, userEmail, logOutUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // Ref for mobile menu

  const displayName =
    user?.displayName?.trim() || userEmail?.split("@")[0] || "Your account";
  const avatarInitial = displayName.charAt(0).toUpperCase();

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
    "px-3 py-0.5 text-xs lg:text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10";

  const navLinks = (
    <>
      <NavLink onClick={() => setIsOpen(false)} className={navLinkClass} to="/">
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
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold leading-none text-white cursor-pointer">
        {avatarInitial}
      </span>
    );

  return (
    <div className="bg-base-100 p-0 shadow-sm">
      <div ref={menuRef} className="navbar px-2 max-w-[1500px] mx-auto">
        <div className="navbar-start">
          <div className="md:hidden mr-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
              className="btn btn-ghost"
            >
              {isOpen ? <RxCross2 size={20} /> : <RiMenu2Line size={20} />}
            </button>
          </div>

          <Link to="/" className="flex items-center gap-1">
            <img
              src={logo}
              alt="Sam's Kitchen Logo"
              className="h-11 md:h-14 w-auto"
            />
            <span className="text-[#392B12] font-bold md:text-xl whitespace-nowrap">
              Sam's Kitchen
            </span>
          </Link>
        </div>

        <div className="hidden navbar-center md:flex items-center gap-1">
          {navLinks}
        </div>

        <div className="flex navbar-end items-center gap-6 relative">
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
                className="dropdown-content z-[80] mt-3 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-base-300 bg-base-100 p-2.5 text-left text-base-content shadow-xl"
              >
                <div className="mb-1.5 flex items-center gap-3 border-b border-base-300 px-2 pb-3 pt-2">
                  <Avatar />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{displayName}</p>
                    <p className="break-all text-xs text-base-content/60">
                      {userEmail || "Signed-in account"}
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  role="menuitem"
                  onClick={closeProfileMenu}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-primary/10"
                >
                  <FiUser aria-hidden="true" size={17} />
                  <span>Dashboard</span>
                </Link>

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
          ) : (
            <>
              <Link to="/login">
                <button className="btn bg-primary text-white border-2 border-primary hover:bg-transparent hover:text-primary">
                  Login
                </button>
              </Link>
              <Link to="/register" className="hidden md:inline -ml-4">
                <button className="btn bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-32 w-32 left-4 z-10 md:hidden bg-base-100 rounded-box p-2 place-items-center shadow">
            <ul className="menu space-y-2 text-center">
              {navLinks}
              {!user && (
                <Link to="/register">
                  <button className="btn bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white">
                    Register
                  </button>
                </Link>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;