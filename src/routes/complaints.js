const express = require("express");
const supabase = require("../supabase/client");
const router = express.Router();

/**
 * POST: Create complaint
 */
router.post("/", async (req, res) => {
  const { data, error } = await supabase
    .from("complaints")
    .insert([req.body])
    .select()
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data);
});

/**
 * GET: Public complaints (with optional station filter)
 */
router.get("/", async (req, res) => {
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
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
});

module.exports = router;
