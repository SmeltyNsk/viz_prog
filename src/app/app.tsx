import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import LoginPage from '@pages/loginPage/loginPage';
import DocumentsPage from '@pages/documentsPage/documentsPage';
import SpreadsheetPage from '@pages/spreadsheetPage/spreadsheetPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/documents" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
      </Routes>
    </Router>
  );
}

export default App;