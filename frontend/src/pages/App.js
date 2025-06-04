import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PagesAdmin from "../components/PagesAdmin";
import ShulProfile from "../components/ShulProfile";
import LoginForm from "../components/LoginForm";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import UserProfile from "../components/UserProfile";
import axios from "axios";
import { API_URL } from "../config";

const ADMIN_EMAIL = "szvbinjomin@gmail.com";

function App() {
  console.log("App component rendered");

  const [user, setUser] = useState(undefined); // undefined means "not checked yet"
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");

  // Fetch display name from backend
  const fetchDisplayName = async (u) => {
    if (!u) {
      setDisplayName("");
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/profile/${u.uid}`);
      setDisplayName(res.data.displayName || "");
    } catch {
      setDisplayName("");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      fetchDisplayName(u);
      console.log("Logged in user:", u);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user && user.email === ADMIN_EMAIL;

  console.log("user:", user, "isAdmin:", isAdmin);

  // Handler to update displayName after profile change
  const handleProfileClose = (updated) => {
    setShowProfile(false);
    if (updated && user) fetchDisplayName(user);
  };

  if (loading) {
    return <div>Loading...</div>; // or a spinner, or whatever you prefer
  }

  return (
    <Router>
      <div className="absolute top-4 right-4">
        {user && (
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={() => setShowProfile(true)}
          >
            {displayName || user.email || "Profilom"}
          </button>
        )}
      </div>
      {showProfile && (
        <UserProfile
          user={user}
          displayName={displayName}
          onClose={handleProfileClose}
        />
      )}
      <Routes>
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <PagesAdmin user={user} />
            ) : (
              <div className="p-8 text-red-600 font-bold text-center">
                Admin access only
              </div>
            )
          }
        />
        <Route path="/:pageId" element={<ShulProfile user={user} displayName={displayName} loading={loading} />} />
        <Route
          path="/login"
          element={
            <LoginForm
              onLogin={setUser}
            />
          }
        />
        <Route
          path="/"
          element={
            !user ? (
              <LoginForm onLogin={setUser} />
            ) : isAdmin ? (
              <PagesAdmin user={user} />
            ) : (
              <div className="p-8 text-red-600 font-bold text-center">
                Admin access only
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;