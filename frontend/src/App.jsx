import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './pages/Dashboard';
import Archive from './pages/Archive'; 
import Suppliers from './pages/Suppliers';
import Earnings from './pages/Earnings';
import FedUp from './pages/FedUp';

function App() {
  return (
    <Router>
      <Navbar /> {/* The Frame always stays visible */}

    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/fed-up" element={<FedUp />} />
    </Routes>
    </Router>
  );
}

export default App;