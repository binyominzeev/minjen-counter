import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState({});
  const [newName, setNewName] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/users`);
    setUsers(res.data.users || []);
  };

  const startEdit = (uid, currentName) => {
    setEditing({ ...editing, [uid]: true });
    setNewName({ ...newName, [uid]: currentName });
  };

  const cancelEdit = (uid) => {
    setEditing({ ...editing, [uid]: false });
    setNewName({ ...newName, [uid]: "" });
  };

  const saveName = async (uid) => {
    const displayName = newName[uid]?.trim();
    if (!displayName) return;
    await axios.post(`${API_URL}/profile`, { uid, displayName });
    setEditing({ ...editing, [uid]: false });
    fetchUsers();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Felhasználók kezelése</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-blue-100">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Név</th>
            <th className="p-2 border">Művelet</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid} className="border-t">
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">
                {editing[u.uid] ? (
                  <input
                    className="border px-2 py-1 rounded"
                    value={newName[u.uid]}
                    onChange={e =>
                      setNewName(prev => ({ ...prev, [u.uid]: e.target.value }))
                    }
                  />
                ) : (
                  u.displayName || <span className="text-gray-400 italic">Nincs beállítva</span>
                )}
              </td>
              <td className="p-2 border">
                {editing[u.uid] ? (
                  <>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs mr-1"
                      onClick={() => saveName(u.uid)}
                    >
                      Mentés
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 text-xs"
                      onClick={() => cancelEdit(u.uid)}
                    >
                      Mégse
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
                    onClick={() => startEdit(u.uid, u.displayName || "")}
                  >
                    Név szerkesztése
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-400 py-4">
                Nincs felhasználó.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}