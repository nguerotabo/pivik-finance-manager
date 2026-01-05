import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar({ onLogout }) {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#FFFFFF' }}> 
      <Toolbar>
        {/* LOGO AREA */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {/* This looks for the file inside the public folder */}
            <img 
                src="/pivik-logo.png" 
                alt="Pivik Logo" 
                style={{ height: '60px', marginRight: '15px' }} 
            />
        </Box>

        {/* NAVIGATION LINKS */}
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="000000" component={Link} to="/" sx={{ color: '#000000', fontWeight: 'bold' }}>Dashboard</Button>
            <Button color="inherit" component={Link} to="/fed-up" sx={{ color: '#000000', border: '1px solid black', borderRadius: 2 }}>FED UP Tracker</Button>
            <Button color="inherit" component={Link} to="/suppliers" sx={{ color: '#000000'}}>Suppliers</Button>
            <Button color="inherit" component={Link} to="/earnings" sx={{ color: '#000000'}}>Revenue</Button>
            <Button color="inherit" component={Link} to="/archive" sx={{ color: '#000000'}}>Archive</Button>
            <Button color="inherit" onClick={onLogout}sx={{ ml: 'auto', opacity: 0.7,fontSize: '0.8rem', color: '#000000'}}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;