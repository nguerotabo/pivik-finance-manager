import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          PIVIK Finance
        </Typography>
        <Box>
            {/* The "Link" component changes the URL without reloading */}
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/suppliers">Suppliers</Button>
            <Button color="inherit" component={Link} to="/archive">Archive</Button>
            <Button color="inherit" component={Link} to="/earnings">Revenue</Button>
            <Button color="inherit" component={Link} to="/fed-up">FedUP</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default Navbar;