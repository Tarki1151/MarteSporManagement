import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/layout/AppLayout';
import MembersPage from './pages/MembersPage';
import PackagesPage from './pages/PackagesPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<MembersPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
