import { Link, NavLink } from "react-router";
import logo from "../../assets/images/logo.png";
import { RxCross2 } from "react-icons/rx";
import { useState, useEffect } from "react";
import { RiMenu2Line } from "react-icons/ri";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import { getCart } from "../../CartUtils/cartUtils";

const Navbar = () => {
  const { user, userEmail, logOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  const calculateTotalQuantity = () => {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartQuantity(total);
  };

  useEffect(() => {
    calculateTotalQuantity();
  }, []);

  useEffect(() => {
    const cartUpdateInterval = setInterval(() => {
      calculateTotalQuantity();
    }, 50);

    return () => clearInterval(cartUpdateInterval);
  }, []);

  const navLinks = (
    <>
      <NavLink
        onClick={() => setIsOpen(false)}
        className="px-3 py-0.5 text-xs lg:text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10"
        to="/"
      >
        Home
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className="px-3 py-0.5 text-xs lg:text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10"
        to="/about"
      >
        About Us
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className="px-3 py-0.5 text-xs lg:text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10"
        to="/community"
      >
        Community
      </NavLink>
      <NavLink
        onClick={() => setIsOpen(false)}
        className="px-3 py-0.5 text-xs lg:text-sm rounded-full font-bold hover:text-primary hover:bg-primary/10"
        to="/allFoods"
      >
        All Foods
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
    <div className="navbar sticky z-50 bg-base-100 p-3 shadow-sm top-0">
      <div className="navbar-start">
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="btn btn-ghost">
            {isOpen ? <RxCross2 size={20} /> : <RiMenu2Line size={20} />}
          </button>
        </div>

        <Link to="/" className="flex items-center gap-1 ml-2 md:ml-0">
          <img src={logo} alt="Sam's Kitchen Logo" className="h-14 w-auto" />
          <span className="text-[#392B12] font-bold sm:text-xl">
            Sam's Kitchen
          </span>
        </Link>
      </div>

      <div className="hidden navbar-center md:flex items-center gap-1">
        {navLinks}
      </div>

      <div className="flex navbar-end items-center gap-6">
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6.5 w-6.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="text-xs bg-[#C5102C] text-white flex justify-center items-center rounded-full h-4.5 w-4.5 indicator-item">
            0
          </span>
        </div>

        {/* Other Indicators */}
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6.5 w-6.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs bg-[#C5102C] text-white flex justify-center items-center rounded-full h-4.5 w-4.5 indicator-item">
            {cartQuantity}
          </span>
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
        <div className="absolute top-full w-40 -mt-2 left-4 z-10 md:hidden bg-base-100 rounded-box p-2 place-items-center shadow">
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
  );
};

export default Navbar;
