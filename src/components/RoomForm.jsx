import React, { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseConfig";                   // Your Firestore instance

const generateRoomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function RoomForm({ onRoomJoin }) {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setError("");
    if (!roomCode.trim()) {
      setError("Please enter a valid room code.");
      return;
    }
    setLoading(true);

    try {
      const roomRef = doc(db, "rooms", roomCode.trim());
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        onRoomJoin(roomCode.trim());
      } else {
        setError("Room not found.");
      }
    } catch (err) {
      setError("Failed to join room. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

  const handleCreate = async () => {
    setError("");
    setLoading(true);

    try {
      let newCode;
      let exists = true;

      while (exists) {
        newCode = generateRoomCode();
        const roomRef = doc(db, "rooms", newCode);
        const roomSnap = await getDoc(roomRef);
        exists = roomSnap.exists();
      }

      const roomRef = doc(db, "rooms", newCode);
      await setDoc(roomRef, { createdAt: Date.now() });
      onRoomJoin(newCode);
    } catch (err) {
      setError("Failed to create room. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-black rounded-2xl shadow-lg p-8 mt-16 border-2 border-orange-500">
      <h2
        className="text-3xl text-center mb-6 text-orange-400 font-bold tracking-wider font-deco"
        style={{ fontFamily: "'Monoton', cursive" }}
      >
        Photo Vibe 🎞️
      </h2>

      <input
        type="text"
        aria-label="Room Code"
        placeholder="Enter 6-digit Room Code"
        maxLength={6}
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))}
        disabled={false}
        className="w-full p-3 text-center tracking-widest text-lg text-white bg-zinc-900 border border-orange-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 mb-5 transition duration-300"
      />

      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-xl mb-4 transition-all duration-300 transform hover:scale-105 shadow-md"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-white hover:bg-orange-300 text-black font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
      >
        {loading ? "Creating..." : "Create New Room"}
      </button>

      {error && (
        <p className="text-red-500 text-center mt-4 font-semibold select-none">
          {error}
        </p>
      )}
    </div>
  );
}
