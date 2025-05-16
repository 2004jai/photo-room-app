import React, { useState, useEffect } from "react";

export default function PhotoUploadCloudinary({ roomCode, onUpload }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const cloudName = "dqklimvnl"; // Your Cloudinary cloud name
  const uploadPreset = "unsigned_preset"; // Your unsigned upload preset

  useEffect(() => {
    if (message) {
      setShowToast(true);
      const timeout = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const uploadPhoto = async () => {
    if (!file || !username.trim()) {
      setMessage("⚠️ Select a photo & enter username");
      return;
    }

    setLoading(true);
    setMessage("");
    setFadeOut(true);

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
        setFadeOut(false);

        onUpload(data.secure_url, caption, username);
      } else {
        setMessage("❌ Upload failed. Try again.");
        setFadeOut(false);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setFadeOut(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-sm text-white ${
            message.includes("✅")
              ? "bg-green-600 animate-slide-in"
              : "bg-red-600 animate-slide-in"
          }`}
        >
          {message}
        </div>
      )}

      <div className="max-w-md mx-auto bg-black rounded-2xl shadow-xl p-8 mt-20 border-2 border-orange-500 relative group overflow-hidden transition-all hover:shadow-orange-500/40 hover:scale-[1.02] duration-300">
        {/* Floating glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 opacity-30 blur-lg group-hover:opacity-50 transition duration-300 rounded-2xl z-0" />
        
        <div className="relative z-10">
          <h3
            className="text-2xl text-center mb-6 text-orange-400 font-deco font-bold tracking-widest"
            style={{ fontFamily: "'Monoton', cursive" }}
          >
            Upload Your Vibe 
          </h3>

          <input
            type="text"
            placeholder="Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full p-3 mb-4 bg-zinc-900 text-white border border-orange-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading}
            className="block w-full mb-4 text-sm text-orange-300
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-xl file:border-0
                     file:text-sm file:font-semibold
                     file:bg-orange-100 file:text-black
                     hover:file:bg-orange-200 transition duration-300"
          />

          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
            className="w-full p-3 mb-5 bg-zinc-900 text-white border border-orange-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300"
          />

          <button
            onClick={uploadPhoto}
            disabled={loading}
            className={`w-full text-black font-bold py-3 rounded-xl transition-all duration-500 shadow-md ${
              fadeOut ? "opacity-0" : "opacity-100"
            } bg-orange-500 hover:bg-orange-600 hover:scale-105 transform`}
          >
            {loading ? "Uploading..." : "Upload Photo"}
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
