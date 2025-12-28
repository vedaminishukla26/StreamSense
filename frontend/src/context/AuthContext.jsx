import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

const login = async (formData) => {
  try {
    const response = await api.post('/auth/login', formData);
    const data = response.data;

    if (!data.token || !data._id) {
       throw new Error("Invalid response structure from server");
    }

    const { token, ...userDetails } = data;

    localStorage.setItem('token', token); 
    setUser(userDetails); 
    
     console.log("Login Success:", userDetails.username);

  } catch (err) {
    console.error("Login Error:", err);
    throw err;
  }
};

    const register = async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
        {!loading && children} 
    </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);