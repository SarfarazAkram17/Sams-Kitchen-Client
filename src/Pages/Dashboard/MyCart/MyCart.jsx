import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCart, updateCartQuantity } from "../../../CartUtils/cartUtils";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Components/Loading/Loading";
import { BsCart3 } from "react-icons/bs";
import { Link } from "react-router";

const MyCart = () => {
  const axiosInstance = useAxios();
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

  return (
    <div className="px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
        Your Cart, Total items: {cartQuantity}
      </h2>

      {isLoading ? (
        <Loading></Loading>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="h-40 w-40 flex justify-center items-center rounded-full animate-pulse p-4 bg-red-200 shadow">
            <BsCart3 size={60} className="text-red-600" />
          </div>
          <h4 className="font-semibold text-lg mt-6 mb-3">
            Your Cart is empty.
          </h4>
          <p className="text-sm max-w-sm mx-auto text-center">
            No items added in your cart. Please add product to your cart list.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const foodItem = foods?.find((food) => food._id === item.foodId);
            return (
              <div
                key={item.foodId}
                className="flex justify-between items-center bg-base-200 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <img
                    src={foodItem?.image}
                    alt={foodItem?.name}
                    className="h-20 w-24 object-cover rounded-md"
                  />
                  <div className="ml-4 space-y-4">
                    <h4 className="font-semibold">{foodItem?.name}</h4>
                    <div className="flex items-center h-8 border border-gray-400 rounded-lg">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.foodId, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                        className="px-3 cursor-pointer disabled:cursor-no-drop py-2 text-xl font-bold disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-4 font-semibold">
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
                        className="px-3 cursor-pointer py-2 text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-md">
                    {foodItem.discount > 0 ? (
                      <div className="space-y-1">
                        <span className="line-through block text-xs text-gray-400">
                          ৳ {(foodItem.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-green-600 block font-semibold">
                          ৳{" "}
                          {(
                            (foodItem.price -
                              (foodItem.price * foodItem.discount) / 100) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-green-500 font-semibold">
                        ৳ {foodItem.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-6 justify-between items-center mt-4">
            <p className="text-xl font-semibold">
              Total: ৳{calculateCartTotal().toFixed(2)}
            </p>
            <Link
              to={{
                pathname: "/placeOrder",
                state: {
                  cartItems,
                  foods,
                },
              }}
              className="btn bg-primary text-white py-2 px-6"
            >
              Proceed to order
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCart;
