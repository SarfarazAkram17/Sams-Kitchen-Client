import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiBriefcase, FiPhone, FiUser } from "react-icons/fi";
import Field, { SelectField } from "../Forms/Field";

// Delivery profile an admin reviews before a rider can take orders.
const RiderDetailsForm = ({ onSubmit, onBack, submitting, defaultValues, submitLabel = "Send application" }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { region: "", district: "", thana: "", ...defaultValues } });

  const [regions, setRegions] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch("/regions.json").then((res) => res.json()),
      fetch("/outlets.json").then((res) => res.json()),
    ])
      .then(([regionList, outletList]) => {
        if (ignore) return;
        setRegions(regionList);
        setOutlets(outletList);
      })
      .catch(() => {
        if (!ignore) setLoadFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const region = watch("region");
  const district = watch("district");

  const districts = useMemo(
    () => [...new Set(outlets.filter((outlet) => outlet.region === region).map((outlet) => outlet.district))],
    [outlets, region],
  );
  const thanas = useMemo(
    () =>
      outlets
        .filter((outlet) => outlet.region === region && outlet.district === district)
        .flatMap((outlet) => outlet.covered_area),
    [outlets, region, district],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Phone number"
          type="tel"
          icon={FiPhone}
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Enter your phone number.",
            pattern: {
              value: /^(?:\+?88)?01[3-9]\d{8}$/,
              message: "Enter a valid Bangladesh mobile number.",
            },
          })}
        />
        <Field
          label="Age"
          type="number"
          icon={FiUser}
          inputMode="numeric"
          placeholder="18 or older"
          error={errors.age?.message}
          {...register("age", {
            required: "Enter your age.",
            min: { value: 18, message: "Riders must be at least 18 years old." },
          })}
        />
        <Field
          className="sm:col-span-2"
          label="Years of delivery experience"
          type="number"
          icon={FiBriefcase}
          inputMode="numeric"
          placeholder="0 if you’re new"
          error={errors.experience?.message}
          {...register("experience", {
            required: "Enter your experience.",
            min: { value: 0, message: "Experience cannot be negative." },
          })}
        />
        <SelectField
          label="Region"
          name="region"
          control={control}
          rules={{ required: "Choose your region." }}
          options={regions.map((item) => ({ value: item, label: item }))}
          placeholder="Select region"
          error={errors.region?.message}
          onValueChange={() => {
            setValue("district", "");
            setValue("thana", "");
          }}
        />
        <SelectField
          label="District"
          name="district"
          control={control}
          rules={{ required: "Choose your district." }}
          options={districts.map((item) => ({ value: item, label: item }))}
          placeholder="Select district"
          disabled={!region}
          error={errors.district?.message}
          onValueChange={() => setValue("thana", "")}
        />
        <SelectField
          className="sm:col-span-2"
          label="Thana you deliver in"
          name="thana"
          control={control}
          rules={{ required: "Choose your thana." }}
          options={thanas.map((item) => ({ value: item, label: item }))}
          placeholder="Select thana"
          disabled={!district}
          error={errors.thana?.message}
        />
      </div>

      {loadFailed && (
        <p role="alert" className="text-sm text-error">
          Delivery areas could not be loaded. Reload the page and try again.
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
        {onBack && (
          <button type="button" onClick={onBack} disabled={submitting} className="btn h-12 sm:w-32">
            Back
          </button>
        )}
        <button type="submit" disabled={submitting || loadFailed} className="btn btn-primary h-12 flex-1 text-base">
          {submitting ? <span className="loading loading-spinner loading-sm" /> : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default RiderDetailsForm;
