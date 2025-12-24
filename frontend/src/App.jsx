import { useEffect, useState } from 'react';
import { 
  Container, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function App() {
  const [invoices, setInvoices] = useState([]);

  // Fetch data function (so we can reuse it)
  const fetchInvoices = () => {
    fetch('http://localhost:8080/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // NEW: Handle the File Upload
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
      fetchInvoices(); // Refresh the table to show the new upload
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
      PIVIK Finance Dashboard
      </Typography>

      {/* Upload Button Area */}
      <Box sx={{ mb: 3 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          Upload Invoice
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>File</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.vendor}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount ? `$${invoice.amount}` : '-'}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>{invoice.fileUrl}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;