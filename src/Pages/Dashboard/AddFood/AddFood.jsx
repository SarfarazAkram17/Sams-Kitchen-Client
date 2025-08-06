import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import useAuth from "../../../Hooks/useAuth";

const AddFood = () => {
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef();
  const { userEmail } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [uploading, setUploading] = useState(false);
  const [imageURL, setImageURL] = useState("");

  const cloudName = import.meta.env.VITE_cloudinary_cloud_name;
  const uploadPreset = import.meta.env.VITE_cloudinary_preset_name;

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = async (files) => {
    if (!files.length) return;

    const totalImages = imageURL.length + files.length;
    if (totalImages > 1) {
      toast.error("You can upload 1 image.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      setImageURL(res.data.secure_url);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = () => {
    setImageURL("");
  };

  // ---------------- POST FOOD MUTATION ----------------
  const { mutate: addFood, isPending } = useMutation({
    mutationFn: async (newFood) => {
      const { data } = await axiosSecure.post(
        `/foods?email=${userEmail}`,
        newFood
      );
      return data;
    },
    onSuccess: (data) => {
      if (data.foodId) {
        Swal.fire("Success", "🎉 Food added successfully!", "success");
        setImageURL("");
        reset();
      }
    },
    onError: (err) => {
      toast.error(`Failed to add food: ${err.message}`);
    },
  });

  const handleAddFood = async (data) => {
    if (!imageURL) {
      toast.error("Please upload 1 image before submitting.");
      return;
    }

    const newFood = {
      name: data.name,
      price: data.price ? Number(parseFloat(data.price).toFixed(2)) : 0,
      discount: data.discount
        ? Number(parseFloat(data.discount).toFixed(2))
        : 0,
      description: data.description,
      image: imageURL,
      available: data.available === "true",
      addedAt: new Date().toISOString(),
    };

    addFood(newFood);
  };

  return (
    <div className="px-4">
      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4 text-primary">
        Add New Food
      </h2>
      <p className="text-center text-sm text-gray-600 mb-8 max-w-2xl mx-auto">
        Add a new food item to the menu. Upload at least one image, set price
        and details. Discount defaults to 0% but can be updated later by Admin.
      </p>

      <form onSubmit={handleSubmit(handleAddFood)} className="space-y-4">
        {/* Food Name */}
        <div>
          <label className="block font-semibold mb-1">Food Name</label>
          <input
            type="text"
            placeholder="Food Name"
            className="input input-bordered w-full"
            {...register("name", { required: true })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs font-semibold mt-1">
              Food name is required.
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-1">Price (BDT)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Price (BDT)"
            className="input input-bordered w-full"
            {...register("price", {
              required: "Price is required.",
              min: { value: 1, message: "Price must be greater than 0." },
            })}
          />
          {errors.price && (
            <p className="text-red-500 text-xs font-semibold mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block font-semibold mb-1">Discount (%)</label>
          <input
            type="number"
            placeholder="Discount (%)"
            className="input input-bordered w-full"
            defaultValue={0}
            {...register("discount", { min: 0, max: 100 })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Default 0%. Can be updated later up to 100%.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            placeholder="Description"
            className="textarea textarea-bordered w-full resize-none"
            rows={4}
            {...register("description", { required: true })}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-semibold mt-1">
              Food description is required.
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-1">Upload Images</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="file-input file-input-bordered w-full"
            disabled={uploading || imageURL}
          />

          {imageURL && (
            <div className="relative my-1 w-fit">
              <img
                src={imageURL}
                alt="food image"
                className="h-28 w-auto object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleImageRemove()}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-1">
            {imageURL
              ? "You have uploaded 1 image."
              : `Uploaded: ${imageURL.length} / 1`}
          </p>
        </div>

        {/* Availability */}
        <div>
          <label className="block font-semibold mb-1">Availability</label>
          <select
            {...register("available")}
            className="select select-bordered w-full"
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            className="btn w-full mt-8 btn-primary disabled:text-black/50 text-white"
            disabled={uploading || isPending}
            type="submit"
          >
            {uploading || isPending ? (
              <>
                <span className="loading loading-spinner text-primary"></span>{" "}
                {uploading ? "Uploading image" : "Adding Food"}
              </>
            ) : (
              "Add Food"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFood;
