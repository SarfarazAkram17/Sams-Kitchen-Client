import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion, useReducedMotion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FiArrowUpRight, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { addToCart } from "../../../CartUtils/cartUtils";
import useAuth from "../../../Hooks/useAuth";
import useCanOrder from "../../../Hooks/useCanOrder";
import useAxios from "../../../Hooks/useAxios";
import { PiShoppingCartBold } from "react-icons/pi";

const SLIDE_MS = 6000;

const Banner = () => {
  const axiosInstance = useAxios();
  const { user } = useAuth();
  const canOrder = useCanOrder();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const {
    data: foods = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["homeBannerFoods"],
    queryFn: async () => {
      const response = await axiosInstance.get("/foods/random");
      const items = Array.isArray(response.data) ? response.data : [];
      return items
        .filter((item) => item?._id && item.available !== false)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  const count = foods.length;
  const autoplay = count > 1 && !paused && !reduceMotion;

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % count),
      SLIDE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [autoplay, count, activeIndex]);

  const food = foods[activeIndex % Math.max(count, 1)];
  const price = Number(food?.price || 0);
  const discount = Number(food?.discount || 0);
  const discountedPrice = price - (price * discount) / 100;

  const handleOrder = () => {
    if (!food) return;
    if (!canOrder) {
      navigate(`/foods/${food._id}`);
      return;
    }
    if (!user) {
      toast.info("Login first");
      navigate("/login", { state: location.pathname });
      return;
    }
    addToCart(food._id);
    navigate("/placeOrder");
  };

  const actionLabel = !canOrder
    ? "View dish"
    : user
      ? "Order now"
      : "Sign in to order";

  return (
    <section className="px-3 sm:px-4" aria-label="Sam’s Kitchen featured dish">
      <div className="hero-surface relative isolate mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] border border-base-300 text-base-content sm:rounded-[2.5rem]">
        <div className="relative z-10 grid items-center gap-12 px-5 pb-24 pt-10 sm:px-10 sm:pt-14 lg:min-h-[600px] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-16 lg:pb-24">
          {/* Copy */}
          <div className="max-w-2xl">
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-base-300 bg-base-100/80 py-1.5 pl-2 pr-4 text-[11px] font-bold uppercase tracking-[.16em] text-base-content/80 shadow-sm backdrop-blur"
            >
              <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-content">
                <FiMapPin size={12} aria-hidden="true" />
              </span>
              Fresh home-style cooking
            </motion.span>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.08,
                ease: [0.2, 0.75, 0.25, 1],
              }}
              className="mt-6 text-balance text-[2.9rem] leading-[1] sm:text-7xl lg:text-[4.9rem]"
            >
              Bangladesh on a plate.
              <span className="mt-1 block italic text-primary">
                Made fresh, with heart.
              </span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-xl text-base leading-7 text-base-content/75 sm:text-lg sm:leading-8"
            >
              Family favorites, honest ingredients, and the comfort of a meal
              made to order—delivered from our kitchen to yours.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/allFoods"
                className="btn btn-primary min-h-13 px-7 text-base shadow-lg shadow-primary/25"
              >
                Explore the menu <FiArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/offers"
                className="btn min-h-13 border-base-300 bg-base-100/70 px-7 text-base text-base-content backdrop-blur hover:border-primary/50 hover:bg-base-100"
              >
                Today’s specials
              </Link>
            </motion.div>
          </div>

          {/* Featured dish */}
          <div
            className="relative mx-auto w-full max-w-[560px] lg:ml-auto"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-secondary/25 blur-2xl"
              aria-hidden="true"
            />

            {isLoading ? (
              <div
                className="aspect-[4/4.6] animate-pulse rounded-[2rem] border border-base-300 bg-base-100"
                role="status"
                aria-label="Loading featured dish"
              />
            ) : isError ? (
              <div className="grid aspect-[4/4.6] place-items-center rounded-[2rem] border border-base-300 bg-base-100 p-8 text-center">
                <div>
                  <p className="font-display text-3xl">
                    The menu is taking a moment.
                  </p>
                  <p className="mt-2 text-sm text-base-content/70">
                    Please try again or browse all dishes.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="btn btn-sm mt-5 border-base-300 bg-base-200 text-base-content"
                  >
                    <FiRefreshCw aria-hidden="true" /> Try again
                  </button>
                </div>
              </div>
            ) : food ? (
              <button
                type="button"
                onClick={handleOrder}
                className="group relative block w-full cursor-pointer overflow-hidden rounded-[1.6rem] border border-base-300 bg-base-100 text-left shadow-2xl shadow-black/15 outline-none transition hover:-translate-y-1 hover:shadow-black/25 focus-visible:ring-4 focus-visible:ring-primary/60 sm:rounded-[2rem]"
                aria-label={`${canOrder ? (user ? "Add" : "Sign in to order") : "View"} ${food.name}`}
              >
                <div className="relative aspect-[1.08/1] overflow-hidden bg-base-200">
                  <img
                    key={food._id}
                    src={food.image}
                    alt={food.name}
                    loading="eager"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-white backdrop-blur-md sm:left-5 sm:top-5">
                    <FiRefreshCw aria-hidden="true" /> Today’s pick
                  </div>
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white sm:inset-x-6 sm:bottom-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/70">
                        Made for your table
                      </p>
                      <h2 className="font-display mt-1 truncate text-2xl font-bold sm:text-3xl">
                        {food.name}
                      </h2>
                      {food.description && (
                        <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-white/75 sm:text-sm">
                          {food.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur-md sm:px-4 sm:text-base">
                      ৳{discountedPrice.toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-base-content sm:text-sm">
                      {canOrder ? "Order this dish" : "View this dish"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-base-content/60 sm:text-xs">
                      {actionLabel}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-content transition group-hover:translate-x-1">
                    {canOrder ? (
                      <PiShoppingCartBold aria-hidden="true" />
                    ) : (
                      <FiArrowUpRight aria-hidden="true" />
                    )}
                  </span>
                </div>
              </button>
            ) : (
              <div className="grid aspect-[4/4.6] place-items-center rounded-[2rem] border border-base-300 bg-base-100 p-8 text-center">
                <div>
                  <p className="font-display text-3xl">
                    A fresh menu is coming soon.
                  </p>
                  <p className="mt-2 text-sm text-base-content/70">
                    Browse the menu to see what’s cooking today.
                  </p>
                  <Link to="/allFoods" className="btn btn-primary btn-sm mt-5">
                    Browse dishes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
