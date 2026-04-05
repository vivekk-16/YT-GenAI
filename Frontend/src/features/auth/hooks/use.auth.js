import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import {login,register,logout,getUser} from "../services/auth.api"


export const useAuth = ()=>{
    const context = useContext(AuthContext);

    const {user, setUser, loading, setLoading} = context;

    const handleLogin = async ({email, password}) => {
        
        setLoading(true);
        try{
            const data = await login({email, password});
            setUser(data.user);

        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoading(false);
        }

    }

    const handleRegister = async ({username, email, password}) =>{
        setLoading(true);

        try{
            const data = await register({username, email, password});

            setUser(data.user);
        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoading(false);
        }
    }

    const handleLogout = async ({email, password}) =>{
        setLoading(true);

        try{
            const data = await logout({email, password});

            setUser(null);
        }
        catch(err){
            console.log(err);
            
        }
        finally{
            setLoading(false);

        }
    }

   useEffect(() => {
    const getAndSetUser = async () => {
        try {
            const data = await getUser();
            setUser(data.user);
        } catch (error) {
            console.error("User fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    getAndSetUser();
    }, []);

    return {user, loading, handleRegister, handleLogin, handleLogout}

}