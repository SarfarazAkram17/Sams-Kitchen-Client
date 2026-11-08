import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import { useContinueAfterSignIn } from "../../Hooks/useUserProfile";
import { authErrorMessage } from "../../lib/authErrors";

const GoogleIcon = () => (
  <svg aria-hidden="true" width="22" height="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
    <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
    <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
    <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
  </svg>
);

const FacebookIcon = () => (
  <svg aria-hidden="true" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path fill="#1A77F2" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z" />
  </svg>
);

// Google and Facebook sign-in. Someone new to the app is sent to onboarding to
// choose a role; everyone else continues to where they were headed.
const SocialLogin = ({ state, message }) => {
  const { continueWithGoogle, continueWithFacebook } = useAuth();
  const continueAfterSignIn = useContinueAfterSignIn();
  const [busy, setBusy] = useState("");

  const signIn = async (name, start) => {
    if (busy) return;
    setBusy(name);
    try {
      const res = await start();
      const email = res.user?.email || res.user?.providerData?.[0]?.email;
      const profile = await continueAfterSignIn(email, state);
      toast.success(profile.needsOnboarding ? "Signed in. Choose your role to finish." : message);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy("");
    }
  };

  const buttonClass = "btn h-12 w-full gap-3 border-base-300 bg-base-200/70 font-semibold";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => signIn("google", continueWithGoogle)}
        disabled={Boolean(busy)}
        className={buttonClass}
      >
        {busy === "google" ? <span className="loading loading-spinner loading-sm" /> : <GoogleIcon />}
        Google
      </button>
      <button
        type="button"
        onClick={() => signIn("facebook", continueWithFacebook)}
        disabled={Boolean(busy)}
        className={buttonClass}
      >
        {busy === "facebook" ? <span className="loading loading-spinner loading-sm" /> : <FacebookIcon />}
        Facebook
      </button>
    </div>
  );
};

export default SocialLogin;
