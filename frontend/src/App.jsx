import { useEffect, useState, useRef } from 'react';
import { 
  Chip, Container, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Card, CardContent, IconButton,
  TablePagination 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function App() {
  const [invoices, setInvoices] = useState([]);
  const fileInputRef = useRef(null);
  
  // Report dates
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Pagination 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const fetchInvoices = () => {
    fetch('http://localhost:8080/api/invoices')
      .then(response => response.json())
      .then(data => {
        // Sort... newest ID first
        const sortedData = data.sort((a, b) => b.id - a.id);
        setInvoices(sortedData);
      })
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
        .then(() => fetchInvoices())
        .catch(error => console.error('Error deleting:', error));
    }
  };

  const handleMarkPaid = (id) => {
    fetch(`http://localhost:8080/api/invoices/${id}/status?status=PAID`, {
        method: 'PUT',
    })
    .then(() => fetchInvoices())
    .catch(error => console.error('Error updating status:', error));
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalSpend = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        PIVIK Finance Dashboard
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

      {/* Controls area */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa' }}>
        
        {/* Date pickers & downloads */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight:'bold' }}>Report Period:</Typography>
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <Typography>to</Typography>
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            
            {/* PDF Button */}
            <Button 
                variant="outlined" 
                color="secondary"
                size="small"
                onClick={() => {
                    window.location.href = `http://localhost:8080/api/invoices/report?startDate=${startDate}&endDate=${endDate}`;
                }}
            >
                PDF Only
            </Button>

            {/* ZIP Button */}
            <Button 
                variant="contained" 
                color="secondary"
                size="small"
                onClick={() => {
                    window.location.href = `http://localhost:8080/api/invoices/export-zip?startDate=${startDate}&endDate=${endDate}`;
                }}
            >
                Download Bundle
            </Button>
        </Box>

        {/* Upload button */}
        <Box>
            <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()} 
            >
                Upload Invoice
            </Button>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
        </Box>
      </Paper>

      {/* TABLE SECTION */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell><strong>Inv #</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell> 
            </TableRow>
          </TableHead>
          <TableBody>
            {/* PAGINATION */}
            {invoices
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.id}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{invoice.vendor}</TableCell>
                <TableCell>{invoice.invoiceNumber || '-'}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount ? `$${invoice.amount.toFixed(2)}` : '-'}</TableCell>
                <TableCell>
                    <Box sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', p: 0.5, borderRadius: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {invoice.category || 'Other'}
                    </Box>
                </TableCell>
                
                {/* status button */}
                <TableCell>
                    {invoice.status === 'PAID' ? (
                        <Chip label="PAID" color="success" size="small" icon={<CheckCircleIcon />} />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">{invoice.status}</Typography>
                            <IconButton 
                                color="success" size="small" title="Mark as Paid"
                                onClick={() => handleMarkPaid(invoice.id)}
                            >
                                <CheckCircleIcon />
                            </IconButton>
                        </Box>
                    )}
                </TableCell>

                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleDelete(invoice.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAGINATION FOOTER */}
        <TablePagination
          rowsPerPageOptions={[5, 8, 10, 25]}
          component="div"
          count={invoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
}

export default App;