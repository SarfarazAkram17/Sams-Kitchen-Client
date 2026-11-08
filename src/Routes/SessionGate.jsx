import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../Hooks/useAuth";
import useUserProfile from "../Hooks/useUserProfile";
import RouteSkeleton from "../Components/Skeletons/RouteSkeleton";
import { safeDestination } from "../lib/redirect";

// Wraps every route. Holds the page back until the first sign-in check is
// done, then keeps anyone whose role is not set yet inside onboarding.
const SessionGate = () => {
  const { user } = useAuth();
  const { profile, profileLoading } = useUserProfile();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!profileLoading) setReady(true);
  }, [profileLoading]);

  if (!ready && profileLoading) {
    return <RouteSkeleton />;
  }

  const onOnboarding = location.pathname === "/onboarding";

  if (onOnboarding && !profileLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (user && profile?.needsOnboarding && !onOnboarding) {
    return <Navigate to="/onboarding" replace state={safeDestination(location.pathname, undefined)} />;
  }

  return <Outlet />;
};

export default SessionGate;
