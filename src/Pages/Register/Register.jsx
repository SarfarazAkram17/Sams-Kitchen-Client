import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import userImage from "../../assets/images/image-upload-icon.png";
import axios from "axios";
import SocialLogin from "../../Components/Shared/SocialLogin";
import useAuth from "../../Hooks/useAuth";
import Lottie from "lottie-react";
import registerLottie from '../../assets/animations/register.json'

const Register = () => {
  const { createUser, updateUserProfile, sendVerificationEmail, logOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      clearErrors("photo");
    }
  };

  const handleRegister = async (data) => {
    setLoading(true);
    const { name, email, password } = data;

    // Upload image to Cloudinary
    const imageData = new FormData();
    imageData.append("file", selectedFile);
    imageData.append(
      "upload_preset",
      import.meta.env.VITE_cloudinary_preset_name
    );

    try {
      const imageRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_cloudinary_cloud_name
        }/image/upload`,
        imageData
      );

      const imageUrl = imageRes.data.secure_url;

      // Register user
      await createUser(email, password);

      const userProfile = {
        displayName: name.trim(),
        photoURL: imageUrl,
      };

      await updateUserProfile(userProfile);
      await sendVerificationEmail();
      await logOutUser();

      toast.success(
        "Registered successful. Now check email and verify yourself then login and also check email in spam folder"
      );
      reset();
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 sm:flex-row gap-6 justify-start items-center md:justify-center">
      <Lottie className="flex-1" animationData={registerLottie} loop={true}></Lottie>
      <div className="card w-full flex-1 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl md:text-3xl font-extrabold">Create Your Account</h1>
          <p className="mb-4 text-sm font-semibold">Join Sam's Kitchen today</p>

          <form onSubmit={handleSubmit(handleRegister)}>
            <label htmlFor="profileImage" className="cursor-pointer">
              <img
                src={preview || userImage}
                alt="Upload"
                className="w-13 h-13 object-cover rounded-full border-2 p-0.5 border-primary"
              />
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              {...register("photo", { required: true })}
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.photo && (
              <p className="text-red-500 font-semibold text-xs mt-1">
                Profile image is required.
              </p>
            )}

            <label className="label font-semibold mt-4 mb-2 text-xs">
              Name
            </label>
            <input
              type="text"
              {...register("name", { required: true, minLength: 6 })}
              className="input placeholder:text-[13px] placeholder:font-bold w-full"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 font-semibold text-xs mt-1">
                {errors.name.type === "required"
                  ? "Name is required."
                  : "Name must be at least 6 characters."}
              </p>
            )}

            <label className="label font-semibold mt-4 mb-2 text-xs">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="input placeholder:text-[13px] placeholder:font-bold w-full"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 font-semibold text-xs mt-1">
                Email is required.
              </p>
            )}

            <label className="label font-semibold mt-4 mb-2 text-xs">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input placeholder:text-[13px] placeholder:font-bold w-full"
                placeholder="Enter your password"
                {...register("password", {
                  required: true,
                  minLength: 6,
                  validate: {
                    hasUppercase: (value) =>
                      /[A-Z]/.test(value) ||
                      "Must include at least one uppercase letter",
                    hasLowercase: (value) =>
                      /[a-z]/.test(value) ||
                      "Must include at least one lowercase letter",
                    hasNumber: (value) =>
                      /\d/.test(value) || "Must include at least one number",
                  },
                })}
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 cursor-pointer z-10"
                  size={17}
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 cursor-pointer z-10"
                  size={17}
                />
              )}
            </div>
            {errors.password && (
              <div className="text-red-500 text-xs font-bold mt-1">
                {errors.password.message ||
                  (errors.password.type === "minLength"
                    ? "Password must be at least 6 characters."
                    : "Password is required.")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-white mt-6"
            >
              {loading ? (
                <span className="loading loading-spinner text-primary loading-md"></span>
              ) : (
                "Register"
              )}
            </button>

            <p className="text-xs my-2">
              Already have an account?{" "}
              <Link
                state={location.state}
                to="/login"
                className="hover:underline text-primary font-semibold"
              >
                Login
              </Link>
            </p>
          </form>

          <div className="divider my-4">Or continue with</div>
          <SocialLogin
            message="You registered successful"
            state={location.state}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
