import { useForm } from "react-hook-form";
import useAuth from "../../../Hooks/useAuth";
import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Swal from "sweetalert2";

const BeARider = () => {
  const [submitting, setSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { user, userEmail } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    reset,
  } = useForm();

  const [regions, setRegions] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [thanas, setThanas] = useState([]);
  const [selectedThana, setSelectedThana] = useState(null);

  useEffect(() => {
    setValue("name", user.displayName);
    setValue("email", userEmail);
  }, [user, userEmail, setValue]);

  // Register react-select fields manually for validation
  useEffect(() => {
    register("region", { required: "Region is required" });
    register("district", { required: "District is required" });
    register("thana", { required: "Thana is required" });
  }, [register]);

  useEffect(() => {
    fetch("/regions.json")
      .then((res) => res.json())
      .then((data) => setRegions(data));

    fetch("/outlets.json")
      .then((res) => res.json())
      .then((data) => setOutlets(data));
  }, []);

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
    setSelectedThana(null);  // Reset thana selection
    setValue("district", "");
    setValue("thana", "");
    trigger("district");
    trigger("thana");
  };

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

    setSelectedThana(null);  // Reset thana selection when district changes
    setValue("thana", "");
    trigger("thana");
  };

  const handleThanaChange = (selected) => {
    setSelectedThana(selected);
    setValue("thana", selected ? selected.value : "");
    trigger("thana");
  };

  const handleSubmitRiderForm = async (data) => {
    setSubmitting(true);

    try {
      const riderApplication = {
        name: data.name,
        email: data.email,
        age: data.age,
        phone: data.phone,
        experience: parseInt(data.experience),
        region: data.region,
        district: data.district,
        thana: data.thana,
      };

      const res = await axiosSecure.post(
        `/applications?email=${userEmail}`,
        riderApplication
      );
      if (res.data.insertedId) {
        reset();
        setSelectedRegion(null);
        setSelectedDistrict(null);
        setThanas([]);
        setSelectedThana(null);  // Reset selected thana state
        setValue("thana", "");  // Reset thana field value

        Swal.fire({
          icon: "success",
          title: "Application Submitted successfully!",
          text: "Waiting for admin approval.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        reset();
        setSelectedRegion(null);
        setSelectedDistrict(null);
        setThanas([]);
        setSelectedThana(null);  // Reset selected thana state
        toast.info(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 mb-8">
      <h1 className="text-3xl sm:text-4xl text-primary font-bold text-center mb-5">
        Be a Rider at Sam's Kitchen
      </h1>
      <p className="mb-10 text-center text-xs leading-relaxed max-w-2xl mx-auto">
        Join our delivery team and start earning by delivering delicious meals
        to customers. Simply fill out the form with your details and experience,
        and once approved, you'll get access to your Rider Dashboard to manage
        orders and track earnings. Apply now and start your journey with us!
      </p>

      <form onSubmit={handleSubmit(handleSubmitRiderForm)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
              value={user.displayName}
              readOnly
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1 font-semibold">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email Address (Read-only) */}
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

          {/* Age */}
          <div>
            <label className="text-xs font-semibold">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
              {...register("age", {
                required: "Age is required",
                min: {
                  value: 18,
                  message: "You must be at least 18 years old",
                },
              })}
            />
            {errors.age && (
              <span className="text-red-500 text-xs mt-1 font-semibold">
                {errors.age.message}
              </span>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="text-xs font-semibold">
              Experience in years <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-400 rounded-md text-xs xl:text-sm mt-1"
              {...register("experience", {
                required: "Experience is required",
              })}
            />
            {errors.experience && (
              <span className="text-red-500 text-xs mt-1 font-semibold">
                {errors.experience.message}
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
              value={selectedThana}
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

        <button
          type="submit"
          className="btn mt-10 btn-primary w-full text-white disabled:text-black/50"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner text-primary"></span> 
              Submitting Application
            </>
          ) : (
            <>Submit Application</>
          )}
        </button>
      </form>
    </div>
  );
};

export default BeARider;
