/**
 * Express application setup for CAPSTONE server.
 */
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const claimRoutes = require("./routes/claimRoutes");
const reinsurerRoutes = require("./routes/reinsurerRoutes");
const treatyRoutes = require("./routes/treatyRoutes");
const riskAllocationRoutes = require("./routes/riskAllocationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes.js");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/reinsurers", reinsurerRoutes);
app.use("/api/treaties", treatyRoutes);
app.use("/api/risk-allocations", riskAllocationRoutes);
app.use("/api/analytics", dashboardRoutes);

module.exports = app;
