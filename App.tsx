import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CondoDataProvider } from './context/CondoDataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './views/Login';
import ResidentView from './views/ResidentView';

const App: React.FC = () => {
  return (
    <CondoDataProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/resident-view" element={<ResidentView />} />
          <Route 
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </CondoDataProvider>
  );
};

export default App;