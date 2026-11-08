// Where to send someone after sign-in. Only in-app paths are accepted, and the
// auth pages are never a destination, so nobody is sent back to /login after
// they have signed in.
const AUTH_PATHS = ["/login", "/register", "/onboarding"];

export const safeDestination = (value, fallback = "/") => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  const onAuthPage = AUTH_PATHS.some((path) => value === path || value.startsWith(`${path}/`));
  return onAuthPage ? fallback : value;
};
