import { useState, useEffect } from "react";
import { FiCamera, FiEdit3, FiMail, FiShield, FiUser, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Field from "../../../Components/Forms/Field";
import { FormPage } from "../../../Components/Forms/FormKit";

const ManageProfile = () => {
  const axiosSecure = useAxiosSecure();
  const { user, userEmail, updateUserProfile } = useAuth();
  const { roleLabel, roleLoading } = useUserRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.photoURL && !preview) {
      setPreview(user.photoURL);
    }
  }, [user?.photoURL, preview]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleEditClick = () => {
    setFormData({ name: user?.displayName || "" });
    setPreview(user?.photoURL || null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (loading) return;
    const trimmedName = formData.name.trim();

    if (!trimmedName || !preview) return;
    if (isSaveDisabled) {
      toast.info("There are no profile changes to save.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = user.photoURL;
      let nameToUpdate = user.displayName;

      // Upload new image to Cloudinary if changed
      if (selectedFile) {
        const imageData = new FormData();
        imageData.append("file", selectedFile);
        imageData.append(
          "upload_preset",
          import.meta.env.VITE_cloudinary_preset_name
        );

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_cloudinary_cloud_name
          }/image/upload`,
          imageData
        );

        imageUrl = res.data.secure_url;
      }

      if (trimmedName !== user.displayName) {
        nameToUpdate = trimmedName;
      }

      await updateUserProfile({
        displayName: nameToUpdate,
        photoURL: imageUrl,
      });

     await axiosSecure.patch(`/users?email=${userEmail}`, {
        name: nameToUpdate,
        photo: imageUrl,
      })

      toast.success('Profile update successfully')
      setIsModalOpen(false)
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled =
    formData.name.trim() === user?.displayName && preview === user?.photoURL;

  const nameMissing = !formData.name.trim();

  return (
    <FormPage
      eyebrow="Account"
      title={`Welcome back, ${user?.displayName || ""}`}
      subtitle="Your name and photo appear on orders, deliveries and reviews."
    >
      <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <img
            src={user?.photoURL}
            alt="Your profile"
            className="size-36 shrink-0 rounded-full border-4 border-primary object-cover shadow-[var(--shadow-float)] sm:size-40"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <dl className="space-y-3 text-sm">
              {[
                { icon: FiUser, label: "Name", value: user?.displayName },
                { icon: FiMail, label: "Email", value: userEmail },
                { icon: FiShield, label: "Role", value: !roleLoading && roleLabel },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-base-200/60 px-4 py-3 text-left">
                  <Icon className="shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-base-content/60">{label}</dt>
                    <dd className="break-words font-semibold">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <button onClick={handleEditClick} className="btn btn-primary h-11 gap-2 rounded-full px-6">
              <FiEdit3 aria-hidden="true" />
              Edit profile
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close edit profile dialog"
            className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-md"
            onClick={() => !loading && setIsModalOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-edit-title"
              className="surface-panel relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl p-5 shadow-xl sm:p-8"
            >
              <button
                onClick={() => !loading && setIsModalOpen(false)}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-base-content/60 transition hover:bg-base-200 hover:text-error"
                aria-label="Close dialog"
                disabled={loading}
              >
                <FiX size={20} />
              </button>

              <h3 id="profile-edit-title" className="mb-6 pr-8 font-display text-2xl">
                Edit profile
              </h3>

              <div className="mb-5 flex items-center gap-4">
                <label
                  htmlFor="profileImage"
                  className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-primary"
                >
                  {preview && <img src={preview} alt="Profile preview" className="size-full object-cover" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <FiCamera size={20} aria-hidden="true" />
                  </span>
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById("profileImage").click()}
                    disabled={loading}
                    className="btn btn-sm rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-content"
                  >
                    Change photo
                  </button>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                  {!preview && <p className="mt-1.5 text-sm font-medium text-error">Profile image is required.</p>}
                </div>
              </div>

              <Field
                label="Name"
                icon={FiUser}
                name="profile-name"
                autoComplete="name"
                value={formData.name}
                error={nameMissing ? "Name is required." : undefined}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => !loading && setIsModalOpen(false)}
                  className="btn h-11"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button onClick={handleUpdate} className="btn btn-primary h-11 sm:min-w-32" disabled={loading} aria-busy={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </FormPage>
  );
};

export default ManageProfile;
