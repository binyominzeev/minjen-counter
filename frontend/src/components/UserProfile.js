import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function UserProfile({ user, displayName, onClose }) {
  const [name, setName] = useState(displayName || user.email || "");
  const [status, setStatus] = useState("");

  const saveProfile = async () => {
    if (!name.trim()) return;
    await axios.post(`${API_URL}/profile`, { uid: user.uid, displayName: name });
    setStatus("Név mentve!");
    setTimeout(() => onClose(true), 1000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-4">Profil név beállítása</h2>
        <input
          className="border px-2 py-1 w-full mb-4"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Írd be a neved"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={saveProfile}
        >
          Mentés
        </button>
        {status && <div className="mt-2 text-green-600">{status}</div>}
        <button className="mt-4 text-sm text-gray-500" onClick={() => onClose(false)}>
          Bezár
        </button>
        <button
          className="mt-4 text-sm text-red-600 underline w-full"
          onClick={handleLogout}
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}