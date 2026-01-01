import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, InputAdornment, Chip, IconButton, Tooltip 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';

function Archive() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('http://localhost:8080/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data)) //fetch everything
      .catch(error => console.error('Error:', error));
  }, []);

  // The Search Logic
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const vendor = (invoice.vendor || "").toLowerCase();
    const invNum = (invoice.invoiceNumber || "").toLowerCase();
    
    return vendor.includes(searchLower) || invNum.includes(searchLower);
  });

  //Undo logic
  const handleRevertToPending = (id) => {
    if(window.confirm("Move this invoice back to the Dashboard (Pending)?")) {
        fetch(`http://localhost:8080/api/invoices/${id}/status?status=On Payment Term`, {
            method: 'PUT',
        })
        .then(() => {
            // Refresh the list to show the change
            return fetch('http://localhost:8080/api/invoices').then(res => res.json());
        })
        .then(data => setInvoices(data))
        .catch(error => console.error('Error reverting:', error));
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#555' }}>
            Invoice Archive
        </Typography>

        {/* SEARCH BAR */}
        <Paper sx={{ p: 2, mb: 3 }}>
            <TextField 
                fullWidth 
                variant="outlined" 
                placeholder="Search by Vendor or Invoice Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
        </Paper>

        {/* RESULTS TABLE */}
        <TableContainer component={Paper}>
            <Table>
                <TableHead sx={{ bgcolor: '#eee' }}>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} hover>
                            <TableCell>{invoice.id}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{invoice.vendor}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                {invoice.status === 'PAID' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Chip size="small" label="PAID" color="success" icon={<CheckCircleIcon/>} />
                                        
                                        {/*UNDO BUTTON*/}
                                        <Tooltip title="Undo (Move back to Dashboard)">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleRevertToPending(invoice.id)}
                                                sx={{ color: 'gray' }}
                                            >
                                                <UndoIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                ) : (
                                    <Chip size="small" label="PENDING" color="warning" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>
  );
}

export default Archive;