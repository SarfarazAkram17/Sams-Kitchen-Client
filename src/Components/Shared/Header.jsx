import { useState, useRef, useEffect } from "react";
import Cart from "./Cart";
import Notification from "./Notification";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";
import useCanOrder from "../../Hooks/useCanOrder";

const Header = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track modal visibility
  const modalRef = useRef(null); // Reference for the modal container
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const canOrder = useCanOrder();

  // Query for searching foods
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["search-food", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const res = await axiosInstance.get(
        `/foods/search?name=${encodeURIComponent(search)}`,
      );
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
    <div className="relative bg-primary text-primary-content">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-5">
        <div className="relative min-w-0 flex-1">
          <label className="header-search input w-full rounded-xl border-primary-content/20 bg-primary-content/10 text-primary-content focus-within:outline-primary-content/50">
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
              aria-label="Search the Sam's Kitchen menu"
              onClick={handleSearchClick}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search our kitchen"
              className="placeholder:text-primary-content/60"
            />
          </label>

          {/* Search Result Modal */}
          {isModalOpen && (
            <div
              ref={modalRef}
              className="fixed inset-x-3 top-[3.75rem] z-[90] max-h-[min(70dvh,28rem)] overflow-y-auto overscroll-contain rounded-2xl border border-base-300 bg-base-100 p-2 text-base-content shadow-xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-full"
            >
              {isLoading ? (
                <div
                  className="p-4 space-y-3"
                  aria-label="Searching menu items"
                >
                  <div className="h-12 rounded-lg bg-base-200 animate-pulse" />
                  <div className="h-12 rounded-lg bg-base-200 animate-pulse" />
                </div>
              ) : searchResults?.length > 0 ? (
                searchResults.map((food) => (
                  <div
                    key={food._id}
                    onClick={() => {
                      navigate(`/foods/${food._id}`);
                      setIsModalOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        navigate(`/foods/${food._id}`);
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary sm:px-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={food.image}
                        alt=""
                        className="h-12 w-14 shrink-0 rounded-lg object-cover sm:h-14 sm:w-[4.5rem]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 break-words text-sm font-medium leading-snug">
                          {food.name}
                        </p>
                        <p
                          className={`mt-0.5 text-xs ${
                            food.available ? "text-success" : "text-error"
                          }`}
                        >
                          {food.available ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                      {food.discount ? (
                        <p className="whitespace-nowrap text-xs text-base-content/60 line-through">
                          ৳ {Number(food.price).toFixed(2)}
                        </p>
                      ) : null}
                      <p className="whitespace-nowrap text-sm font-semibold text-success">
                        ৳ {calculateDiscountedPrice(food).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-sm text-base-content/60">
                  No food found with this name. Try with another name.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
          <ThemeToggle />
          <Notification />
          {canOrder && <Cart />}
        </div>
      </div>
    </div>
  );
};

export default Header;