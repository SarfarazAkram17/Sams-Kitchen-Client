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
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!preview) {
      toast.error("Please select a profile image");
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
        Welcome back, {user?.displayName} 👋
      </h2>

      <div className="shadow-lg w-fit p-6 bg-white rounded-lg">
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
            <Link to="/dashboard/beARider">
              <button className="text-white btn btn-primary">
                Be a Rider
              </button>
            </Link>{" "}
          </div>
        )}

        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 z-40 backdrop-blur-md"
              onClick={() => !loading && setIsModalOpen(false)}
            ></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white border rounded-lg max-w-md w-full p-8 relative shadow-xl">
                <button
                  onClick={() => !loading && setIsModalOpen(false)}
                  className="absolute top-4 right-4 hover:text-red-500 cursor-pointer text-gray-500 transition"
                  aria-label="Close modal"
                  disabled={loading}
                >
                  <FiX size={26} />
                </button>

                <h3 className="text-2xl font-semibold mb-6 text-center">
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
                    className="btn bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white"
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
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      !preview ||
                      isSaveDisabled
                    }
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
