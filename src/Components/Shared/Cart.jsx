import Loading from "../Loading/Loading";
import { PiShoppingCartBold } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../CartUtils/cartUtils";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import { RxCross2 } from "react-icons/rx";
import { useEffect, useState, useRef } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null); // 🔹 Ref for drawer

  useEffect(() => {
    const cart = getCart();
    setCartItems(cart);
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartQuantity(total);
  }, []);

  useEffect(() => {
    const cartUpdateInterval = setInterval(() => {
      const cart = getCart();
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartQuantity(total);
    }, 300);

    return () => clearInterval(cartUpdateInterval);
  }, []);

  const cartFoodIds = cartItems.map((item) => item.foodId);

  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods", cartFoodIds],
    queryFn: async () => {
      const res = await axiosInstance.post(`/foods/cart`, { ids: cartFoodIds });
      return res.data;
    },
    enabled: !!cartFoodIds,
  });

  const calculateCartTotal = () => {
    if (isLoading) return 0;
    if (!foods || !Array.isArray(foods) || foods.length === 0) return 0;

    let total = 0;
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      const cartItem = cartItems.find((item) => item.foodId === food._id);

      if (food.discount > 0) {
        const price = food.price - (food.price * food.discount) / 100;
        total += price * cartItem.quantity;
      } else {
        total += food.price * cartItem.quantity;
      }
    }
    return total.toFixed(2);
  };

  const total = calculateCartTotal();

  // 🔹 Close drawer on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  return (
    <div>
      {/* 🛒 Cart Indicator */}
      <div
        onClick={() => setIsDrawerOpen(true)}
        className="indicator cursor-pointer"
      >
        <PiShoppingCartBold size={25} />
        <span className="text-xs bg-[#C5102C] text-white flex justify-center items-center rounded-full h-4.5 w-4.5 indicator-item">
          {cartQuantity}
        </span>
      </div>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-72 sm:w-96 bg-white z-50 shadow-lg transition-all duration-500 transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PiShoppingCartBold size={25} /> Shopping Cart
          </h3>
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
                <PiShoppingCartBold className="text-red-600 text-4xl sm:text-5xl" />
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
            <div className="space-y-4 pt-6 mb-16">
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
                        className="h-12 sm:h-16 w-15 sm:w-20 object-cover rounded-md"
                      />
                      <div className="ml-4 space-y-1 sm:space-y-3 px-0.5">
                        <h4 className="font-bold text-xs sm:text-[1rem]">
                          {foodItem?.name}
                        </h4>
                        <div className="flex w-fit items-center h-5 sm:h-6 border border-gray-400 rounded-md">
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
                      <div>
                        {foodItem.discount > 0 ? (
                          <div>
                            <span className="line-through whitespace-nowrap block text-[10px] sm:text-xs text-gray-400">
                              ৳ {(foodItem.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-green-600 whitespace-nowrap text-xs sm:text-sm block font-semibold">
                              ৳{" "}
                              {(
                                (foodItem.price -
                                  (foodItem.price * foodItem.discount) / 100) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-green-600 whitespace-nowrap text-xs sm:text-sm font-semibold">
                            ৳ {foodItem.price * item.quantity.toFixed(2)}
                          </span>
                        )}
                      </div>
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
            <span className="text-xl font-bold text-green-600">৳ {total}</span>
          </div>
          {cartItems.length === 0 ? (
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="btn bg-red-600 text-white w-full mt-2"
            >
              Proceed To Order
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/placeOrder");
                setIsDrawerOpen(false);
              }}
              className="btn bg-red-600 text-white w-full mt-2"
            >
              Proceed To Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;