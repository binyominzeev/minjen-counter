import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xs mx-auto bg-white rounded-lg shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-blue-700 mb-2">
        {isRegister ? "Register" : "Login"}
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
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {isRegister ? "Register" : "Login"}
      </button>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign in with Google
      </button>
      <div>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-blue-600 hover:underline mt-2"
        >
          {isRegister ? "Already have an account? Login" : "No account? Register"}
        </button>
      </div>
      {error && <div className="text-red-600 text-center">{error}</div>}
    </form>
  );
}