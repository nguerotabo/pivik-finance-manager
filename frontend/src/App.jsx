import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './pages/Dashboard';
// We will build this next!
import Suppliers from './pages/Suppliers'; 

function App() {
  return (
    <Router>
      <Navbar /> {/* The Frame always stays visible */}
      
      <Routes>
        {/* If URL is "/", show Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* If URL is "/suppliers", show Suppliers */}
        <Route path="/suppliers" element={<Suppliers />} />
      </Routes>
    </Router>
  );
}

export default App;