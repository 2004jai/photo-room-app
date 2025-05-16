import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PhotoGallery({ roomCode }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgColors, setBgColors] = useState({});

  useEffect(() => {
    if (!roomCode) return;

    setLoading(true);
    const photosRef = collection(db, "rooms", roomCode, "photos");
    const q = query(photosRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const photosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(photosData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching photos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  const handleColorChange = (id, color) => {
    setBgColors((prev) => ({ ...prev, [id]: color }));
  };

  if (loading) {
    return (
      <p className="text-center mt-6 text-orange-400 animate-pulse font-semibold">
        Loading vibes...
      </p>
    );
  }

  if (photos.length === 0) {
    return (
      <p className="text-center mt-6 text-orange-200 italic font-light">
        No photos yet. Be the first to vibe ✨
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
      {photos.map(({ id, url, caption, userId }) => (
        <div
          key={id}
          className={`rounded-xl shadow-xl p-4 bg-zinc-900 border-2 transition-all duration-500 hover:scale-[1.03] relative overflow-hidden group`}
          style={{
            backgroundColor: bgColors[id] || "#0f0f0f",
            borderColor: "rgba(255, 115, 0, 0.7)",
          }}
        >
          {/* Floating glow on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 opacity-20 blur-xl group-hover:opacity-50 rounded-2xl z-0 transition-all" />

          {/* Username Overlay */}
          <div className="absolute top-2 right-3 bg-black/50 text-orange-300 px-3 py-1 rounded-full text-xs font-bold z-20">
            @{userId}
          </div>

          <img
            src={url}
            alt={caption || "User photo"}
            className="w-full h-48 object-cover rounded-lg z-10 relative mb-3"
            loading="lazy"
          />

          <p className="text-orange-100 font-semibold mb-2 text-sm z-10 relative">
            {caption || "No caption"}
          </p>

          {/* Color Picker */}
          <div className="z-10 relative flex items-center justify-between text-sm">
            <label className="text-orange-300 font-medium">Card Color:</label>
            <input
              type="color"
              value={bgColors[id] || "#0f0f0f"}
              onChange={(e) => handleColorChange(id, e.target.value)}
              className="w-8 h-8 ml-2 border-2 border-white rounded-full cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
