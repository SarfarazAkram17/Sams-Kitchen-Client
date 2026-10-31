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
import EmptyState from "../../Components/Shared/EmptyState";

const AllFoods = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();
  const [page, setPage] = useState(1);

  // Fetch foods with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["allFoods", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods", {
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
    <div className="max-w-[1500px] mx-auto px-4 mb-16">
      <header className="mb-9 border-b border-base-300 pb-7 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-primary">
          Cooked fresh, just for you
        </p>
        <h1 className="font-display text-5xl text-base-content sm:text-6xl">
          From our kitchen
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-base-content/65">
          Familiar Bangladeshi favorites, made to order and ready to share.
        </p>
      </header>

      {foods.length === 0 ? (
        <EmptyState
          title="The menu is resting"
          description="There are no dishes to show right now. Please check back soon."
        />
      ) : (
        <>
          {/* Foods Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              pageSize={12}
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

export default AllFoods;
