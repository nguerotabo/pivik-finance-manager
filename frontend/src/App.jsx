import { useEffect, useState, useRef } from 'react';
import { 
  Container, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Card, CardContent, IconButton 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete'; 

// 🛑 CHART PAUSED (Commented out to stop crashes)
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function App() {
  const [invoices, setInvoices] = useState([]);
  const fileInputRef = useRef(null);

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
      event.target.value = null; 
    })
    .catch(error => console.error('Error:', error));
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this invoice?")) {
        fetch(`http://localhost:8080/api/invoices/${id}`, {
            method: 'DELETE',
        })
        .then(() => {
            fetchInvoices(); 
        })
        .catch(error => console.error('Error deleting:', error));
    }
  };

  const totalSpend = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        🚀 PIVIK Finance Dashboard
      </Typography>

      {/* Stats Card */}
      <Card sx={{ mb: 4, backgroundColor: '#e3f2fd', maxWidth: 400 }}>
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

      {/* 🛑 CHART REMOVED FOR TESTING */}

      {/* Upload Button */}
      <Box sx={{ mb: 3 }}>
        <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          size="large"
          onClick={() => fileInputRef.current.click()} 
        >
          Upload New Invoice
        </Button>
      </Box>

      {/* Table */}
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
              <TableCell align="center"><strong>Actions</strong></TableCell> 
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.id}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{invoice.vendor}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount ? `$${invoice.amount.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                    <Box sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', p: 0.5, borderRadius: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {invoice.category || 'Other'}
                    </Box>
                </TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleDelete(invoice.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;