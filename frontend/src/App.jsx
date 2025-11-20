
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEditTask from './pages/CreateEditTask';

import './App.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
         
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
         
            <Route 
              path="/task/create" 
              element={
                <ProtectedRoute>
                  <CreateEditTask />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/task/edit/:id" 
              element={
                <ProtectedRoute>
                  <CreateEditTask />
                </ProtectedRoute>
              } 
            />
            
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;