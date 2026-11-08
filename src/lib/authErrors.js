const messages = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
  "auth/cancelled-popup-request": "The sign-in window was closed before finishing.",
  "auth/account-exists-with-different-credential":
    "This email already uses another sign-in method. Use that one instead.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
  "auth/weak-password": "Choose a stronger password.",
};

export const authErrorMessage = (error) =>
  messages[error?.code] ||
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Try again.";
