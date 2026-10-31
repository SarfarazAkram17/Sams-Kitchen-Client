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
  const drawerRef = useRef(null);

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

  const {
    data: foods,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["foods", cartFoodIds],
    queryFn: async () => {
      const res = await axiosInstance.post(`/foods/cart`, { ids: cartFoodIds });
      return res.data;
    },
    enabled: cartFoodIds.length > 0,
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

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target)
      ) {
        setIsDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Open cart with ${cartQuantity} items`}
        className="indicator grid size-10 place-items-center rounded-full text-primary-content transition hover:bg-primary-content/10 cursor-pointer"
      >
        <PiShoppingCartBold size={23} />
        <span className="indicator-item grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-bold text-secondary-content -translate-x-px! translate-y-px!">
          {cartQuantity}
        </span>
      </button>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-[100] flex h-full w-72 flex-col bg-base-100 text-base-content shadow-2xl transition-transform duration-300 sm:w-96 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-base-300 p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PiShoppingCartBold size={25} /> Shopping Cart
          </h3>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-base-content/60 transition hover:bg-base-200 hover:text-primary"
          >
            <RxCross2 />
          </button>
        </div>

        {/* Scroll container: flex column so empty/error states can fill and center */}
        <div className="hide-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
          {isLoading ? (
            <div className="space-y-3 py-5" aria-label="Loading cart items">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-xl border border-base-300 p-3"
                >
                  <div className="size-16 animate-pulse rounded-lg bg-base-200" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-base-300" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-base-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
              <p className="font-semibold">Your cart could not be loaded.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="btn btn-sm btn-outline mt-4"
              >
                Try again
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            // Empty state: centered in the available space
            <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
              <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
                <PiShoppingCartBold className="text-3xl" />
              </div>
              <h4 className="mt-5 mb-2 font-semibold sm:text-lg">
                Your cart is waiting.
              </h4>
              <p className="max-w-xs text-xs leading-5 text-base-content/60 sm:text-sm">
                Browse the menu and add something freshly made to your order.
              </p>
            </div>
          ) : (
            // Cart Items
            <div className="space-y-4 pt-6 mb-16">
              {cartItems.map((item) => {
                const foodItem = foods?.find(
                  (food) => food._id === item.foodId,
                );
                if (!foodItem) return null;

                return (
                  <div
                    key={item.foodId}
                    className="flex items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200 p-2 pr-3"
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
                            type="button"
                            aria-label={`Decrease ${foodItem.name} quantity`}
                            onClick={() =>
                              updateCartQuantity(item.foodId, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                            className="cursor-pointer px-1 text-sm font-bold hover:text-primary disabled:cursor-no-drop disabled:opacity-40 disabled:text-base-content/40 sm:px-2 sm:text-lg"
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
                            type="button"
                            aria-label={`Increase ${foodItem.name} quantity`}
                            onClick={() =>
                              updateCartQuantity(item.foodId, item.quantity + 1)
                            }
                            className="cursor-pointer px-1 text-sm font-bold hover:text-primary sm:px-2 sm:text-lg"
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
                            ৳ {(foodItem.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${foodItem.name} from cart`}
                        className="grid size-8 place-items-center rounded-full text-base-content/50 transition hover:bg-error/10 hover:text-error"
                        onClick={() => removeFromCart(item.foodId)}
                      >
                        <FaRegTrashCan aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Card with Proceed to Checkout */}
        <div className="w-full border-t border-base-300 bg-base-100 p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-base-content/70">
              Total
            </span>
            <span className="text-xl font-bold text-primary">৳ {total}</span>
          </div>
          {cartItems.length === 0 ? (
            <button
              type="button"
              disabled
              className="btn btn-primary mt-2 w-full"
            >
              Proceed To Order
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate("/placeOrder");
                setIsDrawerOpen(false);
              }}
              className="btn btn-primary w-full mt-2"
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