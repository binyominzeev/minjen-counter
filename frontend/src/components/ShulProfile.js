import React, { useEffect, useState } from "react";
import axios from "axios";
import shulData from "../data/shul.json";
import { API_URL } from "../config";

const ADMIN_EMAIL = "szvbinjomin@gmail.com"; // Set your admin email here

export default function ShulProfile({ user }) {
  const [participants, setParticipants] = useState({});
  const [manualName, setManualName] = useState({});
  const isAdmin = user && user.email === ADMIN_EMAIL;

  // Load participants from backend
  useEffect(() => {
    axios.get(`${API_URL}/participants`).then(res => {
      setParticipants(res.data);
    });
  }, []);

  const handleToggleRegister = async (minyanId, isRegistered) => {
    if (!user) return;
    if (isRegistered) {
      await axios.post(`${API_URL}/unregister`, {
        minyanId,
        user: { uid: user.uid, email: user.email }
      });
    } else {
      await axios.post(`${API_URL}/register`, {
        minyanId,
        user: { uid: user.uid, email: user.email }
      });
    }
    const res = await axios.get(`${API_URL}/participants`);
    setParticipants(res.data);
  };

  // Admin: register any name
  const handleAdminRegister = async (minyanId) => {
    const name = manualName[minyanId]?.trim();
    if (!name) return;
    await axios.post(`${API_URL}/register`, {
      minyanId,
      user: { uid: `manual-${name}`, email: name }
    });
    setManualName(prev => ({ ...prev, [minyanId]: "" }));
    const res = await axios.get(`${API_URL}/participants`);
    setParticipants(res.data);
  };

  // Admin: unregister anyone
  const handleAdminUnregister = async (minyanId, participant) => {
    await axios.post(`${API_URL}/unregister`, {
      minyanId,
      user: { uid: participant.uid, email: participant.email }
    });
    const res = await axios.get(`${API_URL}/participants`);
    setParticipants(res.data);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Shul: {shulData.name}</h2>
      {shulData.forms.map(form => (
        <div key={form.name} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-700 mb-6">{form.name}</h3>
          <div className="flex gap-8 flex-wrap">
            {form.minyanim.map(minyan => {
              const minyanParticipants = participants[minyan.id] || [];
              const isRegistered = !!user && minyanParticipants.some(u => u.uid === user.uid);
              return (
                <div
                  key={minyan.id}
                  className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-col items-center border border-blue-100"
                >
                  <h4 className="text-lg font-semibold text-blue-600 mb-3">{minyan.label}</h4>
                  {/* User's own register/unregister */}
                  {user && (
                    <button
                      onClick={() => handleToggleRegister(minyan.id, isRegistered)}
                      className={`mb-4 px-4 py-2 rounded font-medium shadow transition ${
                        isRegistered
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isRegistered ? "Unregister" : "Register"}
                    </button>
                  )}
                  {/* Admin manual add */}
                  {isAdmin && (
                    <form
                      className="w-full flex mb-4 gap-2"
                      onSubmit={e => {
                        e.preventDefault();
                        handleAdminRegister(minyan.id);
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Add participant name/email"
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        value={manualName[minyan.id] || ""}
                        onChange={e =>
                          setManualName(prev => ({ ...prev, [minyan.id]: e.target.value }))
                        }
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Add
                      </button>
                    </form>
                  )}
                  <div className="w-full">
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Participants:</h5>
                    <ul className="space-y-1">
                      {minyanParticipants.length === 0 ? (
                        <li className="text-gray-400 italic">No one registered yet</li>
                      ) : (
                        minyanParticipants.map(u => (
                          <li
                            key={u.uid}
                            className="px-2 py-1 bg-blue-50 rounded text-blue-800 text-sm flex items-center justify-between"
                          >
                            <span>{u.email}</span>
                            {isAdmin && (
                              <button
                                onClick={() => handleAdminUnregister(minyan.id, u)}
                                className="ml-2 px-2 py-0.5 bg-red-400 text-white rounded hover:bg-red-600 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}