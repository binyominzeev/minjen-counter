import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import UsersAdmin from "./UsersAdmin"; // <-- Import the UsersAdmin component

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [newPageName, setNewPageName] = useState("");
  const [minyanLabels, setMinyanLabels] = useState({});
  const [selectedPage, setSelectedPage] = useState(null);
  const [editingPageName, setEditingPageName] = useState({});
  const [editingMinyanLabel, setEditingMinyanLabel] = useState({});
  const navigate = useNavigate();

  // Load all pages
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await axios.get(`${API_URL}/pages`);
    setPages(res.data.pages || []);
  };

  const createPage = async () => {
    if (!newPageName.trim()) return;
    await axios.post(`${API_URL}/pages`, { name: newPageName });
    setNewPageName("");
    fetchPages();
  };

  const removePage = async (id) => {
    await axios.delete(`${API_URL}/pages/${id}`);
    if (selectedPage === id) setSelectedPage(null);
    fetchPages();
  };

  const addMinyan = async (pageId) => {
    const label = minyanLabels[pageId]?.trim();
    if (!label) return;
    const minyanId = label.toLowerCase().replace(/\s+/g, "-");
    await axios.post(`${API_URL}/pages/${pageId}/minyanim`, { minyanId, label });
    setMinyanLabels(prev => ({ ...prev, [pageId]: "" }));
    fetchPages();
  };

  const removeMinyan = async (pageId, minyanId) => {
    await axios.delete(`${API_URL}/pages/${pageId}/minyanim/${minyanId}`);
    fetchPages();
  };

  // --- NEW: Edit page name ---
  const startEditPageName = (page) => {
    setEditingPageName({ [page.id]: page.name });
  };

  const saveEditPageName = async (page) => {
    const newName = editingPageName[page.id]?.trim();
    if (!newName || newName === page.name) {
      setEditingPageName({});
      return;
    }
    await axios.put(`${API_URL}/pages/${page.id}`, { name: newName });
    setEditingPageName({});
    fetchPages();
  };

  // --- NEW: Edit minyan label ---
  const startEditMinyanLabel = (pageId, minyan) => {
    setEditingMinyanLabel({ [`${pageId}:${minyan.id}`]: minyan.label });
  };

  const saveEditMinyanLabel = async (pageId, minyan) => {
    const key = `${pageId}:${minyan.id}`;
    const newLabel = editingMinyanLabel[key]?.trim();
    if (!newLabel || newLabel === minyan.label) {
      setEditingMinyanLabel({});
      return;
    }
    await axios.put(`${API_URL}/pages/${pageId}/minyanim/${minyan.id}`, { label: newLabel });
    setEditingMinyanLabel({});
    fetchPages();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Pages Admin</h2>
      <div className="mb-6 flex gap-2">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="New page name"
          value={newPageName}
          onChange={e => setNewPageName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={createPage}
        >
          Create Page
        </button>
      </div>
      <ul className="space-y-6">
        {pages.map(page => (
          <li key={page.id} className="border rounded p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div>
                {editingPageName[page.id] !== undefined ? (
                  <>
                    <input
                      className="border px-2 py-1 rounded"
                      value={editingPageName[page.id]}
                      onChange={e =>
                        setEditingPageName({ [page.id]: e.target.value })
                      }
                    />
                    <button
                      className="ml-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                      onClick={() => saveEditPageName(page)}
                    >
                      Save
                    </button>
                    <button
                      className="ml-1 bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 text-xs"
                      onClick={() => setEditingPageName({})}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-lg">{page.name}</span>
                    <span className="ml-2 text-gray-500">/{page.id}</span>
                    <button
                      className="ml-2 bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 text-xs"
                      onClick={() => startEditPageName(page)}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => navigate(`/${page.id}`)}
                >
                  View
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => removePage(page.id)}
                >
                  Remove Page
                </button>
              </div>
            </div>
            <div className="mb-2">
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  addMinyan(page.id);
                }}
              >
                <input
                  className="border px-2 py-1 rounded flex-1"
                  placeholder="Add minyan label (e.g. Tuesday Morning)"
                  value={minyanLabels[page.id] || ""}
                  onChange={e =>
                    setMinyanLabels(prev => ({ ...prev, [page.id]: e.target.value }))
                  }
                />
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  type="submit"
                >
                  Add Minyan
                </button>
              </form>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Minyanim:</span>
              <ul className="ml-4 mt-1">
                {(page.minyanim || []).map(minyan => {
                  const key = `${page.id}:${minyan.id}`;
                  return (
                    <li key={minyan.id} className="flex items-center gap-2 mt-1">
                      {editingMinyanLabel[key] !== undefined ? (
                        <>
                          <input
                            className="border px-2 py-1 rounded"
                            value={editingMinyanLabel[key]}
                            onChange={e =>
                              setEditingMinyanLabel(prev => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="ml-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            onClick={() => saveEditMinyanLabel(page.id, minyan)}
                          >
                            Save
                          </button>
                          <button
                            className="ml-1 bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 text-xs"
                            onClick={() =>
                              setEditingMinyanLabel(prev => {
                                const copy = { ...prev };
                                delete copy[key];
                                return copy;
                              })
                            }
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-blue-700">{minyan.label}</span>
                          <span className="text-xs text-gray-400">({minyan.id})</span>
                          <button
                            className="bg-yellow-400 text-white px-2 py-0.5 rounded hover:bg-yellow-500 text-xs"
                            onClick={() => startEditMinyanLabel(page.id, minyan)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-400 text-white px-2 py-0.5 rounded hover:bg-red-600 text-xs"
                            onClick={() => removeMinyan(page.id, minyan.id)}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
                {(!page.minyanim || page.minyanim.length === 0) && (
                  <li className="text-gray-400 italic">No minyanim yet</li>
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
      {/* --- UsersAdmin block below the page admin block --- */}
      <div className="mt-12">
        <UsersAdmin />
      </div>
    </div>
  );
}