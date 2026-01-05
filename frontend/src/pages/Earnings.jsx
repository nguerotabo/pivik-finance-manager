import { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, TextField, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Grid, Card, CardContent, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("Daily Sales");

  // 1. Fetch Earnings
  const fetchEarnings = () => {
    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/earnings')
      .then(res => res.json())
      .then(data => setEarnings(data));
  };

  // 2. Fetch Expenses (Invoices)
  const fetchExpenses = () => {
    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices')
      .then(res => res.json())
      .then(data => setExpenses(data));
  };

  useEffect(() => {
    fetchEarnings();
    fetchExpenses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!amount) return;

    const newEarning = { date, amount: parseFloat(amount), source };

    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEarning)
    }).then(() => {
        setAmount("");
        fetchEarnings();
    });
  };

  const handleDelete = (id) => {
      if(window.confirm("Delete this entry?")) {
        fetch(`http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/earnings/${id}`, { method: 'DELETE' })
        .then(fetchEarnings);
      }
  };

  // THE BIG MATH
  const totalRevenue = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
        Financial Overview
      </Typography>

      {/* PROFIT DASHBOARD CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Card 1: Revenue */}
        <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#e8f5e9', borderLeft: '6px solid #2e7d32' }}>
                <CardContent>
                    <Typography color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                        +${totalRevenue.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>

        {/* Card 2: Expenses */}
        <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#ffebee', borderLeft: '6px solid #d32f2f' }}>
                <CardContent>
                    <Typography color="text.secondary">Total Expenses</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                        -${totalExpenses.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>

        {/* Card 3: Net Profit */}
        <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: isProfitable ? '#e3f2fd' : '#fff3e0', borderLeft: `6px solid ${isProfitable ? '#1976d2' : '#ed6c02'}` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary">Net Profit</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: isProfitable ? '#1976d2' : '#ed6c02' }}>
                            {isProfitable ? '+' : ''}${netProfit.toFixed(2)}
                        </Typography>
                    </Box>
                    {isProfitable ? <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2' }}/> : <TrendingDownIcon sx={{ fontSize: 40, color: '#ed6c02' }}/>}
                </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* INPUT FORM */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom>Add New Income</Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField 
                type="date" 
                label="Date"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white' }}
            />
            <TextField 
                label="Amount ($)" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required
                sx={{ bgcolor: 'white' }}
            />
            <TextField 
                label="Source (e.g. Register 1)" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                sx={{ bgcolor: 'white', flexGrow: 1 }}
            />
            <Button variant="contained" color="success" size="large" type="submit" startIcon={<AttachMoneyIcon />}>
                Add
            </Button>
        </form>
      </Paper>

      {/* REVENUE LIST */}
      <TableContainer component={Paper}>
        <Table>
            <TableHead sx={{ bgcolor: '#eee' }}>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="right">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {earnings.map((earning) => (
                    <TableRow key={earning.id} hover>
                        <TableCell>{earning.date}</TableCell>
                        <TableCell>{earning.source}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            +${earning.amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                            <IconButton color="error" onClick={() => handleDelete(earning.id)}>
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

export default Earnings;