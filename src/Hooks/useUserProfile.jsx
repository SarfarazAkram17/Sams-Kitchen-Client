import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";
import { safeDestination } from "../lib/redirect";

export const profileKey = (email) => ["userProfile", email];

const loadProfile = async (axiosSecure, email) => {
  const res = await axiosSecure.get("/users/me", { params: { email } });
  return res.data;
};

// The signed-in account as the database sees it: role, role label and whether
// onboarding is still open.
const useUserProfile = () => {
  const { loading: authLoading, user, userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, refetch } = useQuery({
    queryKey: profileKey(userEmail),
    enabled: !authLoading && !!user && !!userEmail,
    queryFn: () => loadProfile(axiosSecure, userEmail),
    staleTime: 60_000,
  });

  return {
    profile: data ?? null,
    profileLoading: authLoading || isLoading,
    refetchProfile: refetch,
  };
};

// After a sign-in, send the person where they belong: to onboarding when the
// database has no role for them yet, otherwise to where they were headed.
export const useContinueAfterSignIn = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async (email, destination) => {
    const profile = await queryClient.fetchQuery({
      queryKey: profileKey(email),
      queryFn: () => loadProfile(axiosSecure, email),
      staleTime: 0,
    });
    if (profile.needsOnboarding) {
      navigate("/onboarding", { replace: true, state: safeDestination(destination, undefined) });
    } else {
      navigate(safeDestination(destination), { replace: true });
    }
    return profile;
  };
};

export default useUserProfile;
