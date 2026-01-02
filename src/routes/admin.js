const express = require("express");
const supabase = require("../supabase/client");
const router = express.Router();

/**
 * Build admin credentials map from env vars
 */
function buildAdminCreds() {
  const adminCreds = { 'ALL': {} };
  
  // Main admin for "ALL"
  const mainId = process.env.MAIN_ADMIN_ID;
  const mainPass = process.env.MAIN_ADMIN_PASSWORD;
  if (mainId && mainPass) {
    adminCreds['ALL'][mainId] = mainPass;
  }
  
  // Station-specific admins
  for (const key in process.env) {
    if (key.startsWith('ADMIN_') && key.endsWith('_ID')) {
      const station = key.replace('ADMIN_', '').replace('_ID', '');
      const passKey = key.replace('_ID', '_PASS');
      const id = process.env[key];
      const pass = process.env[passKey];
      if (id && pass) {
        if (!adminCreds[station]) {
          adminCreds[station] = {};
        }
        adminCreds[station][id] = pass;
      }
    }
  }
  
  return adminCreds;
}

/**
 * POST: Admin login validation
 */
router.post("/login", (req, res) => {
  const { station, admin_id, admin_password } = req.body;
  if (!station || !admin_id || !admin_password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const adminCreds = buildAdminCreds();
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
