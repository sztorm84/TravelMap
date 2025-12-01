import { createContext, useState, useEffect } from "react";
import { API_URL } from "../apiConfig";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    useEffect(() => {
        const storedTokens = localStorage.getItem("authTokens");
        if (storedTokens) {
            setAuthTokens(JSON.parse(storedTokens));
            setUser("Admin");
        }
    }, []);
    const loginUser = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        let response = await fetch(`${API_URL}/auth/jwt/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(username);
            localStorage.setItem("authTokens", JSON.stringify(data));
            alert("Zalogowano pomyślnie!");
            return true;
        } else {
            alert("Błędne dane logowania!");
            return false;
        }
    };
    
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        window.location.href = "/";
    };

    const contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};