import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import { useLocation, useNavigate } from "react-router";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Components/Loading/Loading";
import useAuth from "../../Hooks/useAuth";
import { toast } from "react-toastify";
import { addToCart } from "../../CartUtils/cartUtils";
import FoodCard from "../../Components/Shared/FoodCard";

const Offers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();
  const [page, setPage] = useState(1);

  // Fetch foods with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["offerFoods", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods/offer", {
        params: { page, limit: 12 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const foods = data?.foods || [];
  const total = data?.total || 0;

  if (isLoading) return <Loading />;

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }

    addToCart(food._id);
  };

  return (
    <div className="py-6 max-w-5xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-2">
        Foods on sale
      </h2>
      <p className="text-gray-700 text-center mb-10">Choose your foods from here and avail discounts!</p>

      {foods.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No foods on sale yet.
        </p>
      ) : (
        <>
          {/* Foods Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => {
              const discountedPrice =
                food.discount > 0
                  ? food.price - (food.price * food.discount) / 100
                  : food.price;

              return (
                <FoodCard
                  key={food._id}
                  food={food}
                  discountedPrice={discountedPrice}
                  handleAddToCart={handleAddToCart}
                ></FoodCard>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-10">
            <Pagination
              current={page}
              align="center"
              total={total}
              pageSize={10}
              showSizeChanger={false}
              onChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Offers;
