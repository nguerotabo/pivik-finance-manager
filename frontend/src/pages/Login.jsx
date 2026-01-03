import { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Password
  const SECRET_KEY = "pivik2025"; 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SECRET_KEY) {
      onLogin(true);
      navigate('/'); // Go to Dashboard
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#e3f2fd' 
      }}
    >
      <Paper elevation={10} sx={{ p: 5, textAlign: 'center', maxWidth: 400, borderRadius: 4 }}>
    
        <img src="/pivik-logo.png" alt="Logo" style={{ height: 60, marginBottom: 20 }} />
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            Pivik Manager
        </Typography>

        <form onSubmit={handleSubmit}>
            <TextField 
                label="Enter Password" 
                type="password" 
                variant="outlined" 
                fullWidth 
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value); 
                    setError(false);
                }}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />
                }}
            />
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>Incorrect Password</Alert>}

            <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ 
                    bgcolor: '#1a237e', 
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#0d47a1' } 
                }}
            >
                Login
            </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;