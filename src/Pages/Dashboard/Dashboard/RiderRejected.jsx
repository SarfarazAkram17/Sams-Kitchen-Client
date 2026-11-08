import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiAlertCircle } from "react-icons/fi";
import RiderDetailsForm from "../../../Components/Auth/RiderDetailsForm";
import PageHeading from "../../../Components/Shared/PageHeading";
import { RiderRejectedSkeleton } from "../../../Components/Skeletons/PageSkeletons";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useConfirm from "../../../Hooks/useConfirm";
import useUserProfile, { profileKey } from "../../../Hooks/useUserProfile";

// Shown to a rider whose application was turned down: the reason, a form to fix
// the details and apply again, and a way back to a customer account.
const RiderRejected = () => {
  const { userEmail } = useAuth();
  const { profile } = useUserProfile();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: rider, isLoading } = useQuery({
    queryKey: ["riderApplication", userEmail],
    queryFn: async () =>
      (await axiosSecure.get("/riders/me", { params: { email: userEmail } }))
        .data,
  });

  const refreshAccount = () =>
    queryClient.invalidateQueries({ queryKey: profileKey(userEmail) });

  const handleReapply = async (details) => {
    setSubmitting(true);
    try {
      await axiosSecure.post("/riders/reapply", details, {
        params: { email: userEmail },
      });
      toast.success(
        "Application sent again. We’ll notify you when it’s reviewed.",
      );
      await refreshAccount();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "The application could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const confirmed = await confirm({
      title: "Use a customer account instead?",
      message:
        "Your rider application will be removed and your account becomes a customer account. You can’t apply again from here afterwards.",
      confirmLabel: "Switch to customer",
    });
    if (!confirmed) return;

    setWithdrawing(true);
    try {
      await axiosSecure.post(
        "/riders/withdraw",
        {},
        { params: { email: userEmail } },
      );
      toast.success("You’re now using a customer account.");
      await refreshAccount();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "The account could not be switched.",
      );
      setWithdrawing(false);
    }
  };

  if (isLoading) return <RiderRejectedSkeleton />;

  const reason = profile?.rejectionReason || rider?.rejectionReason;

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Rider application"
        title="Your application wasn’t approved"
        description="You can update your details and apply again, or use a customer account instead."
      />

      <section
        className="flex items-start gap-3 rounded-3xl border border-accent/35 bg-accent/10 p-5 sm:p-6"
        role="status"
      >
        <FiAlertCircle
          className="mt-0.5 shrink-0 text-accent"
          size={22}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="font-bold">Reason from the team</h2>
          <p className="mt-1 break-words text-sm leading-6 text-base-content/75">
            {reason ||
              "No reason was given. Check that your phone number and delivery area are correct, then apply again."}
          </p>
        </div>
      </section>

      <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <h2 className="text-base font-bold">Update your details</h2>
        <p className="mb-5 mt-0.5 text-sm text-base-content/60">
          Your earlier answers are filled in. Change what needs fixing, then
          send the application again.
        </p>
        <RiderDetailsForm
          key={rider?.phone || "details"}
          submitting={submitting || withdrawing}
          submitLabel="Apply again"
          defaultValues={{
            phone: rider?.phone || "",
            age: rider?.age ?? "",
            experience: rider?.experience ?? "",
            region: rider?.region || "",
            district: rider?.district || "",
            thana: rider?.thana || "",
          }}
          onSubmit={handleReapply}
        />
      </section>

      <div className="text-center">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={withdrawing || submitting}
          aria-busy={withdrawing}
          className="btn btn-ghost rounded-full text-base-content/70 hover:text-primary"
        >
          {withdrawing ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Use a customer account instead"
          )}
        </button>
      </div>
    </div>
  );
};

export default RiderRejected;