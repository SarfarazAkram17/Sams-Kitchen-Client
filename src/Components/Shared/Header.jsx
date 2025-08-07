import { useState, useRef, useEffect } from "react";
import Cart from "./Cart";
import Notification from "./Notification";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import { useNavigate } from "react-router";
import { ConfigProvider, Rate } from "antd";

const Header = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track modal visibility
  const modalRef = useRef(null); // Reference for the modal container
  const axiosInstance = useAxios();
  const navigate = useNavigate();

  // Query for searching foods
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["search-food", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const res = await axiosInstance.get(`/foods/search?name=${search}`);
      return res.data;
    },
    enabled: !!search.trim(),
  });

  // Handle click outside of the modal to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false); // Close modal if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Detect clicks outside
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener
    };
  }, []);

  // Open modal when search is not empty
  useEffect(() => {
    if (search.trim()) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [search]);

  const handleSearchClick = () => {
    if (search.trim() && !isModalOpen) {
      setIsModalOpen(true); // Open modal if it's closed and there is search text
      refetch(); // Re-fetch data if search text exists and modal was previously closed
    }
  };

  const calculateDiscountedPrice = (food) => {
    const discountedPrice =
      food.discount > 0
        ? food.price - (food.price * food.discount) / 100
        : food.price;
    return discountedPrice;
  };

  return (
    <div className="relative">
      <div className="flex justify-between bg-neutral py-2 px-4 sm:px-8">
        <div className="w-[70%] relative">
          <label className="input w-full">
            <svg
              className="h-[1.2em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="3"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              onClick={handleSearchClick}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search for foods (e.g. pizza, burger, cake)"
            />
          </label>

          {/* Search Result Modal */}
          {isModalOpen && (
            <div
              ref={modalRef}
              className="absolute top-9 p-2 left-0 mt-2 w-full bg-white rounded shadow-lg max-h-64 overflow-y-auto z-50"
            >
              {isLoading ? (
                <p className="p-4 text-center text-sm text-gray-500 animate-pulse">
                  Searching...
                </p>
              ) : searchResults?.length > 0 ? (
                searchResults.map((food) => (
                  <div
                    key={food._id}
                    onClick={() => {
                      navigate(`/foods/${food._id}`);
                      setIsModalOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100 px-4 py-3 rounded-md flex justify-between items-start gap-4"
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-20 h-16 object-cover rounded"
                      />
                      <div className="space-y-2">
                        <p className="font-medium">{food.name}</p>

                        <p className="text-sm text-gray-500">
                          <strong>Status</strong>:{" "}
                          <span className="text-green-600">
                            {food.available ? "Available" : "Unavailable"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="gap-1 flex flex-col items-end">
                      <p className="text-gray-600 line-through text-sm">
                        ৳ {food.price.toFixed(2)}
                      </p>
                      <p className="text-green-600 font-semibold">
                        ৳ {calculateDiscountedPrice(food).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-gray-500">
                  No food found with this name. Try with another name.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex w-[30%] justify-end mt-2 items-center gap-6 sm:mr-8">
          <Notification />
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default Header;
