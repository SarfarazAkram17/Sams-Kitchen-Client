import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuth from "../../Hooks/useAuth";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { HiTruck } from "react-icons/hi";
import {
  PiArrowBendUpLeftLight,
  PiArrowBendUpRightLight,
} from "react-icons/pi";
import Select from "react-select";
import { toast } from "react-toastify";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { clearCart } from "../../CartUtils/cartUtils";

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

  // 🔹 State for regions, districts, thanas
  const [regions, setRegions] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [thanas, setThanas] = useState([]);

  // 🔹 Fetch data from public folder
  useEffect(() => {
    fetch("/regions.json")
      .then((res) => res.json())
      .then((data) => setRegions(data));

    fetch("/outlets.json")
      .then((res) => res.json())
      .then((data) => setOutlets(data));
  }, []);

  // 🔹 Handle Region Change
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
    setThanas([]);
    setValue("district", "");
    setValue("thana", "");
    trigger("district");
    trigger("thana");
  };

  // 🔹 Handle District Change
  const handleDistrictChange = (selected) => {
    setSelectedDistrict(selected);
    setValue("district", selected ? selected.value : "");
    trigger("district");

    if (selected) {
      const districtOutlets = outlets.filter(
        (o) =>
          o.region === selectedRegion?.value && o.district === selected.value
      );
      const covered = districtOutlets.flatMap((o) => o.covered_area);
      setThanas(covered);
    } else {
      setThanas([]);
    }

    setValue("thana", "");
    trigger("thana");
  };

  // 🔹 Handle Thana Change
  const handleThanaChange = (selected) => {
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
      // 🔹 Calculate items with food details
      const items = cartItems
        .map((item) => {
          const food = foods.find((f) => f._id === item.foodId);

          if (!food) return null;

          const price = Number(food.price);
          const discount = Number(food.discount) || 0;
          const discountedPrice = price - (price * discount) / 100;
          const subtotal = discountedPrice * item.quantity;

          return {
            foodId: item.foodId,
            name: food.name,
            image: food.image,
            price,
            discount,
            quantity: item.quantity,
            subtotal: Number(subtotal.toFixed(2)),
          };
        })
        .filter(Boolean);

      // 🔹 Totals
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = items.reduce(
        (sum, i) => sum + i.price * (i.discount / 100) * i.quantity,
        0
      );

      let deliveryCharge = cartItems.length > 1 ? 50 : 30;
      if (subtotal + deliveryCharge - discount >= 1000) {
        deliveryCharge = 0;
      }

      const total = subtotal + deliveryCharge - discount;

      // 🔹 Build payload
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
        subtotal: Number(subtotal.toFixed(2)),
        deliveryCharge,
        discount: Number(discount.toFixed(2)),
        total: Number(total.toFixed(2)),
        payment_status: "not_paid",
        status: "pending",
        placedAt: new Date().toISOString(),
      };

      // 🔹 Send to server
      const res = await axiosSecure.post(
        `/orders?email=${userEmail}`,
        orderPayload
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
    <div className="bg-white rounded-lg w-full">
      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <div>
          {/* Personal Details */}
          <div className="p-6 shadow-xl rounded-xl border border-sky-300">
            <div className="flex gap-4 items-center mb-8">
              <div className="rounded-lg shadow-lg p-3.5 bg-red-500 text-white">
                <FaUser size={23} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Personal Details</h2>
                <p className="text-xs">We'll use this info for delivery.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
              <div>
                <label className="text-xs font-semibold">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.lastName.message}
                  </span>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="text-xs font-semibold">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
                  value={userEmail}
                  readOnly
                  {...register("email", {
                    required: "Email is required",
                  })}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                />
                {errors.phone && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-6 shadow-xl mt-8 rounded-xl border border-sky-300">
            <div className="flex gap-4 items-center mb-8">
              <div className="rounded-lg shadow-lg p-3 bg-blue-500 text-white">
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
              <div className="md:col-span-3">
                <label className="text-xs font-semibold">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 border border-gray-400 rounded-md text-xs xl:text-sm"
                  {...register("street", {
                    required: "Street address is required",
                  })}
                />
                {errors.street && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.street.message}
                  </span>
                )}
              </div>

              {/* Region Select */}
              <div>
                <label className="text-xs font-semibold">
                  Region <span className="text-red-500">*</span>
                </label>
                <Select
                  options={regions.map((r) => ({ value: r, label: r }))}
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  placeholder="Select Region"
                  className="text-xs xl:text-sm mt-1"
                />
                {errors.region && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.region.message}
                  </span>
                )}
              </div>

              {/* District Select */}
              <div>
                <label className="text-xs font-semibold">
                  District <span className="text-red-500">*</span>
                </label>
                <Select
                  options={districts.map((d) => ({ value: d, label: d }))}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  isDisabled={!selectedRegion}
                  placeholder="Select District"
                  className="text-xs xl:text-sm mt-1"
                />
                {errors.district && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.district.message}
                  </span>
                )}
              </div>

              {/* Thana Select */}
              <div>
                <label className="text-xs font-semibold">
                  Thana <span className="text-red-500">*</span>
                </label>
                <Select
                  options={thanas.map((t) => ({ value: t, label: t }))}
                  onChange={handleThanaChange}
                  isDisabled={!selectedRegion || !selectedDistrict}
                  placeholder="Select Thana"
                  className="text-xs xl:text-sm mt-1"
                />
                {errors.thana && (
                  <span className="text-red-500 text-xs mt-1 font-semibold">
                    {errors.thana.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-6 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 shadow-xl mt-8 rounded-xl border border-sky-300">
            <button
              type="button"
              onClick={() => navigate("/allFoods")}
              className="btn flex whitespace-nowrap w-full items-center gap-2 sm:w-[49%]"
            >
              <PiArrowBendUpLeftLight size={20} /> Continue Ordering
            </button>
            <button
              type="submit"
              className="btn flex whitespace-nowrap w-full items-center gap-2 btn-primary sm:w-[49%] text-white disabled:text-black/50"
              disabled={isProcessing || cartItems.length <= 0}
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
