import useUserProfile from "./useUserProfile";

// Role information comes from the database through the account profile.
const useUserRole = () => {
  const { profile, profileLoading } = useUserProfile();

  return {
    role: profile?.role ?? null,
    roleLabel: profile?.roleLabel ?? null,
    roleLoading: profileLoading,
  };
};

export default useUserRole;
