import { toast } from "react-toastify";
import { addToCart } from "../../../CartUtils/cartUtils";
import useAuth from "../../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router";
import useAxios from "../../../Hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../../Components/Loading/Loading";
import FoodCard from "../../../Components/Shared/FoodCard";

const FeaturedFoods = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();

  // Fetch foods with pagination
  const { data: foods = [], isLoading } = useQuery({
    queryKey: ["randomFoods"],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods/random");
      return res.data;
    },
    keepPreviousData: true,
  });

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
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
        Featured Foods
      </h2>

      {foods.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No foods available yet.
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
        </>
      )}
    </div>
  );
};

export default FeaturedFoods;
