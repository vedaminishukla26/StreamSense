import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth(); 
    
    if (loading) {
        return <div className="p-10 text-white">Loading...</div>;
    }

    if (!user) {
         const token = localStorage.getItem('token');
        if (token) {
            return <div className="p-10 text-white">Verifying Session...</div>;
        }
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;