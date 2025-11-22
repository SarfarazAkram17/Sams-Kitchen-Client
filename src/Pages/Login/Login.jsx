import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useAxios from "../../Hooks/useAxios";
import useAuth from "../../Hooks/useAuth";
import SocialLogin from "../../Components/Shared/SocialLogin";
import Lottie from "lottie-react";
import loginLottie from "../../assets/animations/login.json";
const Login = () => {
  const axiosInstance = useAxios();
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, forgotPassword, logOutUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const email = watch("email")?.trim() || "";

  const handleLogin = (formData) => {
    setLoading(true);

    const email = formData.email.trim();
    const password = formData.password.trim();

    loginUser(email, password)
      .then(async (res) => {
        if (!res.user.emailVerified) {
          logOutUser().then(() => {
            toast.warn("Verify your email and then login");
          });
          return;
        }
        toast.success("You logged in successfully");
        reset();

        await axiosInstance.post("/users", {
          email,
          name: res.user.displayName,
          role: "customer",
          photo: res.user.photoURL,
          createdAt: res.user.metadata.createdAt,
          last_log_in: Date.now().toString(),
        });

        navigate(location.state || "/");
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      return toast.warn("Please enter your email first.");
    }

    forgotPassword(email)
      .then(() => {
        toast.success("Password reset email send.");
        toast.warn("Also check email in the spam section");
      })
      .catch((err) => {
        toast.error(`Error in password change: ${err.message}`);
      });
  };

  return (
    <div className="flex flex-col max-w-[1500px] mx-auto px-4 sm:flex-row gap-6 justify-start items-center md:justify-center">
      <Lottie
        className="flex-1"
        animationData={loginLottie}
        loop={true}
      ></Lottie>
      <div className="card w-full flex-1 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-extrabold">Welcome Back</h1>
          <p className="mb-4 text-sm font-semibold">Login with Sam's Kitchen</p>
          <form onSubmit={handleSubmit(handleLogin)} className="fieldset">
            <label className="label font-semibold">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="input placeholder:text-[13px] placeholder:font-bold w-full"
              placeholder="Enter your email"
            />
            {errors.email?.type === "required" && (
              <p className="text-red-500 font-bold">Email is required.</p>
            )}

            <label className="label font-semibold mt-4">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input placeholder:text-[13px] placeholder:font-bold w-full"
                {...register("password", {
                  required: true,
                })}
                placeholder="Enter your password"
              />
              {errors.password?.type === "required" && (
                <p className="text-red-500 font-bold">Password is required.</p>
              )}
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
            <div>
              <a
                onClick={handleForgotPassword}
                className="link link-hover text-gray-600 font-semibold"
              >
                Forgot password?
              </a>
            </div>
            <button
              disabled={loading}
              className="btn btn-primary text-white mt-6"
            >
              {" "}
              {loading ? (
                <span className="loading loading-spinner text-primary loading-md"></span>
              ) : (
                "Login"
              )}
            </button>
            <p className="text-xs my-2">
              Don't have any account ?{" "}
              <Link
                state={location.state}
                to="/register"
                className="hover:underline text-primary font-semibold"
              >
                Register
              </Link>
            </p>
          </form>
          <div className="divider my-4">Or continue with</div>
          <SocialLogin
            state={location.state}
            message={"You login successfully"}
          ></SocialLogin>
        </div>
      </div>
    </div>
  );
};

export default Login;
