const express = require("express");
const supabase = require("../supabase/client");

const router = express.Router();

/**
 * GET: All complaints (admin)
 */
router.get("/complaints", async (req, res) => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

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
