import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, InputAdornment, 
  Chip, IconButton, Tooltip, TablePagination 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import DownloadIcon from '@mui/icons-material/Download';

function Archive() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // PAgination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); 

  useEffect(() => {
    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices')
      .then(response => response.json())
      .then(data => setInvoices(data)) 
      .catch(error => console.error('Error:', error));
  }, []);

  const handleRevertToPending = (id) => {
    if(window.confirm("Move this invoice back to the Dashboard (Pending)?")) {
        fetch(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/${id}/status?status=On Payment Term`, { 
            method: 'PUT',
        })
        .then(() => {
            return fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices').then(res => res.json());
        })
        .then(data => setInvoices(data));
    }
  };

  // Search Logic: Checks vendor or invoice number
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const vendor = (invoice.vendor || "").toLowerCase();
    const invNum = (invoice.invoiceNumber || "").toLowerCase(); 
    
    return vendor.includes(searchLower) || invNum.includes(searchLower);
  });

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mt: 4, fontWeight: 'bold'}}>
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
        <Paper sx={{ width: '100%', mb: 2 }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: '#eee' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Invoice #</TableCell> 
                            <TableCell>Vendor</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvoices
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((invoice) => (
                            <TableRow key={invoice.id} hover>
                                <TableCell>{invoice.id}</TableCell>
                                
                                {/* Invoice # with specific font */}
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#555' }}>
                                    {invoice.invoiceNumber || '-'}
                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>{invoice.vendor}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                
                                <TableCell>
                                    {invoice.amount ? `$${invoice.amount.toFixed(2)}` : '-'}
                                </TableCell>

                                <TableCell>
                                    {invoice.status === 'PAID' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Chip size="small" label="PAID" color="success" icon={<CheckCircleIcon/>} />
                                            
                                            <Tooltip title="Undo (Move back to Dashboard)">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleRevertToPending(invoice.id)}
                                                    sx={{ color: 'gray' }}
                                                >
                                                    <UndoIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Download PDF">
                                                <IconButton 
                                                    color="primary" 
                                                    onClick={() => window.open(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices/file/${invoice.fileUrl}`, '_blank')}
                                                >
                                                    <DownloadIcon />
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
            
            {/* Pagination controls */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    </Container>
  );
}

export default Archive;