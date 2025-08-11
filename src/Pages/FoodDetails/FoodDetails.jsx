import { useLocation, useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PiShoppingCartBold } from "react-icons/pi";
import { useState, useRef } from "react";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Components/Loading/Loading";
import { addToCart } from "../../CartUtils/cartUtils";
import { Pagination, Rate, ConfigProvider } from "antd";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import ShareFood from "../../Components/Shared/ShareFood";

const FoodDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { foodId } = useParams();
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const { user, userEmail } = useAuth();
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

  // Fetch reviews
  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ["reviews", foodId, page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/reviews`, {
        params: {
          foodId: foodId,
          page,
          limit: 3,
        },
      });
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

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
          formData
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
        review
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries(["reviews", foodId, page]);
      setRating(0);
      setComment("");
      setImageURLs([]);
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  if (isLoading || reviewLoading) return <Loading />;

  const discountedPrice =
    food.discount > 0
      ? food.price - (food.price * food.discount) / 100
      : food.price;

  const handleAddToCart = () => {
    addToCart(food._id, quantity);
    setQuantity(1);
  };

  const handleReviewSubmit = () => {
    if (!user) {
      toast.info("Login first");
      navigate("/login", { state: location.pathname });
      return;
    }

    if (!comment) {
      toast.error("Please add comment comment.");
      return;
    }

    if (!rating) {
      toast.error("Please add rating comment.");
      return;
    }

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
    <div className="py-10 max-w-5xl px-3 mx-auto">
      {/* --- Food Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Food image */}
        <div>
          <div className="w-full h-64 sm:h-80 border relative rounded-lg overflow-hidden">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            {food.discount > 0 && (
              <span className="absolute top-2 right-2 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                {food.discount}% OFF
              </span>
            )}
          </div>

          <div className="mt-5">
            <h2 className="font-bold text-xl mb-1">Like this Food?</h2>
            <p className="text-sm text-gray-600 mb-3">
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
            ( {reviewData.total} {reviewData.total > 1 ? "reviews" : "review"} )
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">
            {food.description}
          </p>
          {/* Price */}
          <div className="text-xl">
            {food.discount > 0 ? (
              <div className="space-x-2">
                <span className="text-green-600 font-semibold">
                  ৳ {discountedPrice.toFixed(2)}
                </span>
                <span className="line-through text-lg text-gray-400">
                  ৳ {food.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-green-600 font-semibold">
                ৳ {food.price.toFixed(2)}
              </span>
            )}
          </div>
          {/* Availability */}
          <p className="text-md">
            <strong>Status:</strong>{" "}
            {food.available ? (
              <span className="text-green-600 font-semibold">Available</span>
            ) : (
              <span className="text-red-600 font-semibold">Unavailable</span>
            )}
          </p>
          {/* Quantity + Add to Cart */}
          {food.available && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-400 rounded-lg">
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
                onClick={handleAddToCart}
                className="btn btn-primary text-white flex items-center"
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
        <div className="border rounded-lg p-4 shadow mb-6">
          <h4 className="text-lg font-semibold mb-2">Share your Review</h4>
          <textarea
            rows={4}
            value={comment}
            placeholder="Write your review..."
            onChange={(e) => setComment(e.target.value)}
            className="resize-none w-full border-2 p-2 rounded-md border-gray-200"
          />

          <div className="my-4">
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
              <Rate allowHalf onChange={setRating} value={rating} />
            </ConfigProvider>
          </div>

          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            className="file-input file-input-bordered w-full"
            disabled={uploading || imageURLs.length >= 4}
          />
          <div className="flex gap-3 mt-2 flex-wrap">
            {imageURLs.map((url) => (
              <div className="relative my-1 w-fit">
                <img
                  src={url}
                  alt="food image"
                  className="h-28 w-auto object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded opacity-80 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            className="mt-4 btn btn-primary disabled:text-black/50 text-white"
            disabled={isPending || uploading}
            onClick={handleReviewSubmit}
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner text-primary loading-md"></span>{" "}
                Submitting Review
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>

        {/* Review List */}
        {reviewData?.reviews?.length > 0 ? (
          <div className="space-y-4 mt-10">
            {reviewData.reviews.map((review) => (
              <div
                key={review._id}
                className="p-4 rounded-xl shadow-xl border-2 border-sky-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-4">
                    <img
                      className="object-cover h-10 sm:h-13 w-10 sm:w-13 rounded-full"
                      src={review.userPhoto}
                      alt={review.userName}
                    />

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

                <p className="text-sm leading-relaxed my-6 text-gray-600">
                  {review.comment}
                </p>
                {review.images?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {review.images.map((img) => (
                      <img
                        key={img}
                        src={img}
                        alt="review"
                        className="w-full h-auto object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ant Design Pagination */}
            <div className="flex justify-center mt-10">
              <Pagination
                current={page}
                align="center"
                total={reviewData.total}
                pageSize={3}
                showSizeChanger={false}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center text-2xl mt-16 font-bold">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;
