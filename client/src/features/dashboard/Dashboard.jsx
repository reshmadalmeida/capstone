import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../services/apiClient";

const COLORS = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa"];

const cardSx = {
  p: 2.5,
  borderRadius: 3,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid",
  borderColor: "divider",
  height: "100%",
  overflow: "hidden",
};

const titleSx = {
  fontWeight: 600,
  color: "text.primary",
};

export default function Dashboard() {
  const [exposureByLOB, setExposure] = useState([]);
  const [split, setSplit] = useState([]);
  const [claimsRatio, setClaimsRatio] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [lob, rs, cr] = await Promise.all([
          api.get("/metrics/exposure").then((r) => r.data),
          api.get("/metrics/reinsurer-split").then((r) => r.data),
          api.get("/metrics/claims-ratio").then((r) => r.data),
        ]);
        setExposure(lob);
        setSplit(rs);
        setClaimsRatio(cr?.value);
      } catch {
        // fallback mock if backend not ready
        setExposure([
          { lob: "HEALTH", exposure: 120 },
          { lob: "MOTOR", exposure: 80 },
          { lob: "LIFE", exposure: 50 },
          { lob: "PROPERTY", exposure: 60 },
        ]);
        setSplit([
          { name: "Retained", value: 55 },
          { name: "Reinsurer A", value: 25 },
          { name: "Reinsurer B", value: 20 },
        ]);
        setClaimsRatio(0.42);
      }
    })();
  }, []);

  const ratioText =
    claimsRatio != null ? (claimsRatio * 100).toFixed(1) + "%" : "—";

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, width: "100%" }}>
      {/* Page header */}
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Key metrics overview for exposure, reinsurance and claims ratio
        </Typography>
      </Stack>

      <Grid container spacing={2.5} alignItems="stretch">
        {/* Exposure Bar */}
        <Grid item xs={12} md={8}>
          <Paper sx={cardSx}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Box>
                <Typography variant="subtitle1" sx={titleSx}>
                  Total Exposure by LOB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Distribution of exposure across lines of business
                </Typography>
              </Box>

              <Divider />

              {/* Chart area */}
              <Box sx={{ flex: 1, minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exposureByLOB} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="lob" tickMargin={8} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="exposure" fill="#1e88e5" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Reinsurer Split Pie */}
        <Grid item xs={12} md={4}>
          <Paper sx={cardSx}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Box>
                <Typography variant="subtitle1" sx={titleSx}>
                  Reinsurer Split
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Retained vs ceded distribution
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ flex: 1, minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={split}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      label
                    >
                      {split.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Claims Ratio KPI */}
        <Grid item xs={12}>
          <Paper
            sx={{
              ...cardSx,
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={titleSx}>
                Claims Ratio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Claims paid / premium (higher may indicate underwriting risk)
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                minWidth: 140,
                textAlign: "center",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {ratioText}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current period
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
