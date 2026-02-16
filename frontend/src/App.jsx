import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './components/Dashboard';
import HouseList from './components/HouseList';
import HouseDetail from './components/HouseDetail';
import TenantList from './components/TenantList';
import TenantDetail from './components/TenantDetail';
import PaymentList from './components/PaymentList';
import MaintenanceList from './components/MaintenanceList';
import Reports from './components/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="houses" element={<HouseList />} />
          <Route path="houses/:id" element={<HouseDetail />} />
          <Route path="tenants" element={<TenantList />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
