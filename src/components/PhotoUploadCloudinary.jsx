import React, { useState } from "react";

export default function PhotoUploadCloudinary({ onUpload }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cloudName = "dqklimvnl"; // Your Cloudinary cloud name
  const uploadPreset = "unsigned_preset"; // Your unsigned upload preset

  const uploadPhoto = async () => {
    if (!file) {
      setMessage("⚠️ Please select a photo.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setMessage("✅ Upload successful!");
        setFile(null);
        setCaption("");

        // Notify parent component to save photo URL and caption
        onUpload(data.secure_url, caption);
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      setMessage(`❌ Upload error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 mt-10">
      <h3 className="text-xl font-semibold mb-5 text-center text-indigo-700">
        Upload Photo & Caption
      </h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
        className="block w-full mb-4 text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-100 file:text-indigo-700
                   hover:file:bg-indigo-200"
      />

      <input
        type="text"
        placeholder="Add a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={loading}
        className="w-full p-3 border border-gray-300 rounded-md mb-5
                   focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <button
        onClick={uploadPhoto}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300
                   text-white py-3 rounded-md font-semibold transition"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
