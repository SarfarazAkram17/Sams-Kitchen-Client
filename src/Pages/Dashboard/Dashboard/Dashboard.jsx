import { Navigate } from "react-router";
import useUserProfile from "../../../Hooks/useUserProfile";
import AdminDashboard from "./AdminDashboard";
import CustomerDashboard from "./CustomerDashboard";
import RiderDashboard from "./RiderDashboard";
import RiderPending from "./RiderPending";
import RiderRejected from "./RiderRejected";
import { DashboardGateSkeleton } from "../../../Components/Skeletons/PageSkeletons";

const Dashboard = () => {
  const { profile, profileLoading } = useUserProfile();

  if (profileLoading) {
    return <DashboardGateSkeleton />;
  }

  if (profile?.role === "admin") {
    return <AdminDashboard></AdminDashboard>;
  }
  if (profile?.role === "rider") {
    if (profile.riderStatus === "pending") return <RiderPending></RiderPending>;
    if (profile.riderStatus === "rejected") return <RiderRejected></RiderRejected>;
    return <RiderDashboard></RiderDashboard>;
  }
  if (profile?.role === "customer") {
    return <CustomerDashboard></CustomerDashboard>;
  }
  return <Navigate to="/forbidden"></Navigate>;
};

export default Dashboard;
