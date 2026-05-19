import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AppLayout from '@app/view/layout';
import ProtectedRoute from '@app/router/router';

import DashboardPage from '@pages/dashboard/dashboardPage';
import LoginPage from '@pages/login/loginPage';
import NotFoundPage from '@pages/notFound/notFoundPage';
import ProfilePage from '@pages/profile/profilePage';
import SpreadsheetPage from '@pages/spreadsheetPage/spreadsheetPage';
import RegisterPage from '@pages/register/registerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/:documentId"
            element={
              <ProtectedRoute>
                <SpreadsheetPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;