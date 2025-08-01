import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useUserRole = () => {
    const { loading: authLoading, userEmail } = useAuth();
    const axiosSecure = useAxiosSecure();

    const {
        data: role = 'customer',
        isLoading: roleLoading,
    } = useQuery({
        queryKey: ['userRole', userEmail],
        enabled: !authLoading && !!userEmail,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/${userEmail}/role`);
            return res.data.role;
        },
    });

    return { role, roleLoading: authLoading || roleLoading };
};

export default useUserRole;