import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import API_BASE_URL from '../config/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User, token?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('trimbook_user');
            const storedToken = localStorage.getItem('trimbook_token');

            if (storedToken) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (res.ok) {
                        const userData = await res.json();
                        // Optional mapping from mongo _id to frontend id, but backend returns `id` nicely in login.
                        // Profile returns raw mongo object which has `_id`. We'll map it smoothly:
                        const mappedUser = {
                            id: userData._id || userData.id,
                            name: userData.name,
                            email: userData.email,
                            role: userData.role,
                            phone: userData.phone,
                            location: userData.location,
                            avatarUrl: userData.avatarUrl,
                            portfolioImages: userData.portfolioImages,
                            workingHours: userData.workingHours
                        };
                        setUser(mappedUser);
                        localStorage.setItem('trimbook_user', JSON.stringify(mappedUser));
                    } else {
                        // Token might be invalid or expired
                        localStorage.removeItem('trimbook_user');
                        localStorage.removeItem('trimbook_token');
                        setUser(null);
                    }
                } catch (err) {
                    console.error('Failed to verify token', err);
                    if (storedUser) {
                        try { setUser(JSON.parse(storedUser)); } catch (e) {}
                    }
                }
            } else if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    // Handle JSON parse error from stale/broken state
                }
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = (userData: User, token?: string) => {
        setUser(userData);
        localStorage.setItem('trimbook_user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('trimbook_token', token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('trimbook_user');
        localStorage.removeItem('trimbook_token');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
