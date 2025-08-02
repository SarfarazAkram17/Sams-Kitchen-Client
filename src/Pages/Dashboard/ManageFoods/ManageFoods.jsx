import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Loading from "../../../Components/Loading/Loading";
import { Pagination } from "antd";
import useAuth from "../../../Hooks/useAuth";

const ManageFoods = () => {
  const {userEmail} = useAuth()
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const [page, setPage] = useState(1);

  // Fetch foods
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["foods", page],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods", {
        params: { page, limit: 10 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const foods = data?.foods || [];
  const total = data?.total || 0;

  // Delete food
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This food item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/foods/${id}?email=${userEmail}`);
          if (res.data.deletedCount) {
            Swal.fire("Deleted!", "The food has been deleted.", "success");
            refetch();
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
        Manage Foods
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
                className="border h-full rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-500"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-semibold text-primary">
                    {food.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    <strong>Added On:</strong>{" "}
                    {new Date(food.addedAt).toLocaleString("en-BD")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {food.description}
                  </p>

                  <p className="text-sm">
                    <strong>Price:</strong>৳ {food.price.toFixed(2)}
                  </p>

                  <p className="text-sm">
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
                    <div className="flex gap-2">
                      <Link to={`/dashboard/editFood/${food._id}`}>
                        <button className="btn btn-sm btn-outline btn-primary hover:text-white">
                          <FiEdit3 className="mr-1" /> Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="btn btn-sm btn-outline btn-error"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </div>
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

export default ManageFoods;