import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

// Role definitions from the database: key, label, description and whether
// people can choose the role themselves.
const useRoles = () => {
  const axiosInstance = useAxios();

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await axiosInstance.get("/roles")).data,
    staleTime: 5 * 60_000,
  });

  return {
    roles: data,
    selectableRoles: data.filter((role) => role.selectable),
    rolesLoading: isLoading,
    rolesError: isError,
    refetchRoles: refetch,
  };
};

export default useRoles;
