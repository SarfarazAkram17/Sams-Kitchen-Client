import { useLocation, useNavigate, useParams } from "react-router";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PiShoppingCartBold } from "react-icons/pi";
import { FiImage, FiX } from "react-icons/fi";
import { useState, useRef } from "react";
import useAxios from "../../Hooks/useAxios";
import { addToCart } from "../../CartUtils/cartUtils";
import { Rate, ConfigProvider } from "antd";
import AppPagination from "../../Components/Shared/AppPagination";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../Hooks/useAuth";
import useCanOrder from "../../Hooks/useCanOrder";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import ShareFood from "../../Components/Shared/ShareFood";
import { foodPrice, formatAmount } from "../../lib/money";
import { FoodDetailsSkeleton } from "../../Components/Skeletons/PageSkeletons";
import { TextAreaField } from "../../Components/Forms/Field";
import LazyImage from "../../Components/Shared/LazyImage";
import ListToolbar from "../../Components/Shared/ListToolbar";
import EmptyResults from "../../Components/Shared/EmptyResults";

const FoodDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { foodId } = useParams();
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const { user, userEmail } = useAuth();
  const canOrder = useCanOrder();
  const [quantity, setQuantity] = useState(1);

  // Pagination
  const [page, setPage] = useState(1);

  // Cloudinary config
  const cloudName = import.meta.env.VITE_cloudinary_cloud_name;
  const uploadPreset = import.meta.env.VITE_cloudinary_preset_name;

  const [uploading, setUploading] = useState(false);
  const [imageURLs, setImageURLs] = useState([]);
  const fileInputRef = useRef();

  // Fetch single food
  const { data: food, isLoading } = useQuery({
    queryKey: ["food", foodId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/foods/${foodId}`);
      return res.data;
    },
    enabled: !!foodId,
  });

  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewRating, setReviewRating] = useState("");
  const [withPhotos, setWithPhotos] = useState("");
  const reviewFiltersActive =
    (reviewSort !== "newest" ? 1 : 0) +
    (reviewRating ? 1 : 0) +
    (withPhotos ? 1 : 0);
  const resetReviewFilters = () => {
    setReviewSort("newest");
    setReviewRating("");
    setWithPhotos("");
    setPage(1);
  };

  // Fetch reviews
  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ["reviews", foodId, page, reviewSort, reviewRating, withPhotos],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await axiosInstance.get(`/reviews`, {
        params: {
          foodId: foodId,
          page,
          limit: 3,
          sort: reviewSort,
          rating: reviewRating || undefined,
          withPhotos: withPhotos || undefined,
        },
      });
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewErrors, setReviewErrors] = useState({});

  // Upload multiple images to Cloudinary
  const handleImageUpload = async (files) => {
    if (!files.length) return;

    if (imageURLs.length + files.length > 4) {
      toast.error("You can upload a maximum of 4 images.");
      return;
    }

    setUploading(true);
    try {
      const uploadedImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData,
        );
        uploadedImages.push(res.data.secure_url);
      }

      setImageURLs((prev) => [...prev, ...uploadedImages]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (url) => {
    setImageURLs((prev) => prev.filter((img) => img !== url));
  };

  // Add review mutation
  const { mutate: postReview, isPending } = useMutation({
    mutationFn: async () => {
      const review = {
        foodId,
        userPhoto: user?.photoURL,
        userName: user?.displayName,
        rating,
        comment,
        images: imageURLs,
        postedAt: new Date().toISOString(),
      };

      const { data } = await axiosSecure.post(
        `/reviews?email=${userEmail}`,
        review,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries(["reviews", foodId, page]);
      setRating(0);
      setComment("");
      setImageURLs([]);
      setReviewErrors({});
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  if (isLoading || reviewLoading) return <FoodDetailsSkeleton />;

  const discountedPrice = foodPrice(food);

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }

    addToCart(food._id, quantity);
    setQuantity(1);
  };

  const handleReviewSubmit = () => {
    if (isPending || uploading) return;
    if (!user) {
      toast.info("Login first");
      navigate("/login", { state: location.pathname });
      return;
    }

    const nextErrors = {
      comment: comment.trim() ? "" : "Write a review before submitting.",
      rating: rating ? "" : "Choose a rating before submitting.",
    };
    setReviewErrors(nextErrors);
    if (nextErrors.comment || nextErrors.rating) return;

    postReview();
  };

  const roundToHalf = (num) => {
    const floor = Math.floor(num);
    const decimal = num - floor;

    if (decimal === 0) return floor;
    return floor + 0.5;
  };

  const avgRating = reviewData?.avgRating || 0;

  const displayRating = roundToHalf(avgRating);

  return (
    <div className="max-w-[1500px] px-3 mx-auto mb-16">
      {/* --- Food Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Food image */}
        <div>
          <div className="w-full h-64 sm:h-80 border relative rounded-lg overflow-hidden">
            <LazyImage
              priority
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            {food.discount > 0 && (
              <span className="absolute top-2 right-2 bg-secondary text-secondary-content text-xs font-semibold px-2 py-1 rounded-full shadow">
                {food.discount}% OFF
              </span>
            )}
          </div>

          <div className="mt-5">
            <h2 className="font-bold text-xl mb-1">Like this Food?</h2>
            <p className="text-sm text-base-content/80 mb-3">
              Share it with your peers!
            </p>

            <ShareFood food={food}></ShareFood>
          </div>
        </div>

        {/* Food details */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary">{food.name}</h2>

          <div className="text-sm">
            <ConfigProvider
              theme={{
                components: {
                  Rate: {
                    starBg: "#B5B7B750",
                    starSize: 15,
                    marginXS: 2,
                  },
                },
              }}
            >
              <Rate disabled allowHalf value={displayRating} />
            </ConfigProvider>{" "}
            ( {reviewData.allTotal ?? reviewData.total}{" "}
            {(reviewData.allTotal ?? reviewData.total) > 1
              ? "reviews"
              : "review"}{" "}
            )
          </div>

          <p className="text-base-content/80 text-sm leading-relaxed">
            {food.description}
          </p>
          {/* Price */}
          <div className="text-xl">
            {food.discount > 0 ? (
              <div className="space-x-2">
                <span className="text-success font-semibold">
                  ৳ {formatAmount(discountedPrice)}
                </span>
                <span className="line-through text-lg text-base-content/60">
                  ৳ {formatAmount(food.price)}
                </span>
              </div>
            ) : (
              <span className="text-success font-semibold">
                ৳ {formatAmount(food.price)}
              </span>
            )}
          </div>
          {/* Availability */}
          <p className="text-md">
            <strong>Status:</strong>{" "}
            {food.available ? (
              <span className="text-success font-semibold">Available</span>
            ) : (
              <span className="text-error font-semibold">Unavailable</span>
            )}
          </p>
          {/* Quantity + Add to Cart */}
          {food.available && canOrder && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-base-300 rounded-lg">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity === 1}
                  className="px-3 py-2 text-xl font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-2 text-xl font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(food)}
                disabled={!food.available}
                className="btn btn-primary flex items-center"
              >
                <PiShoppingCartBold size={20} className="mr-2" /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Reviews Section --- */}
      <div className="mt-12">
        <h3 className="text-3xl sm:text-4xl font-semibold mb-4 text-center">
          Reviews
        </h3>

        {/* Add Review Form */}
        <section className="dash-panel mb-6 rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-6">
          <h4 className="mb-4 text-lg font-bold">Share your review</h4>
          <TextAreaField
            name="review-comment"
            label="Your review"
            rows={4}
            value={comment}
            placeholder="What did you think of this dish?"
            error={reviewErrors.comment}
            onChange={(e) => {
              setComment(e.target.value);
              setReviewErrors((previous) => ({ ...previous, comment: "" }));
            }}
          />

          <div className="my-5">
            <p className="mb-2 text-sm font-semibold">Rating</p>
            <ConfigProvider
              theme={{
                components: {
                  Rate: {
                    starBg: "#B5B7B750",
                    marginXS: 2,
                  },
                },
              }}
            >
              <Rate
                allowHalf
                onChange={(value) => {
                  setRating(value);
                  setReviewErrors((previous) => ({ ...previous, rating: "" }));
                }}
                value={rating}
              />
            </ConfigProvider>
            {reviewErrors.rating && (
              <p className="mt-1.5 text-sm font-medium text-error" role="alert">
                {reviewErrors.rating}
              </p>
            )}
          </div>

          {/* Image upload */}
          <p className="mb-1.5 text-sm font-semibold">Photos (up to 4)</p>
          <label
            className={`flex min-h-20 items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-base-300 bg-base-200/40 px-4 py-4 text-center text-sm transition-colors ${
              uploading || imageURLs.length >= 4
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-primary hover:bg-primary/5"
            }`}
          >
            {uploading ? (
              <span className="loading loading-spinner loading-sm text-primary" />
            ) : (
              <FiImage aria-hidden="true" className="text-primary" size={20} />
            )}
            <span className="font-semibold">
              {uploading
                ? "Uploading…"
                : imageURLs.length >= 4
                  ? "Photo limit reached"
                  : "Tap to add photos"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="sr-only"
              disabled={uploading || imageURLs.length >= 4}
            />
          </label>
          {imageURLs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {imageURLs.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt="Review upload"
                    className="size-24 rounded-xl border border-base-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(url)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-black/75 text-white shadow ring-2 ring-base-100 transition hover:bg-error hover:text-error-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <FiX aria-hidden="true" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary mt-5 h-12 w-full sm:w-auto sm:min-w-48"
            onClick={handleReviewSubmit}
            disabled={isPending || uploading}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-sm" />{" "}
                Submitting review
              </>
            ) : (
              "Submit review"
            )}
          </button>
        </section>

        {(reviewData?.allTotal ?? 0) > 1 && (
          <ListToolbar
            className="mt-8"
            searchId="reviews"
            hideSearch
            activeCount={reviewFiltersActive}
            onReset={resetReviewFilters}
            summary={`${reviewData.total} ${reviewData.total === 1 ? "review" : "reviews"} shown`}
            filters={[
              {
                key: "sort",
                label: "Sort by",
                options: [
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "highest", label: "Highest rated" },
                  { value: "lowest", label: "Lowest rated" },
                ],
                value: reviewSort,
                onChange: (value) => {
                  setReviewSort(value);
                  setPage(1);
                },
              },
              {
                key: "rating",
                label: "Stars",
                options: [
                  { value: "", label: "All ratings" },
                  ...[5, 4, 3, 2, 1].map((star) => ({
                    value: String(star),
                    label: `${star} ${star === 1 ? "star" : "stars"}`,
                  })),
                ],
                value: reviewRating,
                onChange: (value) => {
                  setReviewRating(value);
                  setPage(1);
                },
              },
              {
                key: "photos",
                label: "Photos",
                options: [
                  { value: "", label: "All reviews" },
                  { value: "true", label: "With photos" },
                ],
                value: withPhotos,
                onChange: (value) => {
                  setWithPhotos(value);
                  setPage(1);
                },
              },
            ]}
          />
        )}

        {/* Review List */}
        {reviewData?.reviews?.length > 0 ? (
          <div className="space-y-4 mt-10">
            {reviewData.reviews.map((review) => (
              <div
                key={review._id}
                className="p-4 rounded-xl shadow-xl border-2 border-base-300"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full sm:size-13">
                      <LazyImage
                        className="size-full object-cover"
                        src={review.userPhoto}
                        alt={review.userName}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="font-semibold text-xs lg:text-sm">
                        {review.userName}
                      </h4>
                      <ConfigProvider
                        theme={{
                          components: {
                            Rate: {
                              starBg: "#B5B7B750",
                              starSize: 15,
                              marginXS: 2,
                            },
                          },
                        }}
                      >
                        <Rate disabled allowHalf value={review.rating} />
                      </ConfigProvider>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">
                    {new Date(review.postedAt).toLocaleDateString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <p className="text-sm leading-relaxed my-6 text-base-content/80">
                  {review.comment}
                </p>
                {review.images?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {review.images.map((img) => (
                      <div
                        key={img}
                        className="relative aspect-[4/3] overflow-hidden rounded bg-base-200"
                      >
                        <LazyImage
                          src={img}
                          alt="review"
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ant Design Pagination */}
            <AppPagination
              current={page}
              total={reviewData.total}
              pageSize={3}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        ) : reviewFiltersActive ? (
          <div className="mt-6">
            <EmptyResults
              title="No reviews match"
              message="Try a different star rating or sort order."
              onReset={resetReviewFilters}
            />
          </div>
        ) : (
          <p className="text-base-content/80 text-center text-2xl mt-16 font-bold">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;