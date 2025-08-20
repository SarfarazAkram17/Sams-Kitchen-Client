import Loading from "../../../Components/Loading/Loading";
import useUserRole from "../../../Hooks/useUserRole";
import Forbidden from "../../Forbidden/Forbidden";
import AdminDashboard from "./AdminDashboard";
import CustomerDashboard from "./CustomerDashboard";
import RiderDashboard from "./RiderDashboard";

const Dashboard = () => {
  const { role, roleLoading } = useUserRole();

  if (roleLoading) {
    return <Loading></Loading>;
  }

  if (role === "admin") {
    return <AdminDashboard></AdminDashboard>;
  } else if (role === "rider") {
    return <RiderDashboard></RiderDashboard>;
  } else if (role === "customer") {
    return <CustomerDashboard></CustomerDashboard>;
  } else {
    return <Forbidden></Forbidden>;
  }
};

export default Dashboard;