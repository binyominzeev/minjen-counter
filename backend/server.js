require('dotenv').config();
const express = require("express");
const cors = require("cors");
const https = require('https');
const fs = require("fs");
const bodyParser = require("body-parser");
//const fetch = require("node-fetch"); // or global fetch in Node 18+
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

// Utility to remove accents/diacritics and replace spaces with hyphens
function slugify(str) {
  return str
    .normalize("NFD") // split accented letters into base + diacritic
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^a-z0-9\-]/g, "") // remove non-alphanumeric except hyphen
    .replace(/\-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

// Create a new page
app.post("/api/pages", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });
  const id = slugify(name);
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
app.post("/api/register", async (req, res) => {
  const { minyanId, user } = req.body;
  if (!minyanId || !user) return res.status(400).json({ error: "Missing data" });

  const data = readData();
  data.participants = data.participants || {};
  data.participants[minyanId] = data.participants[minyanId] || [];

  // Use displayName if available, otherwise fallback to email
  const displayName = getDisplayName(data, user);

  // Check if user is already registered
  if (!data.participants[minyanId].some(u => u.uid === user.uid)) {
    data.participants[minyanId].push({
      ...user,
      displayName
    });
    writeData(data);

    // --- Telegram notification ---
    const page = data.pages.find(p =>
      p.minyanim.some(m => m.id === minyanId)
    );
    const minyan = page?.minyanim.find(m => m.id === minyanId);
    const count = data.participants[minyanId].length;
    const userName = displayName || user.email;
    if (page && minyan) {
      await sendTelegramMessage(
        `✅ <b>Regisztráció</b>\n📄 <b>Oldal:</b> ${page.name}\n🕰️ <b>Minyan:</b> ${minyan.label}\n👤 <b>Felhasználó:</b> ${userName}\n👥 <b>Létszám:</b> ${count}`
      );
    }
    // ---
  }
  res.json({ success: true, participants: data.participants[minyanId] });
});

// Unregister a user from a minyan
app.post("/api/unregister", async (req, res) => {
  const { minyanId, user } = req.body;
  if (!minyanId || !user) return res.status(400).json({ error: "Missing data" });

  const data = readData();
  data.participants = data.participants || {};
  const before = (data.participants[minyanId] || []).length; // <-- Add this line
  data.participants[minyanId] = (data.participants[minyanId] || []).filter(u => u.uid !== user.uid);
  writeData(data);

  // --- Telegram notification ---
  const page = data.pages.find(p =>
    p.minyanim.some(m => m.id === minyanId)
  );
  const minyan = page?.minyanim.find(m => m.id === minyanId);
  const count = data.participants[minyanId]?.length || 0;
  const userName = getDisplayName(data, user) || user.email;
  if (page && minyan && before > count) {
    await sendTelegramMessage(
      `❌ <b>Kijelentkezés</b>\n📄 <b>Oldal:</b> ${page.name}\n🕰️ <b>Minyan:</b> ${minyan.label}\n👤 <b>Felhasználó:</b> ${userName}\n👥 <b>Létszám:</b> ${count}`
    );
  }
  // ---
  res.json({ success: true, participants: data.participants[minyanId] });
});

app.get("/api/pages/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();
  const page = data.pages.find(p => p.id === id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  res.json({ page });
});

// Add this endpoint:
app.post("/api/profile", (req, res) => {
  const { uid, displayName } = req.body;
  if (!uid || !displayName) return res.status(400).json({ error: "Missing uid or displayName" });
  const data = readData();
  data.userProfiles = data.userProfiles || {};
  data.userProfiles[uid] = displayName;
  writeData(data);
  res.json({ success: true });
});

// New endpoint to get user profile
app.get("/api/profile/:uid", (req, res) => {
  const { uid } = req.params;
  const data = readData();
  const displayName = (data.userProfiles && data.userProfiles[uid]) || "";
  res.json({ displayName });
});

// Update registration to use displayName if available:
function getDisplayName(data, user) {
  return (data.userProfiles && data.userProfiles[user.uid]) || user.email;
}

// Update a page name
app.put("/api/pages/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Missing name" });
  const data = readData();
  const page = data.pages.find(p => p.id === id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  page.name = name;
  writeData(data);
  res.json({ success: true, page });
});

// Update a minyan label
app.put("/api/pages/:pageId/minyanim/:minyanId", (req, res) => {
  const { pageId, minyanId } = req.params;
  const { label } = req.body;
  if (!label) return res.status(400).json({ error: "Missing label" });
  const data = readData();
  const page = data.pages.find(p => p.id === pageId);
  if (!page) return res.status(404).json({ error: "Page not found" });
  const minyan = (page.minyanim || []).find(m => m.id === minyanId);
  if (!minyan) return res.status(404).json({ error: "Minyan not found" });
  minyan.label = label;
  writeData(data);
  res.json({ success: true, minyan });
});

// New endpoint to get all users
app.get("/api/users", (req, res) => {
  const data = readData();
  // Collect all unique users from participants and userProfiles
  const usersMap = {};
  Object.values(data.participants || {}).forEach(arr => {
    arr.forEach(u => {
      usersMap[u.uid] = { uid: u.uid, email: u.email };
    });
  });
  Object.entries(data.userProfiles || {}).forEach(([uid, displayName]) => {
    if (!usersMap[uid]) usersMap[uid] = { uid, email: "" };
    usersMap[uid].displayName = displayName;
  });
  const users = Object.values(usersMap);
  res.json({ users });
});

// New endpoint to get all user profiles
app.get("/api/user-profiles", (req, res) => {
  const data = readData();
  res.json({ profiles: data.userProfiles || {} });
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML"
    })
  });
}

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
// https.createServer(options, app).listen(5000, () => {
//   console.log('HTTPS server running on https://localhost:5000');
/// });
