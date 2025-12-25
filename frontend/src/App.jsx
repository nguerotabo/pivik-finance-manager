import { useEffect, useState } from 'react';
import { 
  Container, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Card, CardContent 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = () => {
    fetch('http://localhost:8080/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch('http://localhost:8080/api/invoices/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log("Success:", data);
      fetchInvoices();
    })
    .catch(error => console.error('Error:', error));
  };

  // Calculate Total Spend
  // We use .reduce() to loop through all invoices and add up the amounts
  const totalSpend = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
      PIVIK Finance Dashboard
      </Typography>

      {/* Summary Card */}
      <Card sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AttachMoneyIcon sx={{ fontSize: 40, color: '#1565c0' }} />
          <Box>
            <Typography variant="h6" color="text.secondary">Total Expenses</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${totalSpend.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          size="large"
        >
          Upload Invoice
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.vendor}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {invoice.amount ? `$${invoice.amount.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>{invoice.category}</TableCell>
                <TableCell>{invoice.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;