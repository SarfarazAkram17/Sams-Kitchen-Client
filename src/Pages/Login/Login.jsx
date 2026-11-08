import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FiMail } from "react-icons/fi";
import useAuth from "../../Hooks/useAuth";
import { useContinueAfterSignIn } from "../../Hooks/useUserProfile";
import { authErrorMessage } from "../../lib/authErrors";
import AuthShell from "../../Components/Auth/AuthShell";
import Field, { PasswordField } from "../../Components/Forms/Field";
import SocialLogin from "../../Components/Shared/SocialLogin";
import useUserProfile from "../../Hooks/useUserProfile";
import { safeDestination } from "../../lib/redirect";

const Login = () => {
  const { loginUser, forgotPassword, logOutUser } = useAuth();
  const continueAfterSignIn = useContinueAfterSignIn();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const email = watch("email")?.trim() || "";

  const handleLogin = async (formData) => {
    if (loading) return;
    setLoading(true);

    try {
      const emailAddress = formData.email.trim();
      const res = await loginUser(emailAddress, formData.password.trim());

      if (!res.user.emailVerified) {
        await logOutUser();
        toast.warn("Verify your email, then sign in. Check your spam folder too.");
        return;
      }

      await continueAfterSignIn(emailAddress, location.state);
      toast.success("You’re signed in.");
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.warn("Enter your email first.");
    }

    try {
      await forgotPassword(email);
      toast.success("Password reset email sent. Check your spam folder too.");
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };

  if (user && profile && !profile.needsOnboarding) {
    return <Navigate to={safeDestination(location.state)} replace />;
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track your orders and pick up where you left off."
      footer={
        <>
          New to Sam’s Kitchen?{" "}
          <Link to="/register" state={location.state} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4" noValidate>
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

        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password", { required: "Enter your password." })}
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className="mt-2 rounded-sm text-sm font-semibold text-base-content/70 hover:text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary h-12 w-full text-base">
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
        </button>
      </form>

      <div className="divider my-6 text-xs text-base-content/60">or continue with</div>
      <SocialLogin state={location.state} message="You’re signed in." />
    </AuthShell>
  );
};

export default Login;
