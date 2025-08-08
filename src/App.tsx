import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Directory from './pages/Directory';
import Login from './pages/Login';
import Match from './pages/Matches';

// Components
// import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Store
import { useUserStore } from './store';

function App() {
  // const { isAuthenticated, isAdmin } = useUserStore();
  const { isAuthenticated } = useUserStore();

  return (
    <Router>
      <div className="app min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/directory" 
            element={
              //<ProtectedRoute>
                <Directory />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/matches" 
            element={

                <Match />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/directory" /> : <Login />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;