import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Grid, Card, CardContent, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

function Suppliers() {
  const [vendorData, setVendorData] = useState([]);

  useEffect(() => {
    fetch('http://pivikmanager-env.eba-eybupv2n.us-east-1.elasticbeanstalk.com/api/invoices')
      .then(response => response.json())
      .then(data => {
        processData(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const processData = (invoices) => {
    if (!invoices || !Array.isArray(invoices)) {
        setVendorData([]);
        return;
    }

    const vendorMap = {};

    invoices.forEach(invoice => {
      const vendorName = invoice.vendor || "Unknown";
      const amount = invoice.amount || 0;

      if (vendorMap[vendorName]) {
        vendorMap[vendorName] += amount;
      } else {
        vendorMap[vendorName] = amount;
      }
    });

    const chartData = Object.keys(vendorMap).map(key => ({
      name: key,
      value: vendorMap[key]
    }));

    chartData.sort((a, b) => b.value - a.value);
    setVendorData(chartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
        Supplier Analytics
      </Typography>

      <Grid container spacing={3}>
        
        {/* Chart Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '500px' }}>
            <Typography variant="h6" gutterBottom>Top Vendors by Spend</Typography>
            
            {vendorData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8884d8">
                    {vendorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ mt: 10, textAlign: 'center', color: 'gray' }}>
                No data available. Upload some invoices!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* List Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#f8f9fa', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {vendorData.map((vendor, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', pb: 1 }}>
                    <Typography fontWeight="bold">{vendor.name}</Typography>
                    <Typography>${vendor.value.toFixed(2)}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Suppliers;