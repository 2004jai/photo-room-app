import React, { useEffect, useState } from "react";
import { loginAnonymously, db, auth } from "./firebaseConfig";
import RoomForm from "./components/RoomForm";
import PhotoUploadCloudinary from "./components/PhotoUploadCloudinary";
import PhotoGallery from "./components/PhotoGallery";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";

// Simple room avatar generator (returns emoji based on room code)
function roomAvatar(roomCode) {
  if (!roomCode) return "❓";
  const emojis = ["🔥", "🌟", "⚡", "🌈", "🧡", "✨", "🎉", "🚀", "💥", "🌙"];
  let sum = 0;
  for (let char of roomCode) sum += char.charCodeAt(0);
  return emojis[sum % emojis.length];
}

// Generate shareable invite URL
function getInviteURL(roomCode) {
  return `${window.location.origin}?room=${roomCode}`;
}

function App() {
  const [room, setRoom] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    loginAnonymously().then(() => console.log("Logged in"));
  }, []);

  // Listen to photo docs in room to count users
  useEffect(() => {
    if (!room) {
      setUserCount(0);
      return;
    }

    const photosRef = collection(db, "rooms", room, "photos");
    const unsubscribe = onSnapshot(photosRef, (snapshot) => {
      setUserCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [room]);

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

  // Copy invite URL to clipboard
  const handleCopyInvite = () => {
    const inviteURL = getInviteURL(room);
    navigator.clipboard.writeText(inviteURL).then(() => {
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    });
  };

  // Generate a QR code URL for the invite using a free service
  const qrCodeURL = room
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        getInviteURL(room)
      )}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Glow background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="w-64 h-64 bg-pink-500 blur-[160px] opacity-30 absolute -top-20 -left-20 rounded-full" />
        <div className="w-64 h-64 bg-orange-400 blur-[140px] opacity-20 absolute top-40 right-10 rounded-full" />
      </div>

      <div className="w-full max-w-4xl bg-zinc-950 rounded-2xl border border-orange-400 shadow-orange-600 shadow-md p-8 sm:p-12 relative overflow-hidden z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 opacity-10 blur-xl rounded-2xl z-0" />

        <h1 className="text-4xl font-extrabold text-center text-orange-400 mb-6 select-none drop-shadow-md z-10 relative flex items-center justify-center gap-3">
          {room ? (
            <>
              {roomAvatar(room)} Photo Room
            </>
          ) : (
            "Photo Room"
          )}
        </h1>

        {!room ? (
          <RoomForm onRoomJoin={(code) => setRoom(code)} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 z-10 relative">
              <p className="text-2xl font-semibold text-orange-300 mb-3 sm:mb-0 select-none">
                You're in Room <span className="text-pink-400">{room}</span> ✅
              </p>

              <div className="flex items-center gap-4">
                <p className="text-lg text-orange-400 select-none">
                  Users: <span className="font-semibold">{userCount}</span>
                </p>

                {/* Invite Link and QR */}
                <button
                  onClick={handleCopyInvite}
                  className="bg-orange-500 hover:bg-orange-600 transition rounded-full px-4 py-2 font-semibold drop-shadow-md shadow-pink-600 shadow-md text-black"
                  aria-label="Copy Invite Link"
                  title="Copy Invite Link"
                >
                  {copySuccess || "Copy Invite Link"}
                </button>

                {qrCodeURL && (
                  <img
                    src={qrCodeURL}
                    alt="Room invite QR code"
                    className="w-12 h-12 rounded-md border border-orange-400 shadow-lg"
                    title="Scan to join room"
                  />
                )}
              </div>
            </div>

            <div className="space-y-10 z-10 relative">
              <PhotoUploadCloudinary roomCode={room} onUpload={handlePhotoUpload} />
              <PhotoGallery roomCode={room} />
            </div>
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-orange-300 text-sm select-none z-10 relative">
        &copy; {new Date().getFullYear()} Photo Room — Built with React & Firebase
      </footer>
    </div>
  );
}

export default App;
