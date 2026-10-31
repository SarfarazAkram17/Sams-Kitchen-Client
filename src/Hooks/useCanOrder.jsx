import useAuth from "./useAuth";
import useUserRole from "./useUserRole";

// Only customers can order. Visitors who are not signed in still see the
// order buttons (they are sent to log in); every other role does not.
const useCanOrder = () => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useUserRole();

  if (loading) return false;
  if (!user) return true;
  return !roleLoading && role === "customer";
};

export default useCanOrder;
