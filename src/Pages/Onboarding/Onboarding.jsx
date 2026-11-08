import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuth from "../../Hooks/useAuth";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useRoles from "../../Hooks/useRoles";
import useUserProfile, { profileKey } from "../../Hooks/useUserProfile";
import AuthShell from "../../Components/Auth/AuthShell";
import RoleCards from "../../Components/Auth/RoleCards";
import RiderDetailsForm from "../../Components/Auth/RiderDetailsForm";
import { RoleCardsSkeleton } from "../../Components/Skeletons/PageSkeletons";
import { safeDestination } from "../../lib/redirect";

// Asked once, right after the first sign-in: choose a role. Roles that need
// approval (riders) also collect the details the team reviews.
const Onboarding = () => {
  const { userEmail, logOutUser } = useAuth();
  const { profile } = useUserProfile();
  const { selectableRoles, rolesLoading, rolesError, refetchRoles } = useRoles();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const finished = useRef(false);

  // A role picked at registration (a rider) resumes at the details step.
  const [roleKey, setRoleKey] = useState(profile?.role || null);
  const [step, setStep] = useState(profile?.role ? "details" : "role");
  const [submitting, setSubmitting] = useState(false);

  if (profile && !profile.needsOnboarding && !finished.current) {
    return <Navigate to="/" replace />;
  }

  const chosenRole = selectableRoles.find((role) => role.key === roleKey);
  const showDetails = step === "details" && chosenRole?.requiresApproval;

  const complete = async (body) => {
    setSubmitting(true);
    try {
      const res = await axiosSecure.post("/users/onboarding", body, {
        params: { email: userEmail },
      });
      finished.current = true;
      queryClient.setQueryData(profileKey(userEmail), res.data);

      const underReview = res.data.riderStatus === "pending";
      toast.success(
        underReview
          ? "Application sent. We’ll notify you when it’s approved."
          : "You’re all set. Welcome to Sam’s Kitchen.",
      );
      navigate(underReview ? "/dashboard" : safeDestination(location.state), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save your role. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (chosenRole?.requiresApproval) {
      setStep("details");
    } else {
      complete({ role: chosenRole.key });
    }
  };

  const handleSignOut = async () => {
    await logOutUser();
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell
      wide
      title={showDetails ? `Your ${chosenRole.label.toLowerCase()} details` : "How will you use Sam’s Kitchen?"}
      subtitle={
        showDetails
          ? "The team reviews every application. We’ll notify you as soon as it’s approved."
          : "Pick a role to finish setting up your account."
      }
      footer={
        <>
          Signed in as <span className="font-semibold">{userEmail}</span>.{" "}
          <button type="button" onClick={handleSignOut} className="font-semibold text-primary hover:underline">
            Sign out
          </button>
        </>
      }
    >
      {showDetails ? (
        <RiderDetailsForm
          submitting={submitting}
          onBack={() => setStep("role")}
          onSubmit={(details) => complete({ role: chosenRole.key, profile: details })}
        />
      ) : (
        <div className="space-y-6">
          {rolesLoading && <RoleCardsSkeleton />}
          {rolesError && (
            <p role="alert" className="text-sm text-error">
              Roles could not be loaded.{" "}
              <button type="button" onClick={() => refetchRoles()} className="font-semibold underline">
                Try again
              </button>
            </p>
          )}
          {!rolesLoading && !rolesError && (
            <RoleCards roles={selectableRoles} value={roleKey} disabled={submitting} onChange={setRoleKey} />
          )}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!chosenRole || submitting}
            className="btn btn-primary h-12 w-full text-base"
          >
            {submitting ? <span className="loading loading-spinner loading-sm" /> : "Continue"}
          </button>
        </div>
      )}
    </AuthShell>
  );
};

export default Onboarding;
