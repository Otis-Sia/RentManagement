import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Layout';

import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import HouseList from './components/HouseList';
import HouseDetail from './components/HouseDetail';
import TenantList from './components/TenantList';
import TenantDetail from './components/TenantDetail';
import PaymentList from './components/PaymentList';
import MaintenanceList from './components/MaintenanceList';
import TransactionList from './components/TransactionList';
import InvoiceList from './components/InvoiceList';
import FinancialReports from './components/FinancialReports';
import EmployeeList from './components/EmployeeList';
import PayrollRunList from './components/PayrollRunList';
import BroadcastList from './components/BroadcastList';
import Reports from './components/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="houses" element={<HouseList />} />
          <Route path="houses/:id" element={<HouseDetail />} />
          <Route path="tenants" element={<TenantList />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="transactions" element={<TransactionList />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="financial-reports" element={<FinancialReports />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="payroll" element={<PayrollRunList />} />
          <Route path="broadcasts" element={<BroadcastList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
