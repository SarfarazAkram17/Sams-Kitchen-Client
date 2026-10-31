import { useState, useEffect } from "react";
import { FiEdit3, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../../Hooks/useAuth";
import useUserRole from "../../../Hooks/useUserRole";
import { Link } from "react-router";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const ManageProfile = () => {
  const axiosSecure = useAxiosSecure();
  const { user, userEmail, updateUserProfile } = useAuth();
  const { role, roleLoading } = useUserRole();

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

  return (
    <div className="px-4">
      <h2 className="text-3xl font-bold mb-8 text-primary">
        Welcome back, {user?.displayName}
      </h2>

      <div className="surface-panel w-full max-w-3xl p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-8 md:items-center">
          <img
            src={user?.photoURL}
            alt="Profile"
            className="w-44 h-44 rounded-full object-cover border-4 border-primary shadow"
          />
          <div className="flex-1 space-y-3">
            <p>
              <span className="font-semibold">Name:</span> {user?.displayName}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {userEmail}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              <span className="capitalize">{!roleLoading && role}</span>
            </p>
            <button
              onClick={handleEditClick}
              className="btn btn-outline btn-primary mt-4 flex items-center gap-2"
            >
              <FiEdit3 />
              Edit Profile
            </button>
          </div>
        </div>

        {!roleLoading && role === "customer" && (
          <div className="mt-10">
            <Link to="/dashboard/beARider" className="btn btn-primary text-primary-content">
              Be a Rider
            </Link>
          </div>
        )}

        {isModalOpen && (
          <>
            <button
              type="button"
              aria-label="Close edit profile dialog"
              className="fixed inset-0 z-40 cursor-default backdrop-blur-md"
              onClick={() => !loading && setIsModalOpen(false)}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <div role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" className="surface-panel relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl p-5 shadow-xl sm:p-8">
                <button
                  onClick={() => !loading && setIsModalOpen(false)}
                  className="absolute top-4 right-4 hover:text-red-500 cursor-pointer text-gray-500 transition"
                  aria-label="Close modal"
                  disabled={loading}
                >
                  <FiX size={26} />
                </button>

                <h3 id="profile-edit-title" className="text-2xl font-semibold mb-6 text-center">
                  Edit Profile
                </h3>

                <div className="flex flex-col items-start mb-4">
                  <label
                    htmlFor="profileImage"
                    className="cursor-pointer block w-32 h-32 rounded-full border-2 border-primary overflow-hidden mb-2"
                  >
                    <img
                      src={preview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  </label>

                  <button
                    onClick={() =>
                      document.getElementById("profileImage").click()
                    }
                    className="btn border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-content"
                  >
                    Change Profile Photo
                  </button>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {!preview && (
                    <p className="text-red-500 text-center font-semibold mb-4">
                      Profile image is required.
                    </p>
                  )}
                </div>

                <label className="label font-semibold mt-4 mb-2">Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                {!formData.name.trim() && (
                  <p className="text-red-500 text-sm font-semibold mt-2">
                    Name is required.
                  </p>
                )}

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => !loading && setIsModalOpen(false)}
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="btn btn-primary text-white"
                  >
                    {loading ? (
                      <span className="loading loading-spinner text-primary"></span>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageProfile;
