import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuth from "../../Hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { HiTruck } from "react-icons/hi";
import {
  PiArrowBendUpLeftLight,
  PiArrowBendUpRightLight,
} from "react-icons/pi";
import AppSelect from "../../Components/Shared/AppSelect";
import { toast } from "react-toastify";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { clearCart } from "../../CartUtils/cartUtils";
import { getDiscountedPrice, roundMoney } from "../../lib/money";
import { FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import Field from "../../Components/Forms/Field";

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));

const PlaceOrderForm = ({ cartItems, foods }) => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    reset,
  } = useForm();

  useEffect(() => {
    setValue("email", userEmail);
  }, [userEmail, setValue]);

  // Register react-select fields manually for validation
  useEffect(() => {
    register("region", { required: "Region is required" });
    register("district", { required: "District is required" });
    register("thana", { required: "Thana is required" });
  }, [register]);

  const [isProcessing, setIsProcessing] = useState(false);

  // State for regions, districts, and thanas.
  const [regions, setRegions] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [thanas, setThanas] = useState([]);
  const [selectedThana, setSelectedThana] = useState(null);

  // Fetch location data from the public folder.
  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/regions.json").then((res) => res.json()),
      fetch("/outlets.json").then((res) => res.json()),
    ])
      .then(([regionsData, outletsData]) => {
        if (!active) return;
        setRegions(regionsData);
        setOutlets(outletsData);
      })
      .catch(() => toast.error("Failed to load location data."));

    return () => {
      active = false;
    };
  }, []);

  // Memoized options: stable references stop react-select from
  // recomputing its focused option (which caused the blinking).
  const regionOptions = useMemo(() => toOptions(regions), [regions]);
  const districtOptions = useMemo(() => toOptions(districts), [districts]);
  const thanaOptions = useMemo(() => toOptions(thanas), [thanas]);

  // Handle region changes.
  const handleRegionChange = (selected) => {
    setSelectedRegion(selected);
    setValue("region", selected ? selected.value : "");
    trigger("region");

    if (selected) {
      const filteredDistricts = outlets
        .filter((o) => o.region === selected.value)
        .map((o) => o.district);

      setDistricts([...new Set(filteredDistricts)]);
    } else {
      setDistricts([]);
    }

    setSelectedDistrict(null);
    setSelectedThana(null);
    setThanas([]);
    setValue("district", "");
    setValue("thana", "");
    trigger("district");
    trigger("thana");
  };

  // Handle district changes.
  const handleDistrictChange = (selected) => {
    setSelectedDistrict(selected);
    setValue("district", selected ? selected.value : "");
    trigger("district");

    if (selected) {
      const districtOutlets = outlets.filter(
        (o) =>
          o.region === selectedRegion?.value && o.district === selected.value,
      );
      const covered = districtOutlets.flatMap((o) => o.covered_area);
      setThanas([...new Set(covered)]);
    } else {
      setThanas([]);
    }

    setSelectedThana(null);
    setValue("thana", "");
    trigger("thana");
  };

  // Handle thana changes.
  const handleThanaChange = (selected) => {
    setSelectedThana(selected);
    setValue("thana", selected ? selected.value : "");
    trigger("thana");
  };

  const handlePlaceOrder = async (data) => {
    if (cartItems.length <= 0) {
      toast.info("Your cart is empty!");
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate items with their food details.
      const items = cartItems
        .map((item) => {
          const food = foods.find((f) => f._id === item.foodId);

          if (!food) return null;

          const price = roundMoney(food.price);
          const discount = Number(food.discount) || 0;
          const subtotal = getDiscountedPrice(price, discount) * item.quantity;

          return {
            foodId: item.foodId,
            name: food.name,
            image: food.image,
            price,
            discount,
            quantity: item.quantity,
            subtotal,
          };
        })
        .filter(Boolean);

      // Calculate totals.
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = items.reduce(
        (sum, i) =>
          sum +
          (i.price - getDiscountedPrice(i.price, i.discount)) * i.quantity,
        0,
      );

      let deliveryCharge = cartItems.length > 1 ? 50 : 30;
      if (subtotal + deliveryCharge - discount >= 1000) {
        deliveryCharge = 0;
      }

      const total = subtotal + deliveryCharge - discount;

      // Build the order payload.
      const orderPayload = {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: {
            street: data.street,
            region: data.region,
            district: data.district,
            thana: data.thana,
          },
        },
        items,
        subtotal,
        deliveryCharge,
        discount,
        total,
        payment_status: "not_paid",
        status: "pending",
        placedAt: new Date().toISOString(),
      };

      // Send the order to the server.
      const res = await axiosSecure.post(
        `/orders?email=${userEmail}`,
        orderPayload,
      );

      if (res.data.insertedId) {
        toast.success("Your order is placed! Redirecting to payments page.");
        reset();
        clearCart();
        navigate(`/dashboard/payment/${res.data.insertedId}`);
      }
    } catch (err) {
      toast.error(`Failed to place order. ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-base-100 rounded-lg w-full">
      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <div>
          {/* Personal Details */}
          <div className="p-6 shadow-xl rounded-xl border border-base-300">
            <div className="flex gap-4 items-center mb-8">
              <div className="rounded-lg bg-primary p-3.5 text-primary-content">
                <FaUser size={23} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Personal Details</h2>
                <p className="text-xs">We'll use this info for delivery.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
              <Field
                label="First name"
                type="text"
                icon={FiUser}
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "Please enter at least 2 characters",
                  },
                })}
              />
              <Field
                label="Last name"
                type="text"
                icon={FiUser}
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Please enter at least 2 characters",
                  },
                })}
              />

              {/* Email Field (Read-only) */}
              <Field
                label="Email address"
                type="email"
                icon={FiMail}
                autoComplete="email"
                value={userEmail}
                readOnly
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />

              {/* Phone Number */}
              <Field
                label="Phone number"
                type="tel"
                icon={FiPhone}
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^(?:\+?88)?01[3-9]\d{8}$/,
                    message: "Enter a valid Bangladesh mobile number",
                  },
                })}
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-6 shadow-xl mt-8 rounded-xl border border-base-300">
            <div className="flex gap-4 items-center mb-8">
              <div className="rounded-lg bg-secondary p-3 text-secondary-content">
                <HiTruck size={30} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Delivery Details</h2>
                <p className="text-xs">
                  Where should we deliver your order in Bangladesh?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
              <Field
                className="md:col-span-3"
                label="Street address"
                type="text"
                icon={FiMapPin}
                autoComplete="street-address"
                error={errors.street?.message}
                {...register("street", {
                  required: "Street address is required",
                })}
              />

              {/* Region Select */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Region <span className="text-error">*</span>
                </label>
                <AppSelect
                  aria-label="Region"
                  aria-invalid={Boolean(errors.region)}
                  options={regionOptions}
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  placeholder="Select Region"
                />
                {errors.region && (
                  <span className="mt-1.5 block text-sm font-medium text-error">
                    {errors.region.message}
                  </span>
                )}
              </div>

              {/* District Select */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  District <span className="text-error">*</span>
                </label>
                <AppSelect
                  aria-label="District"
                  aria-invalid={Boolean(errors.district)}
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  isDisabled={!selectedRegion}
                  placeholder="Select District"
                />
                {errors.district && (
                  <span className="mt-1.5 block text-sm font-medium text-error">
                    {errors.district.message}
                  </span>
                )}
              </div>

              {/* Thana Select */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Thana <span className="text-error">*</span>
                </label>
                <AppSelect
                  aria-label="Thana"
                  aria-invalid={Boolean(errors.thana)}
                  options={thanaOptions}
                  value={selectedThana}
                  onChange={handleThanaChange}
                  isDisabled={!selectedRegion || !selectedDistrict}
                  placeholder="Select Thana"
                />
                {errors.thana && (
                  <span className="mt-1.5 block text-sm font-medium text-error">
                    {errors.thana.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-6 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 shadow-xl mt-8 rounded-xl border border-base-300">
            <button
              type="button"
              onClick={() => navigate("/allFoods")}
              className="btn flex whitespace-nowrap w-full items-center gap-2 sm:w-[49%]"
            >
              <PiArrowBendUpLeftLight size={20} /> Continue Ordering
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn flex whitespace-nowrap w-full items-center gap-2 btn-primary sm:w-[49%] disabled:text-base-content/50"
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner text-primary"></span>{" "}
                  Placing order
                </>
              ) : (
                <>
                  Place Order <PiArrowBendUpRightLight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderForm;