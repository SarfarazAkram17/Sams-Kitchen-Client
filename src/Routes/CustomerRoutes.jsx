import useAuth from "../Hooks/useAuth";
import useUserRole from "../Hooks/useUserRole";
import { Navigate } from "react-router";
import RouteSkeleton from "../Components/Skeletons/RouteSkeleton";

const CustomerRoutes = ({children}) => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return <RouteSkeleton />;
  }

  if (!user || role !== "customer") {
    return <Navigate to="/forbidden"></Navigate>;
  }

  return children;
};

export default CustomerRoutes;