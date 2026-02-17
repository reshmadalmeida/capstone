import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ChartCard({ title, hasData, children }) {
  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: hasData ? 'center' : 'flex-start', minHeight: 200 }}>
        {hasData ? children : (
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        )}
      </Box>
    </Paper>
  );
}
