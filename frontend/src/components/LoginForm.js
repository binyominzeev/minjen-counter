import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin && onLogin(userCredential.user);
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      onLogin && onLogin(userCredential.user);
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-xs mx-auto bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-2">
          {isRegister ? "Regisztráció" : "Bejelentkezés"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Jelszó "
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {isRegister ? "Regisztráció" : "Bejelentkezés"}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center"
        >
          Google belépés
          <span className="text-xs ml-1 align-super">*</span>
        </button>
        <div>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-blue-600 hover:underline mt-2"
          >
            {isRegister ? "Már regisztráltál? Belépés" : "Még nem vagy regisztrálva? Regisztráció"}
          </button>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
      <div className="max-w-xs mx-auto text-xs text-gray-500 mt-2">
        *A Google belépés Messengerben nem működik. Használatához nyissa meg az oldalt külön böngészőben (pl. Chrome) a telefonján.
      </div>
    </>
  );
}