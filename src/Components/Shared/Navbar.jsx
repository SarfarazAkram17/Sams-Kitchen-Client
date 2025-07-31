import { Link, NavLink } from "react-router";
import { useState } from "react";
import { RiMenu2Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import logo from "../../assets/logo.png";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, userEmail, logOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Active link styling
  const activeClass =
    "px-4 py-1 text-sm rounded-full font-bold text-primary bg-primary/10";
  const normalClass =
    "px-4 py-1 text-sm rounded-full font-semibold hover:font-bold hover:text-primary hover:bg-primary/10";

  const navLinks = (
    <>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? activeClass : normalClass)}
        onClick={() => setIsOpen(false)}
      >
        Home
      </NavLink>
      <NavLink
        to="/foods"
        className={({ isActive }) => (isActive ? activeClass : normalClass)}
        onClick={() => setIsOpen(false)}
      >
        Foods
      </NavLink>
      <NavLink
        to="/offers"
        className={({ isActive }) => (isActive ? activeClass : normalClass)}
        onClick={() => setIsOpen(false)}
      >
        Offers
      </NavLink>
      <NavLink
        to="/community"
        className={({ isActive }) => (isActive ? activeClass : normalClass)}
        onClick={() => setIsOpen(false)}
      >
        Community
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) => (isActive ? activeClass : normalClass)}
        onClick={() => setIsOpen(false)}
      >
        About Us
      </NavLink>
    </>
  );

  const handleLogout = () => {
    logOutUser()
      .then(() => {
        toast.warn("You Logout from TourNest");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <nav className="navbar sticky top-0 z-50 bg-base-100 shadow-sm p-3 px-4 md:px-8">
      {/* Left Section */}
      <div className="flex navbar-start items-center gap-2">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-ghost md:hidden"
        >
          <RiMenu2Line size={22} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sam's Kitchen Logo" className="h-16 w-auto" />
        </Link>
      </div>

      {/* Center Section - Desktop Nav */}
      <div className="hidden navbar-center md:flex items-center gap-1">
        {navLinks}
      </div>

      {/* Right Section */}
      <div className="flex navbar-end items-center gap-5">
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />{" "}
          </svg>
          <span className="badge badge-xs indicator-item">2</span>
        </div>

        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />{" "}
          </svg>
          <span className="badge badge-xs indicator-item">8</span>
        </div>

        {/* Auth Section */}
        {user ? (
          <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button">
              <img
                src={user.photoURL}
                alt="Profile"
                className="rounded-full object-cover w-13 mr-2 h-13 cursor-pointer"
              />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 w-56 rounded-box z-10 mt-1 space-y-2 text-center shadow"
            >
              <li className="text-xs">Hi, {user.displayName}</li>
              <li className="text-xs">{userEmail}</li>
              <NavLink
                className="px-4 py-1 font-semibold rounded-full text-sm"
                to="/dashboard"
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-sm font-bold w-[50%] mx-auto btn-error"
              >
                Logout
              </button>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className="btn bg-primary text-white border-2 border-primary hover:bg-transparent hover:text-primary">
                Login
              </button>
            </Link>
            <Link to="/register" className="hidden md:inline -ml-3">
              <button className="btn bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white">
                Register
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu - Fullscreen Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex">
          <div className="bg-base-100 w-64 p-5 flex flex-col gap-4 shadow-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="self-end btn btn-ghost"
            >
              <RxCross2 size={22} />
            </button>
            <div className="flex flex-col gap-3">{navLinks}</div>
            {!user && (
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <button className="btn btn-primary text-white w-full">
                  Register
                </button>
              </Link>
            )}
          </div>
          <div className="flex-1" onClick={() => setIsOpen(false)}></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
