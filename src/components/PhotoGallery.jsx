import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PhotoGallery({ roomCode }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;

    setLoading(true);
    const photosRef = collection(db, "rooms", roomCode, "photos");
    const q = query(photosRef);

    // Subscribe to real-time updates
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

  if (loading) {
    return (
      <p className="text-center mt-6 text-gray-600 animate-pulse">
        Loading photos...
      </p>
    );
  }

  if (photos.length === 0) {
    return (
      <p className="text-center mt-6 text-gray-500 italic">
        No photos uploaded yet. Be the first to share!
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {photos.map(({ id, url, caption, userId }) => (
        <div
          key={id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col"
        >
          <img
            src={url}
            alt={caption || "User photo"}
            className="w-full h-48 object-cover rounded-md mb-3"
            loading="lazy"
          />
          <p className="text-sm font-semibold text-gray-800 truncate">
            {caption || "No caption"}
          </p>
          <p className="text-xs text-gray-400 mt-1 truncate">User: {userId}</p>
        </div>
      ))}
    </div>
  );
}
