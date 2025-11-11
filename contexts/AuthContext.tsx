import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/apiService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<User | null>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (username: string, password: string): Promise<User | null> => {
        setIsLoading(true);
        try {
            const loggedInUser = await api.login(username, password);
            if (loggedInUser) {
                setUser(loggedInUser);
                sessionStorage.setItem('user', JSON.stringify(loggedInUser));
                return loggedInUser;
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
