import React, { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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

      // Ensure unique room code by checking Firestore
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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-12">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 select-none">
        Join or Create a Room
      </h2>

      <input
        type="text"
        aria-label="Room Code"
        placeholder="Enter 6-digit Room Code"
        maxLength={6}
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))} // only digits allowed
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4 font-mono text-center tracking-widest text-lg"
        disabled={loading}
      />

      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-md font-semibold mb-4 transition"
      >
        {loading ? "Please wait..." : "Join Room"}
      </button>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-md font-semibold transition"
      >
        {loading ? "Creating..." : "Create New Room"}
      </button>

      {error && (
        <p className="text-red-600 text-center mt-5 font-medium select-none" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
