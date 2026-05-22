import { createContext, useState, useEffect } from "react";
import { getUser } from "./services/auth.api";


export const AuthContext = createContext();


export const AuthProvider = ({children}) =>{

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initUser = async () => {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setLoading(false);
            }
        };

        initUser();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    )

}