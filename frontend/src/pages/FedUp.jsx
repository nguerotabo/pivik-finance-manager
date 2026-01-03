import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, LinearProgress, 
  Table, TableBody, TableCell, TableHead, TableRow, Stack 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

function FedUp() {
  const [invoices, setInvoices] = useState([]);
  const BUDGET_LIMIT = 30000; // The $30k budget

  useEffect(() => {
    fetch('http://localhost:8080/api/invoices')
      .then(res => res.json())
      .then(data => {
        // Only keep invoices tagged as "FED UP"
        const fedUpInvoices = data.filter(inv => inv.project === 'FED UP');
        setInvoices(fedUpInvoices);
      });
  }, []);

  // Calculations
  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const remaining = BUDGET_LIMIT - totalSpent;
  // Cap percentage at 100% so the bar doesn't overflow
  const percentage = Math.min((totalSpent / BUDGET_LIMIT) * 100, 100); 

  //Color logic
  let barColor = "success";
  if (percentage > 50) barColor = "warning";
  if (percentage > 90) barColor = "error";

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#000000', textAlign: 'center' }}>
         FED UP Program Tracker
      </Typography>

      {/* THE THERMOMETER */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>Budget Usage</Typography>
        
        <Box sx={{ position: 'relative', height: 40, bgcolor: '#eee', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            <LinearProgress 
                variant="determinate" 
                value={percentage} 
                color={barColor}
                sx={{ height: '100%' }}
            />
            <Typography sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#333' }}>
                {percentage.toFixed(1)}% Used
            </Typography>
        </Box>

        {/* Using Stack instead of Grid to prevent version errors */}
        <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            sx={{ mt: 2, justifyContent: 'space-between' }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="text.secondary">Total Budget</Typography>
                <Typography variant="h4" fontWeight="bold">${BUDGET_LIMIT.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="error.main">Spent</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">${totalSpent.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5" color="success.main">Remaining</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">${remaining.toLocaleString()}</Typography>
            </Box>
        </Stack>

        {remaining < 5000 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <WarningIcon />
                <Typography fontWeight="bold">WARNING: You are running low on funds!</Typography>
            </Box>
        )}
      </Paper>

      {/* EXPENSE LIST */}
      <Typography variant="h5" gutterBottom>Program Expenses</Typography>
      <Paper>
        <Table>
            <TableHead sx={{ bgcolor: '#eee' }}>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {invoices.length > 0 ? (
                    invoices.map((inv) => (
                    <TableRow key={inv.id}>
                        <TableCell>{inv.date}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{inv.vendor}</TableCell>
                        <TableCell>{inv.category}</TableCell>
                        <TableCell>${inv.amount.toFixed(2)}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'gray' }}>
                            No expenses charged to "FED UP" yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </Paper>

    </Container>
  );
}

export default FedUp;