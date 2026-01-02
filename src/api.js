const express = require("express");
const complaintsRoutes = require("./routes/complaints");
const adminRoutes = require("./routes/admin");

const router = express.Router();

router.use("/complaints", complaintsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
