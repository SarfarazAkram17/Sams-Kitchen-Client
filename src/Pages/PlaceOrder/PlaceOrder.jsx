import { useState, useEffect } from "react";
import { getCart } from "../../CartUtils/cartUtils";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading/Loading";
import useAxios from "../../Hooks/useAxios";
import PlaceOrderForm from "./PlaceOrderForm";
import { BsCart3 } from "react-icons/bs";
import { useNavigate } from "react-router";

const PlaceOrder = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);

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
      const res = await axiosInstance.post(`/foods/cart`, { ids: cartFoodIds });
      return res.data;
    },
    enabled: !!cartFoodIds,
  });

  useEffect(() => {
    const cartUpdateInterval = setInterval(() => {
      const cart = getCart();
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartQuantity(total);
    }, 50);

    return () => clearInterval(cartUpdateInterval);
  }, []);

  if (isLoading) {
    return <Loading></Loading>;
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const foodItem = foods?.find((food) => food._id === item.foodId);
    if (!foodItem) return sum;
    return sum + foodItem.price * item.quantity;
  }, 0);

  const discount = cartItems.reduce((sum, item) => {
    const foodItem = foods?.find((food) => food._id === item.foodId);
    if (!foodItem || foodItem.discount <= 0) return sum;
    const discountAmount =
      ((foodItem.price * foodItem.discount) / 100) * item.quantity;
    return sum + discountAmount;
  }, 0);

  let deliveryCharge =
    cartItems.length > 1 ? 50 : cartItems.length === 1 ? 30 : 0;

    if (subtotal + deliveryCharge - discount >= 1000) {
      deliveryCharge = 0;
    }

  const total = subtotal + deliveryCharge - discount;
  
  return (
    <div className="flex flex-col-reverse lg:flex-row justify-start lg:justify-center items-start gap-8 py-10">
      {/* Left Section: Personal & Delivery Details Form */}
      <div className="lg:w-[62%] w-full">
        <PlaceOrderForm cartItems={cartItems} foods={foods}></PlaceOrderForm>
      </div>
      {/* Right Section: Order Summary */}
      <div className="bg-white shadow-lg w-full rounded-xl overflow-hidden lg:w-[38%]">
        <div className="bg-primary p-4 rounded-t-xl mb-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Order Summary</h2>{" "}
            <p className="text-[11px]">Review your items before place order</p>
          </div>
          <div className="bg-white/25 border-white/50 border rounded-full py-1 px-4 text-sm">
            {cartQuantity > 1 ? (
              <>{cartQuantity} items</>
            ) : cartQuantity === 1 ? (
              "1 item"
            ) : (
              "0 items"
            )}
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
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
                      <div className="ml-4 space-y-1 sm:space-y-3">
                        <h4 className="font-bold text-xs sm:text-[0.9rem] px-1">
                          {foodItem?.name}
                        </h4>
                        <div className="flex w-fit items-center h-5 sm:h-6 border border-gray-400 rounded-lg">
                          <span className="text-[8px] sm:text-xs font-semibold px-2.5">
                            {item.quantity} x ৳
                            {foodItem.discount > 0
                              ? (
                                  foodItem.price -
                                  (foodItem.price * foodItem.discount) / 100
                                ).toFixed(2)
                              : foodItem.price}
                          </span>
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
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex bg-sky-50 rounded-lg flex-col items-center justify-center h-full pt-6 pb-16 sm:py-6">
                <div className="lg:h-24 h-32 lg:w-24 w-32 flex justify-center items-center rounded-full animate-pulse p-4 bg-red-200 shadow">
                  <BsCart3 className="text-red-600 sm:text-4xl text-5xl" />
                </div>
                <h4 className="font-semibold text-lg sm:text-[1rem] mt-6 mb-3">
                  Your Cart is empty.
                </h4>
                <p className="sm:text-xs text-sm max-w-xs mx-auto text-center">
                  No items added in your cart. Please add product to your cart
                  list.
                </p>

                <button
                  onClick={() => navigate("/allFoods")}
                  className="btn btn-primary text-white mt-6"
                >
                  Start Ordering
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-[13px] text-gray-500">Subtotal</span>
            <span className="text-[12px] text-green-600 font-semibold">
              ৳ {subtotal.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-[13px] text-gray-500">Delivery Charge</span>
            <span className="text-[12px] font-semibold text-primary">
              ৳ {deliveryCharge.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-[13px] text-gray-500">Discount</span>
            <span className="text-[12px] text-warning font-semibold">
              -৳ {discount.toFixed(2)}
            </span>
          </div>
          <div className="divider"></div>
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total Amount:</span>
            <span className="text-green-600">৳ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
