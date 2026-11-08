import { useState } from "react";
import axios from "axios";

const MAX_BYTES = 5 * 1024 * 1024;

// Uploads one image to Cloudinary and keeps the resulting URL.
const useImageUpload = (initialUrl = "") => {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", import.meta.env.VITE_cloudinary_preset_name);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_cloudinary_cloud_name}/image/upload`,
        body,
      );
      setUrl(res.data.secure_url);
    } catch {
      setError("Image upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return { url, setUrl, uploading, error, setError, upload, clear: () => setUrl("") };
};

export default useImageUpload;
