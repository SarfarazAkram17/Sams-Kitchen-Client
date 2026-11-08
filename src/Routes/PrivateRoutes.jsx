import { Navigate, useLocation } from "react-router";
import useAuth from "../Hooks/useAuth";
import RouteSkeleton from "../Components/Skeletons/RouteSkeleton";

const PrivateRoutes = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteSkeleton />;
  }

  if (!user) {
    return <Navigate state={location.pathname} to="/login"></Navigate>;
  }

  return children;
};

export default PrivateRoutes;
