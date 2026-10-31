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
    if (loading) return;
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
    <div className="auth-shell flex flex-col max-w-[1500px] mx-auto px-3 sm:px-5 sm:flex-row gap-6 justify-start items-center md:justify-center mb-16">
      <Lottie
        className="hidden sm:block flex-1 max-w-xl"
        animationData={loginLottie}
        loop={true}
      ></Lottie>
      <div className="card w-full min-w-0 flex-1 border border-base-300 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-extrabold">Welcome Back</h1>
          <p className="mb-4 text-sm font-semibold">Login with Sam's Kitchen</p>
          <form onSubmit={handleSubmit(handleLogin)} className="fieldset">
            <label className="label font-semibold">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required.",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
              })}
              className="input placeholder:text-[13px] placeholder:font-bold w-full"
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm font-semibold text-error">{errors.email.message}</p>}

            <label className="label font-semibold mt-4">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input placeholder:text-[13px] placeholder:font-bold w-full"
                {...register("password", {
                  required: "Password is required.",
                })}
                placeholder="Enter your password"
              />
              {errors.password?.type === "required" && (
                <p className="mt-1 text-sm font-semibold text-error">{errors.password.message}</p>
              )}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full text-base-content/65 hover:bg-base-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showPassword ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="link link-hover rounded-sm text-base-content/70 font-semibold focus-visible:outline-2 focus-visible:outline-primary"
              >
                Forgot password?
              </button>
            </div>
            <button
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
