import { useEffect, useState } from "react";
import { getUser } from "../apis";
import { useAuth } from "../context/AuthContext";


export const useLoadUser = () => {
    const [ isLoading, setIsLoading ] = useState(true);
    const { setUser, setAuth } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getUser();
                if (data && data._id) {
                    setUser(data);
                    setAuth(true);
                } else {
                    setUser(null);
                    setAuth(false);
                }
            } catch (error) {
                setUser(null);
                setAuth(false);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);


    return { isLoading };
}