// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import Header from './components/Header.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NewPickup from './pages/NewPickup.jsx';
import Pickups from './pages/Pickups.jsx';
import AggregatorDashboard from './pages/AggregatorDashboard.jsx';
import RecyclerDashboard from './pages/RecyclerDashboard.jsx';
import Certificate from './pages/Certificate.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User flow */}
          <Route path="/new-pickup" element={<NewPickup />} />
          <Route path="/pickups" element={<Pickups />} />

          {/* Role dashboards */}
          <Route path="/dashboard/aggregator" element={<AggregatorDashboard />} />
          <Route path="/dashboard/recycler" element={<RecyclerDashboard />} />

          {/* Public-ish certificate (auth required by API, but URL is shareable) */}
          <Route path="/certificates/:id" element={<Certificate />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
