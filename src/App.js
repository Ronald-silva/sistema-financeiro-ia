import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';  // Certifique-se de criar este arquivo
import AddTransaction from './pages/AddTransaction';  // Certifique-se de criar este arquivo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
