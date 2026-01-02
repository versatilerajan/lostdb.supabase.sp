const express = require("express");
const supabase = require("../supabase/client");
const router = express.Router();
require("dotenv").config(); // Load .env for ADMIN_CREDS

const adminCreds = JSON.parse(process.env.ADMIN_CREDS || '{}');

/**
 * POST: Admin login validation
 */
router.post("/login", (req, res) => {
  const { station, admin_id, admin_password } = req.body;
  if (!station || !admin_id || !admin_password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const stationCreds = adminCreds[station] || {};
  if (stationCreds[admin_id] === admin_password) {
    return res.json({ success: true, message: "Login successful" });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

/**
 * GET: All complaints (admin, with optional station filter)
 */
router.get("/complaints", async (req, res) => {
  const { station } = req.query;
  let query = supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  if (station) {
    query = query.eq("police_station", station);
  }
  const { data, error } = await query;
  if (error) {
    return res.status(403).json({ error: error.message });
  }
  res.json(data);
});

/**
 * DELETE: Complaint by ID
 */
router.delete("/complaints/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from("complaints")
    .delete()
    .eq("id", id);
  if (error) {
    return res.status(403).json({ error: error.message });
  }
  res.json({ message: "Complaint deleted successfully" });
});

/**
 * PATCH: Mark complaint as solved
 */
router.patch("/complaints/:id/solve", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("complaints")
    .update({ solved: true })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return res.status(403).json({ error: error.message });
  }
  res.json(data);
});

module.exports = router;
