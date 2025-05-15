import React, { useEffect, useState } from "react";
import { loginAnonymously } from "./firebaseConfig";
import RoomForm from "./components/RoomForm";
import PhotoUploadCloudinary from "./components/PhotoUploadCloudinary";
import PhotoGallery from "./components/PhotoGallery";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

function App() {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    loginAnonymously().then(() => console.log("Logged in"));
  }, []);

  // Save photo info (url + caption) to Firestore, one photo per user per room
  async function handlePhotoUpload(url, caption) {
    const userId = auth.currentUser?.uid;
    if (!room || !userId) return;

    const photoDocRef = doc(db, "rooms", room, "photos", userId);

    try {
      await setDoc(photoDocRef, {
        url,
        caption,
        userId,
        timestamp: Date.now(),
      });
      console.log("Photo saved to Firestore");
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 sm:p-12">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 select-none drop-shadow-md">
          Photo Room
        </h1>

        {!room ? (
          <RoomForm onRoomJoin={(code) => setRoom(code)} />
        ) : (
          <>
            <p className="text-center mt-6 mb-8 text-2xl font-semibold text-gray-700">
              You're in Room <span className="text-indigo-600">{room}</span> ✅
            </p>
            <div className="space-y-10">
              <PhotoUploadCloudinary roomCode={room} onUpload={handlePhotoUpload} />
              <PhotoGallery roomCode={room} />
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-400 text-sm select-none">
        &copy; {new Date().getFullYear()} Photo Room — Built with React & Firebase
      </footer>
    </div>
  );
}

export default App;
