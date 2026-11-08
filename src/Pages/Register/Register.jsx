import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import axios from "axios";
import { FiCamera, FiMail, FiUser } from "react-icons/fi";
import useAuth from "../../Hooks/useAuth";
import useAxios from "../../Hooks/useAxios";
import useRoles from "../../Hooks/useRoles";
import { authErrorMessage } from "../../lib/authErrors";
import AuthShell from "../../Components/Auth/AuthShell";
import Field, { PasswordField } from "../../Components/Forms/Field";
import RoleCards from "../../Components/Auth/RoleCards";
import SocialLogin from "../../Components/Shared/SocialLogin";
import { RoleCardsSkeleton } from "../../Components/Skeletons/PageSkeletons";
import useUserProfile from "../../Hooks/useUserProfile";
import { safeDestination } from "../../lib/redirect";

const Register = () => {
  const { createUser, updateUserProfile, sendVerificationEmail, logOutUser } = useAuth();
  const axiosInstance = useAxios();
  const { selectableRoles, rolesLoading, rolesError, refetchRoles } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const role = watch("role");
  const chosenRole = selectableRoles.find((item) => item.key === role);

  useEffect(() => {
    register("role", { required: "Choose how you’ll use Sam’s Kitchen." });
  }, [register]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setPhotoError("");
  };

  // The photo lives in state rather than the form, so this check is the single source of truth.
  const submitForm = (event) => {
    if (!selectedFile) setPhotoError("Add a profile photo.");
    return handleSubmit((values) => {
      if (selectedFile) return handleRegister(values);
    })(event);
  };

  const handleRegister = async ({ name, email, password, role: roleKey }) => {
    if (loading) return;
    setLoading(true);

    try {
      const imageData = new FormData();
      imageData.append("file", selectedFile);
      imageData.append("upload_preset", import.meta.env.VITE_cloudinary_preset_name);

      const imageRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_cloudinary_cloud_name}/image/upload`,
        imageData,
      );
      const photo = imageRes.data.secure_url;
      const displayName = name.trim();

      const credential = await createUser(email.trim(), password);
      await updateUserProfile({ displayName, photoURL: photo });

      await axiosInstance.post("/users", {
        email: email.trim(),
        name: displayName,
        photo,
        role: roleKey,
        providerId: "password",
        createdAt: credential.user.metadata.createdAt,
      });

      await sendVerificationEmail();
      await logOutUser();

      toast.success("Account created. Verify your email, then sign in. Check your spam folder too.");
      navigate("/login", { state: location.state });
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (user && profile && !profile.needsOnboarding) {
    return <Navigate to={safeDestination(location.state)} replace />;
  }

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Choose how you’ll use Sam’s Kitchen. You can start ordering or delivering as soon as you verify your email."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submitForm} className="space-y-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">I want to</legend>
          {rolesLoading && <RoleCardsSkeleton />}
          {rolesError && (
            <p role="alert" className="text-sm text-error">
              Roles could not be loaded.{" "}
              <button type="button" onClick={() => refetchRoles()} className="font-semibold underline">
                Try again
              </button>
            </p>
          )}
          {!rolesLoading && !rolesError && (
            <RoleCards
              roles={selectableRoles}
              value={role}
              disabled={loading}
              onChange={(key) => setValue("role", key, { shouldValidate: true })}
            />
          )}
          {errors.role && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-error">
              {errors.role.message}
            </p>
          )}
          {chosenRole?.requiresApproval && (
            <p className="mt-2 text-sm text-base-content/70">
              After you verify your email you’ll add your phone number and delivery area. The team
              reviews every {chosenRole.label.toLowerCase()} application.
            </p>
          )}
        </fieldset>

        <div className="flex items-center gap-4">
          <label
            htmlFor="profileImage"
            className="group relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-base-300 bg-base-200 transition-colors hover:border-primary"
          >
            {preview ? (
              <img src={preview} alt="Your profile preview" className="size-full object-cover" />
            ) : (
              <FiCamera size={22} className="text-base-content/60" aria-hidden="true" />
            )}
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
          />
          <div>
            <p className="text-sm font-semibold">Profile photo</p>
            <p className={`text-sm ${photoError ? "font-medium text-error" : "text-base-content/60"}`}>
              {photoError || "Riders and customers see this on orders."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            icon={FiUser}
            autoComplete="name"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register("name", {
              required: "Enter your name.",
              minLength: { value: 6, message: "Name must be at least 6 characters." },
            })}
          />
          <Field
            label="Email"
            type="email"
            icon={FiMail}
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Enter your email.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
            })}
          />
        </div>

        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Choose a password.",
            minLength: { value: 6, message: "Password must be at least 6 characters." },
            validate: {
              hasUppercase: (value) => /[A-Z]/.test(value) || "Include an uppercase letter.",
              hasLowercase: (value) => /[a-z]/.test(value) || "Include a lowercase letter.",
              hasNumber: (value) => /\d/.test(value) || "Include a number.",
            },
          })}
        />

        <button type="submit" disabled={loading} className="btn btn-primary h-12 w-full text-base">
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Create account"}
        </button>
      </form>

      <div className="divider my-6 text-xs text-base-content/60">or sign up with</div>
      <SocialLogin state={location.state} message="Welcome to Sam’s Kitchen." />
    </AuthShell>
  );
};

export default Register;
