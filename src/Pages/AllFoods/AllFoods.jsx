import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "antd";
import { Link } from "react-router";
import { FiShoppingCart } from "react-icons/fi";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Components/Loading/Loading";

const AllFoods = () => {
  const axiosInstance = useAxios();
  const [page, setPage] = useState(1);

  // Fetch foods with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["allFoods", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods", {
        params: { page, limit: 12 }, // show 12 per page
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const foods = data?.foods || [];
  const total = data?.total || 0;

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
        All Foods
      </h2>

      {foods.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No foods available yet.
        </p>
      ) : (
        <>
          {/* Foods Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div
                key={food._id}
                className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-500 flex flex-col"
              >
                <img
                  src={food.images?.[0]}
                  alt={food.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {food.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex-grow">
                    {food.description?.length > 100
                      ? food.description.slice(0, 100) + "..."
                      : food.description}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Price:</strong> ৳{food.price.toFixed(2)}
                  </p>

                  <p className="text-sm mt-2">
                    <strong>Status:</strong>{" "}
                    {food.available ? (
                      <span className="text-green-600 font-medium">
                        Available
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Unavailable
                      </span>
                    )}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <Link to={`/foods/${food._id}`}>
                      <button className="btn btn-sm btn-outline btn-primary hover:text-white">
                        Details
                      </button>
                    </Link>
                    <button
                      disabled={!food.available}
                      className="btn btn-sm btn-outline btn-secondary disabled:text-black/50 hover:text-white"
                    >
                      <FiShoppingCart className="mr-1" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
