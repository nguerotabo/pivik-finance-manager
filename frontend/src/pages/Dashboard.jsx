import { useEffect, useState, useRef } from 'react';
import { 
  Chip, Container, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Card, CardContent, IconButton,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const fileInputRef = useRef(null);
  
  // Report Dates
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Pagination & View
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showHistory, setShowHistory] = useState(false); // Default: Hide Paid items

  // EDITOR STATE
  const [openEdit, setOpenEdit] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [editForm, setEditForm] = useState({ vendor: '', invoiceNumber: '', amount: '', date: '', category: '' });

  const fetchInvoices = () => {
    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices')
      .then(response => response.json())
      .then(data => {
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

    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(() => {
      fetchInvoices();
      event.target.value = null; 
    });
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this invoice?")) {
        fetch(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/${id}`, { method: 'DELETE' })
        .then(() => fetchInvoices());
    }
  };

  const handleMarkPaid = (id) => {
    fetch(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/${id}/status?status=PAID`, { method: 'PUT' })
    .then(() => fetchInvoices());
  };

  // OPEN EDITOR
  const handleEditClick = (invoice) => {
    setCurrentInvoice(invoice);
    // Pre-fill form with existing data (or empty strings to avoid null errors)
    setEditForm({
        vendor: invoice.vendor || '',
        invoiceNumber: invoice.invoiceNumber || '',
        amount: invoice.amount || '',
        date: invoice.date || '',
        category: invoice.category || '',
        project: invoice.project || ''
    });
    setOpenEdit(true);
  };

  // SAVE CHANGES
  const handleSaveEdit = () => {
    fetch(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/${currentInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
    })
    .then(() => {
        setOpenEdit(false);
        fetchInvoices(); 
    });
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // STATS CALCULATION
  const pendingInvoices = invoices.filter(invoice => invoice.status !== 'PAID');
  const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID');

  const totalDue = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  // FILTER THE LIST FOR DISPLAY
  // If 'showHistory' is true, show everything. If false, show only Pending.
  const displayInvoices = showHistory ? invoices : pendingInvoices;

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#000000', textAlign: 'center', mt: 4 }}>
        PIVIK Dashboard
      </Typography> 

      {/* SPLIT STATS CARDS */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* Card 1: Due Now */}
          <Card sx={{ flex: 1, bgcolor: '#808080', borderLeft: '5px solid #000000' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: '#000000' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Amount Due (Pending)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  ${totalDue.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Card 2: Total Paid */}
          <Card sx={{ flex: 1, bgcolor: '#e8f5e9', borderLeft: '5px solid #2e7d32' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Total Paid (YTD)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                  ${totalPaid.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
      </Box>

      {/* CONTROLS AREA */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa' }}>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* History Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', p: 1, borderRadius: 1, border: '1px solid #ccc' }}>
                <input 
                    type="checkbox" 
                    checked={showHistory} 
                    onChange={(e) => setShowHistory(e.target.checked)}
                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                />
                <Typography sx={{ ml: 1, fontSize: '0.9rem' }}>Show Paid History</Typography>
            </Box>

            <Typography variant="body2" sx={{ fontWeight:'bold', ml: 2 }}>Report Period:</Typography>
            <input 
                type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <Typography>to</Typography>
            <input 
                type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            
            <Button 
                variant="outlined" color="secondary" size="small"
                onClick={() => window.location.href = `http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/report?startDate=${startDate}&endDate=${endDate}`}
            >
                PDF Only
            </Button>

            <Button 
                variant="contained" color="secondary" size="small"
                onClick={() => window.location.href = `http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/export-zip?startDate=${startDate}&endDate=${endDate}`}
            >
                Download Bundle
            </Button>
        </Box>

        <Box>
            <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current.click()}>
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
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell> 
            </TableRow>
          </TableHead>
          <TableBody>
            {displayInvoices
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
                <TableCell>
                  {invoice.project === 'FED UP' && (
                  <Chip label="FED UP" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                  )}
                </ TableCell>
                
                <TableCell>
                    {invoice.status === 'PAID' ? (
                        <Chip label="PAID" color="success" size="small" icon={<CheckCircleIcon />} />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">{invoice.status}</Typography>
                            <IconButton color="success" size="small" title="Mark as Paid" onClick={() => handleMarkPaid(invoice.id)}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Box>
                    )}
                </TableCell>

                <TableCell align="center">
                  {/* EDIT BUTTON */}
                  <IconButton color="primary" onClick={() => handleEditClick(invoice)}>
                    <EditIcon />
                  </IconButton>
                  
                  {/* DELETE BUTTON */}
                  <IconButton color="error" onClick={() => handleDelete(invoice.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 8, 10, 25]}
          component="div"
          count={displayInvoices.length} // Use the filtered count
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Edit dialog popup */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '300px' }}>
                <TextField 
                    label="Vendor" 
                    value={editForm.vendor} 
                    onChange={(e) => setEditForm({...editForm, vendor: e.target.value})}
                />
                <TextField 
                    label="Invoice Number" 
                    value={editForm.invoiceNumber} 
                    onChange={(e) => setEditForm({...editForm, invoiceNumber: e.target.value})}
                />
                <TextField 
                    label="Amount ($)" 
                    type="number"
                    value={editForm.amount} 
                    onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                />
                <TextField 
                    label="Date" 
                    type="date"
                    value={editForm.date} 
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField 
                    label="Category" 
                    value={editForm.category} 
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                />

                <TextField
                    select
                    label="Project / Budget"
                    value={editForm.project || ""}
                    onChange={(e) => setEditForm({...editForm, project: e.target.value})}
                    SelectProps={{ native: true }}
                >
                    <option value="">General (No Project)</option>
                    <option value="FED UP">FED UP ($30k Grant)</option>
                </TextField>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;