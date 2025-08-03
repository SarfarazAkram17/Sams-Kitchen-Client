import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../assets/images/logo.png";
import { RxCross2 } from "react-icons/rx";
import { useEffect, useState } from "react";
import { RiMenu2Line } from "react-icons/ri";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../CartUtils/cartUtils";
import useAxios from "../../Hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Loading/Loading";
import { BsCart3 } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userEmail, logOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const axiosInstance = useAxios();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const cart = getCart();
    setCartItems(cart);
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartQuantity(total);
  }, []);

  const cartFoodIds = cartItems.map((item) => item.foodId);

  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods", cartFoodIds],
    queryFn: async () => {
      const res = await axiosInstance.post(`/cartFoods`, { ids: cartFoodIds });
      return res.data;
    },
    enabled: !!cartFoodIds,
  });

  const calculateCartTotal = () => {
    return cartItems.reduce(
      (sum, item) =>
        sum +
        (foods?.find((food) => food._id === item.foodId)?.price || 0) *
          item.quantity,
      0
    );
  };

  useEffect(() => {
    const cartUpdateInterval = setInterval(() => {
      const cart = getCart();
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartQuantity(total);
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

        <div
          onClick={() => setIsDrawerOpen(true)}
          className="indicator cursor-pointer"
        >
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
        <div className="absolute top-full w-32 -mt-2 left-4 z-10 md:hidden bg-base-100 rounded-box p-2 place-items-center shadow">
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

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-96 bg-white z-50 shadow-lg transition-all transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">Shopping Cart</h3>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="hover:text-red-500 text-2xl cursor-pointer"
          >
            <RxCross2 />
          </button>
        </div>

        <div
          className="overflow-y-auto hide-scrollbar px-1"
          style={{ maxHeight: "calc(100% - 120px)" }}
        >
          {/* If Cart is Empty */}
          {isLoading ? (
            <Loading />
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pt-6 pb-16 sm:py-6">
              <div className="h-24 sm:h-32 w-24 sm:w-32 flex justify-center items-center rounded-full animate-pulse p-4 bg-red-200 shadow">
                <BsCart3 className="text-red-600 text-4xl sm:text-5xl" />
              </div>
              <h4 className="font-semibold sm:text-lg mt-6 mb-3">
                Your Cart is empty.
              </h4>
              <p className="text-xs sm:text-sm max-w-xs mx-auto text-center">
                No items added in your cart. Please add product to your cart
                list.
              </p>
            </div>
          ) : (
            // Cart Items
            <div className="space-y-4 pt-6 pb-16 sm:py-6">
              {cartItems.map((item) => {
                const foodItem = foods?.find(
                  (food) => food._id === item.foodId
                );
                return (
                  <div
                    key={item.foodId}
                    className="flex justify-between items-center bg-base-200 rounded-lg p-2 pr-3"
                  >
                    <div className="flex items-center">
                      <img
                        src={foodItem?.image}
                        alt={foodItem?.name}
                        className="h-10 sm:h-16 w-13 sm:w-20 object-cover rounded-md"
                      />
                      <div className="ml-4 space-y-1 sm:space-y-3">
                        <h4 className="font-bold text-xs sm:text-[1rem]">
                          {foodItem?.name}
                        </h4>
                        <div className="flex items-center h-5 sm:h-6 border border-gray-400 rounded-md">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.foodId, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                            className="cursor-pointer hover:text-red-500 disabled:text-black/60 px-1 sm:px-2 disabled:cursor-no-drop text-sm sm:text-lg font-bold disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="text-[8px] sm:text-xs font-semibold">
                            {item.quantity} x ৳
                            {foodItem.discount > 0
                              ? (
                                  foodItem.price -
                                  (foodItem.price * foodItem.discount) / 100
                                ).toFixed(2)
                              : foodItem.price}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.foodId, item.quantity + 1)
                            }
                            className="cursor-pointer hover:text-red-500 sm:px-2 px-1 text-sm sm:text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 sm:gap-3">
                      <p>
                        {foodItem.discount > 0 ? (
                          <div>
                            <span className="line-through block text-[10px] sm:text-xs text-gray-400">
                              ৳ {(foodItem.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-green-600 text-xs sm:text-sm block font-semibold">
                              ৳{" "}
                              {(
                                (foodItem.price -
                                  (foodItem.price * foodItem.discount) / 100) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-green-600 text-xs sm:text-sm font-semibold">
                            ৳ {foodItem.price * item.quantity.toFixed(2)}
                          </span>
                        )}
                      </p>
                      <FaRegTrashCan
                        className="hover:text-red-500 cursor-pointer"
                        onClick={() => removeFromCart(item.foodId)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Card with Proceed to Checkout */}
        <div className="w-full p-4 border-t fixed bottom-0 left-0 bg-white">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total:</span>
            <span className="text-xl font-bold text-green-600">
              ৳{calculateCartTotal().toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => {
              navigate("/placeOrder", {
                state: {
                  cartItems,
                  foods,
                },
              }),
                setIsDrawerOpen(false);
            }}
            className="btn bg-red-600 text-white w-full mt-2"
          >
            Proceed To Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
