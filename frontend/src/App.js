import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PagesAdmin from "./components/PagesAdmin";
import ShulProfile from "./components/ShulProfile";
import LoginForm from "./components/LoginForm";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "szvbinjomin@gmail.com";

function App() {
  console.log("App component rendered");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      console.log("Logged in user:", u);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user && user.email === ADMIN_EMAIL;

  console.log("user:", user, "isAdmin:", isAdmin);

  return (
    <Router>
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
        <Route path="/:pageId" element={<ShulProfile user={user} />} />
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