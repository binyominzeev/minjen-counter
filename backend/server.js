const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./data.json"; // Now stores pages and participants

function readData() {
  if (!fs.existsSync(DATA_FILE)) return { pages: [], participants: {} };
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Create a new page
app.post("/api/pages", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });
  const id = name.toLowerCase().replace(/\s+/g, "-");
  const data = readData();
  if (data.pages.some(p => p.id === id)) return res.status(400).json({ error: "Page exists" });
  data.pages.push({ id, name, minyanim: [] });
  writeData(data);
  res.json({ success: true, page: { id, name, minyanim: [] } });
});

// Remove a page
app.delete("/api/pages/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.pages = data.pages.filter(p => p.id !== id);
  writeData(data);
  res.json({ success: true });
});

// Add minyan to a page
app.post("/api/pages/:id/minyanim", (req, res) => {
  const { id } = req.params;
  const { minyanId, label } = req.body;
  const data = readData();
  const page = data.pages.find(p => p.id === id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  if (page.minyanim.some(m => m.id === minyanId)) return res.status(400).json({ error: "Minyan exists" });
  page.minyanim.push({ id: minyanId, label });
  writeData(data);
  res.json({ success: true, minyanim: page.minyanim });
});

// Remove minyan from a page
app.delete("/api/pages/:id/minyanim/:minyanId", (req, res) => {
  const { id, minyanId } = req.params;
  const data = readData();
  const page = data.pages.find(p => p.id === id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  page.minyanim = page.minyanim.filter(m => m.id !== minyanId);
  writeData(data);
  res.json({ success: true, minyanim: page.minyanim });
});

// Get all pages
app.get("/api/pages", (req, res) => {
  const data = readData();
  res.json({ pages: data.pages || [] });
});

// Get all participants
app.get("/api/participants", (req, res) => {
  const data = readData();
  res.json(data.participants || {});
});

// Register a user for a minyan
app.post("/api/register", (req, res) => {
  const { minyanId, user } = req.body;
  if (!minyanId || !user) return res.status(400).json({ error: "Missing data" });

  const data = readData();
  data.participants = data.participants || {};
  data.participants[minyanId] = data.participants[minyanId] || [];
  if (!data.participants[minyanId].some(u => u.uid === user.uid)) {
    data.participants[minyanId].push(user);
    writeData(data);
  }
  res.json({ success: true, participants: data.participants[minyanId] });
});

// Unregister a user from a minyan
app.post("/api/unregister", (req, res) => {
  const { minyanId, user } = req.body;
  if (!minyanId || !user) return res.status(400).json({ error: "Missing data" });

  const data = readData();
  data.participants = data.participants || {};
  data.participants[minyanId] = (data.participants[minyanId] || []).filter(u => u.uid !== user.uid);
  writeData(data);
  res.json({ success: true, participants: data.participants[minyanId] });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));