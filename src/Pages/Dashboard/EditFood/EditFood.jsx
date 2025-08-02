import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxios from "../../../Hooks/useAxios";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import useAuth from "../../../Hooks/useAuth";
import Loading from "../../../Components/Loading/Loading";

const EditFood = () => {
  const { foodId } = useParams();
  const { userEmail } = useAuth();
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [existingImages, setExistingImages] = useState([]);
  const [newImagesURLs, setNewImagesURLs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const cloudName = import.meta.env.VITE_cloudinary_cloud_name;
  const uploadPreset = import.meta.env.VITE_cloudinary_preset_name;

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch single food
  const { data: foodData, isLoading } = useQuery({
    queryKey: ["food", foodId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/foods/${foodId}`);
      return res.data;
    },
    enabled: !!foodId,
  });

  // Pre-fill form
  useEffect(() => {
    if (foodData) {
      reset({
        name: foodData.name,
        price: foodData.price,
        discount: foodData.discount,
        description: foodData.description,
        available: foodData.available ? "true" : "false",
      });
      setExistingImages(foodData.images || []);
    }
  }, [foodData, reset]);

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);

    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("upload_preset", uploadPreset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        uploaded.push(res.data.secure_url);
      }

      setNewImagesURLs((prev) => [...prev, ...uploaded]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleRemoveNewImage = (index) => {
    setNewImagesURLs((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- UPDATE FOOD MUTATION ----------------
  const { mutate: updateFood, isPending } = useMutation({
    mutationFn: async (updatedFood) => {
      const { data } = await axiosSecure.patch(
        `/foods/${foodId}?email=${userEmail}`,
        updatedFood
      );
      return data;
    },
    onSuccess: () => {
      Swal.fire("Success", "🎉 Food updated successfully!", "success");
      navigate("/dashboard/manageFoods");
    },
    onError: (err) => {
      toast.error(`Failed to update food: ${err.message}`);
    },
  });

  const handleFoodUpdate = async (data) => {
    if (existingImages.length + newImagesURLs.length === 0) {
      toast.error("Please keep at least one image.");
      return;
    }

    const imagesToRemove = foodData.images.filter(
      (img) => !existingImages.includes(img)
    );

    const payload = {
      name: data.name,
      price: parseFloat(data.price),
      discount: parseInt(data.discount) || 0,
      description: data.description,
      available: data.available === "true",
      imagesToAdd: newImagesURLs,
      imagesToRemove,
    };

    updateFood(payload);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
        Edit Food Item: {foodData.name}
      </h2>

      <form onSubmit={handleSubmit(handleFoodUpdate)} className="space-y-4">
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
            <p className="text-red-500 text-xs">Food name is required.</p>
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
            <p className="text-red-500 text-xs">{errors.price.message}</p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block font-semibold mb-1">Discount (%)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Discount (%)"
            className="input input-bordered w-full"
            {...register("discount", { min: 0, max: 100 })}
          />
          <p className="text-xs text-gray-500 mt-1">0–100, default is 0%</p>
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
            <p className="text-red-500 text-xs">
              Food Description is required.
            </p>
          )}
        </div>

        {/* Existing Images */}
        <div>
          <label className="block font-semibold mb-1">Existing Images</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {existingImages.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`existing-img-${i}`}
                  className="h-24 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="block font-semibold mb-1">Add New Images</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            className="file-input file-input-bordered w-full"
            disabled={uploading}
          />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
            {newImagesURLs.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`new-uploaded-${i}`}
                  className="h-24 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
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
            className="btn w-full mt-8 btn-primary text-white"
            disabled={uploading || isPending}
            type="submit"
          >
            {uploading || isPending ? (
              <>
                <span className="loading loading-spinner text-primary"></span>{" "}
                Update Food
              </>
            ) : (
              "Update Food"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFood;
