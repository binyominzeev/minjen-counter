import React, { useState } from "react";
import LoginForm from "../components/LoginForm.js";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <h1>Minjen Counter</h1>
      {!user ? (
        <LoginForm onLogin={setUser} />
      ) : (
        <div>
          <p>Welcome, {user.email}!</p>
          {user.email === "szvbinjomin@gmail.com" && <strong>You are an admin.</strong>}
          <button onClick={handleLogout} style={{ marginTop: 16 }}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;