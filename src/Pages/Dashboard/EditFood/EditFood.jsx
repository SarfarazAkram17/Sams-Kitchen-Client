import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiPercent, FiType } from "react-icons/fi";
import { TbCurrencyTaka } from "react-icons/tb";
import useAxios from "../../../Hooks/useAxios";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useImageUpload from "../../../Hooks/useImageUpload";
import { formatAmount, getDiscountedPrice } from "../../../lib/money";
import Field, {
  SelectField,
  TextAreaField,
} from "../../../Components/Forms/Field";
import {
  FormActions,
  FormPage,
  FormSection,
  ImageDropzone,
} from "../../../Components/Forms/FormKit";
import { EditFoodSkeleton } from "../../../Components/Skeletons/PageSkeletons";

const AVAILABILITY = [
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

const wholeNumber = (message) => (value) =>
  Number.isInteger(Number(value)) || message;

const EditFood = () => {
  const { foodId } = useParams();
  const { userEmail } = useAuth();
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const image = useImageUpload();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const { data: foodData, isLoading } = useQuery({
    queryKey: ["food", foodId],
    queryFn: async () => (await axiosInstance.get(`/foods/${foodId}`)).data,
    enabled: !!foodId,
  });

  const { setUrl } = image;
  useEffect(() => {
    if (!foodData) return;
    reset({
      name: foodData.name,
      price: Math.round(foodData.price),
      discount: Math.round(foodData.discount || 0),
      description: foodData.description,
      available: foodData.available ? "true" : "false",
    });
    setUrl(foodData.image || "");
  }, [foodData, reset, setUrl]);

  const price = watch("price");
  const discount = watch("discount");
  const description = watch("description") || "";
  const customerPays = getDiscountedPrice(price, discount);

  const { mutate: updateFood, isPending } = useMutation({
    mutationFn: async (updatedFood) => {
      const { data } = await axiosSecure.patch(
        `/foods/${foodId}?email=${userEmail}`,
        updatedFood,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Dish updated.");
      navigate("/dashboard/manageFoods");
    },
    onError: (err) => {
      toast.error(`Failed to update food: ${err.message}`);
    },
  });

  const handleFoodUpdate = (data) => {
    if (image.uploading || isPending) return;
    if (!image.url) {
      image.setError("A food image is required.");
      return;
    }

    updateFood({
      name: data.name.trim(),
      price: Math.round(Number(data.price)),
      discount: Math.round(Number(data.discount) || 0),
      description: data.description.trim(),
      available: data.available === "true",
      image: image.url,
    });
  };

  if (isLoading) return <EditFoodSkeleton />;

  return (
    <FormPage
      standard
      eyebrow="Menu"
      title={`Edit ${foodData?.name || "dish"}`}
      subtitle="Update the details, price or image. Changes appear on the menu right away."
      backTo="/dashboard/manageFoods"
      backLabel="Back to Manage Foods"
    >
      <form
        onSubmit={handleSubmit(handleFoodUpdate)}
        className="space-y-6"
        noValidate
      >
        <FormSection
          title="Dish details"
          description="What customers see on the menu."
        >
          <Field
            className="sm:col-span-2"
            label="Food name"
            icon={FiType}
            placeholder="e.g. Kacchi biryani"
            error={errors.name?.message}
            {...register("name", { required: "Enter the food name." })}
          />
          <TextAreaField
            className="sm:col-span-2"
            label="Description"
            rows={4}
            maxLength={300}
            counter={`${description.length}/300`}
            placeholder="Ingredients, portion size, what makes it special"
            error={errors.description?.message}
            {...register("description", {
              required: "Enter a short description.",
            })}
          />
        </FormSection>

        <FormSection
          title="Pricing"
          description="Discounts are a whole percentage."
        >
          <Field
            label="Price (৳)"
            type="number"
            inputMode="numeric"
            step="1"
            icon={TbCurrencyTaka}
            error={errors.price?.message}
            {...register("price", {
              required: "Enter the price.",
              min: { value: 1, message: "Price must be greater than 0." },
              validate: wholeNumber("Use a whole number, like 250."),
            })}
          />
          <Field
            label="Discount (%)"
            type="number"
            inputMode="numeric"
            step="1"
            icon={FiPercent}
            hint="0 means no discount. Up to 100."
            error={errors.discount?.message}
            {...register("discount", {
              min: { value: 0, message: "Discount cannot be negative." },
              max: {
                value: 100,
                message: "Discount cannot be more than 100%.",
              },
              validate: wholeNumber("Use a whole number, like 10."),
            })}
          />
          <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm sm:col-span-2">
            Customers will pay{" "}
            <strong className="text-base text-primary">
              ৳{formatAmount(customerPays)}
            </strong>
            {Number(discount) > 0 && Number(price) > 0 && (
              <span className="text-base-content/65">
                {" "}
                instead of ৳{formatAmount(price)}
              </span>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Image and availability"
          description="One image, shown on cards and the dish page."
        >
          <ImageDropzone
            label="Dish image"
            hint="JPG, PNG or WebP, up to 5 MB"
            url={image.url}
            uploading={image.uploading}
            error={image.error}
            onSelect={image.upload}
            onRemove={image.clear}
            disabled={isPending}
          />
          <SelectField
            className="sm:col-span-2"
            label="Availability"
            name="available"
            control={control}
            options={AVAILABILITY}
          />
        </FormSection>

        <FormActions
          onCancel={() => navigate("/dashboard/manageFoods")}
          loading={image.uploading || isPending}
          loadingLabel={image.uploading ? "Uploading image" : "Saving changes"}
        >
          Save changes
        </FormActions>
      </form>
    </FormPage>
  );
};

export default EditFood;