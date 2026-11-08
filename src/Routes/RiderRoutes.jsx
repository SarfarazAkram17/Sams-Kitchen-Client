import useAuth from "../Hooks/useAuth";
import useUserProfile from "../Hooks/useUserProfile";
import { Navigate } from "react-router";
import RouteSkeleton from "../Components/Skeletons/RouteSkeleton";

const RiderRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  const { profile, profileLoading } = useUserProfile();

  if (loading || profileLoading) {
    return <RouteSkeleton />;
  }

  if (!user || profile?.role !== "rider") {
    return <Navigate to="/forbidden"></Navigate>;
  }

  // Applications under review or rejected land on the dashboard notice instead.
  if (["pending", "rejected"].includes(profile.riderStatus)) {
    return <Navigate to="/dashboard"></Navigate>;
  }

  return children;
};

export default RiderRoutes;
