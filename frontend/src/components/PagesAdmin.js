import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [newPageName, setNewPageName] = useState("");
  const [minyanLabels, setMinyanLabels] = useState({});
  const [selectedPage, setSelectedPage] = useState(null);
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
                <span className="font-semibold text-lg">{page.name}</span>
                <span className="ml-2 text-gray-500">/{page.id}</span>
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
                {(page.minyanim || []).map(minyan => (
                  <li key={minyan.id} className="flex items-center gap-2 mt-1">
                    <span className="text-blue-700">{minyan.label}</span>
                    <span className="text-xs text-gray-400">({minyan.id})</span>
                    <button
                      className="bg-red-400 text-white px-2 py-0.5 rounded hover:bg-red-600 text-xs"
                      onClick={() => removeMinyan(page.id, minyan.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {(!page.minyanim || page.minyanim.length === 0) && (
                  <li className="text-gray-400 italic">No minyanim yet</li>
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}