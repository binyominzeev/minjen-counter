import React, { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm.js";
import ShulProfile from "../components/ShulProfile.js";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center py-10">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8 tracking-tight">Minjen Counter</h1>
        {!user ? (
          <LoginForm onLogin={setUser} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-700">
                Welcome, <span className="font-semibold text-blue-700">{user.email}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Logout
              </button>
            </div>
            {user.email === "szvbinjomin@gmail.com" && (
              <div className="text-sm text-green-700 font-semibold">You are an admin.</div>
            )}
            <ShulProfile user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;