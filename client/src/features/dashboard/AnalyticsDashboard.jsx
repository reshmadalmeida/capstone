import { useEffect, useState } from "react";
import api from "../../services/apiClient";
import Loader from "../../shared/Loader.jsx";
import AppShell from "../../layout/AppShell.jsx";
import ChartCard from "../../shared/ChartCard.jsx";
import ExposureBarChart from "./charts/ExposureBarChart.jsx";
import ReinsurerPieChart from "./charts/ReinsurerPieChart.jsx";
import LossRatioRadial from "./charts/LossRatioRadial.jsx";
import MonthlyClaimsLine from "./charts/MonthlyClaimsLine.jsx";
import RetentionPieChart from "./charts/RetentionPieChart.jsx";
import HighClaimBarChart from "./charts/HighClaimBarChart.jsx";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ADMIN_LINKS,UNDERWRITER_LINKS,CLAIMS_ADJUSTER_LINKS,REINSURER_ANALYST_LINKS } from "../../app/constants.js";

// ✅ TEMP: If these are in your project already, keep them.
// If not, import them from wherever you have them.


const getLinks = (role) => {
  switch (role) {
    case "ADMIN":
      return ADMIN_LINKS;
    case "UNDERWRITER":
      return UNDERWRITER_LINKS;
    case "CLAIMS_ADJUSTER":
      return CLAIMS_ADJUSTER_LINKS;
    case "REINSURANCE_ANALYST":
      return REINSURER_ANALYST_LINKS;
    default:
      return [];
  }
};

// ✅ Dummy data shaped like typical analytics responses
const DUMMY_LOB = [
  { name: "Motor", exposure: 5200000 },
  { name: "Health", exposure: 3400000 },
  { name: "Property", exposure: 2800000 },
  { name: "Travel", exposure: 1200000 },
  { name: "Marine", exposure: 900000 },
];

const DUMMY_REINSURER = [
  { name: "Swiss Re", value: 32 },
  { name: "Munich Re", value: 24 },
  { name: "Hannover Re", value: 18 },
  { name: "SCOR", value: 16 },
  { name: "Others", value: 10 },
];

const DUMMY_LOSS_RATIO = {
  lossRatioPercentage: 63.4, // used by <LossRatioRadial />
};

const DUMMY_CLAIMS_TREND = [
  { month: "Aug", count: 18 },
  { month: "Sep", count: 22 },
  { month: "Oct", count: 16 },
  { month: "Nov", count: 29 },
  { month: "Dec", count: 31 },
  { month: "Jan", count: 24 },
];

const DUMMY_RETENTION = {
  totalRetained: 7400000,
  totalCeded: 2600000,
};

const DUMMY_HIGH_CLAIMS = [
  { policyNumber: "P017", claimAmount: 123456 },
  { policyNumber: "P011", claimAmount: 98500 },
  { policyNumber: "P032", claimAmount: 87600 },
  { policyNumber: "P004", claimAmount: 74250 },
  { policyNumber: "P099", claimAmount: 69000 },
];

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [lob, setLob] = useState([]);
  const [reinsurer, setReinsurer] = useState([]);
  const [lossRatio, setLossRatio] = useState(null);
  const [claimsTrend, setClaimsTrend] = useState([]);
  const [retention, setRetention] = useState(null);
  const [highClaims, setHighClaims] = useState([]);

  const { loggedInUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ Option A: Dummy data (UI will render)
        await new Promise((r) => setTimeout(r, 400)); // small delay to see loader
        setLob(DUMMY_LOB);
        setReinsurer(DUMMY_REINSURER);
        setLossRatio(DUMMY_LOSS_RATIO);
        setClaimsTrend(DUMMY_CLAIMS_TREND);
        setRetention(DUMMY_RETENTION);
        setHighClaims(DUMMY_HIGH_CLAIMS);

        // ✅ Option B: Real API (uncomment later)
        // const [lobRes, reinsurerRes, lossRes, trendRes, retentionRes, highRes] =
        //   await Promise.all([
        //     api.get("/analytics/exposure-lob"),
        //     api.get("/analytics/reinsurer-distribution"),
        //     api.get("/analytics/loss-ratio"),
        //     api.get("/analytics/monthly-claims"),
        //     api.get("/analytics/retention-vs-ceded"),
        //     api.get("/analytics/high-claim-policies"),
        //   ]);
        //
        // setLob(lobRes.data);
        // setReinsurer(reinsurerRes.data);
        // setLossRatio(lossRes.data);
        // setClaimsTrend(trendRes.data);
        // setRetention(retentionRes.data);
        // setHighClaims(highRes.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const links = getLinks(loggedInUser?.user?.role);

  useEffect(() => {
    if (!links.length) navigate("/login");
    // eslint-disable-next-line
  }, [links.length, navigate]);

  if (loading) return <Loader />;

  return (
    <AppShell links={links}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1, mt: 2 }}>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Overview of policies, claims, and reinsurance metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Top 5 High Claim Policies" hasData={highClaims?.length > 0}>
            <HighClaimBarChart data={highClaims} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Monthly Claims Trend" hasData={claimsTrend?.length > 0}>
            <MonthlyClaimsLine data={claimsTrend} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Exposure by Line of Business" hasData={lob?.length > 0}>
            <ExposureBarChart data={lob} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Reinsurer Distribution" hasData={reinsurer?.length > 0}>
            <ReinsurerPieChart data={reinsurer} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Loss Ratio" hasData={!!lossRatio}>
            <LossRatioRadial value={lossRatio?.lossRatioPercentage} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Retention vs Ceded" hasData={!!retention}>
            <RetentionPieChart
              retained={retention?.totalRetained}
              ceded={retention?.totalCeded}
            />
          </ChartCard>
        </Grid>
      </Grid>
    </AppShell>
  );
}
