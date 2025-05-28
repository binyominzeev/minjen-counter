import React, { useState } from "react";
import shulData from "../data/shul.json";

export default function ShulProfile({ user }) {
  // Initialize participants for each minyan as empty arrays
  const initialParticipants = {};
  shulData.forms[0].minyanim.forEach(minyan => {
    initialParticipants[minyan.id] = [];
  });

  const [participants, setParticipants] = useState(initialParticipants);

  const handleRegister = (minyanId) => {
    if (!user) return;
    setParticipants(prev => {
      if (prev[minyanId].some(u => u.uid === user.uid)) return prev;
      return {
        ...prev,
        [minyanId]: [...prev[minyanId], { uid: user.uid, email: user.email }]
      };
    });
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2>Shul: {shulData.name}</h2>
      {shulData.forms.map(form => (
        <div key={form.name}>
          <h3>{form.name}</h3>
          <div style={{ display: "flex", gap: 32 }}>
            {form.minyanim.map(minyan => (
              <div key={minyan.id}>
                <h4>{minyan.label}</h4>
                <button onClick={() => handleRegister(minyan.id)}>Register</button>
                <ul>
                  {participants[minyan.id].map(u => (
                    <li key={u.uid}>{u.email}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}