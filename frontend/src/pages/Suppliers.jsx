import { Container, Typography, Paper } from '@mui/material';

function Suppliers() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Supplier Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is where we will track how much we spend on Costco, Uber, etc.
        </Typography>
      </Paper>
    </Container>
  );
}

export default Suppliers;