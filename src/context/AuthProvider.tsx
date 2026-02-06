import {useEffect, useState} from "react";
import type {LoginFields} from "./../schemas/login.ts";
import {login} from "./../services/api.login.ts";
import {deleteCookie, getCookie, setCookie} from "./../utils/cookies.ts";
import {jwtDecode} from "jwt-decode";
import {AuthContext} from "./AuthContext.ts";

type JwtPayload = {
    email?: string;
    role?: string;
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie("access_token");
        setAccessToken(token ?? null);
        if (token){
            try{
                const decoded = jwtDecode<JwtPayload>(token);
                setUserRole(decoded.role ?? getCookie("user_role") ?? null);
            } catch {
                setUserRole(getCookie("user_role") ?? null);
            }
        } else {
            setUserRole(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleTokenExpired = () => {
            deleteCookie("access_token");
            deleteCookie("user_role");
            setAccessToken(null);
            setUserRole(null);
        };
        window.addEventListener("auth:tokenExpired", handleTokenExpired);
        return () => window.removeEventListener("auth:tokenExpired", handleTokenExpired);
    }, []);

    const loginUser = async (fields: LoginFields) => {
        const res = await login(fields);

        setCookie( "access_token", res.access_token, {
            expires: 1,
            sameSite: "Lax", // Strict on production env
            secure: false, // true (HTTPS)
            path: "/",
        });
        if (res.role) {
            setCookie("user_role", res.role, { expires: 1, sameSite: "Lax", secure: false, path: "/" });
        }

        setAccessToken(res.access_token);
        setUserRole(res.role ?? null);
    };

    const logoutUser = () => {
        deleteCookie("access_token");
        deleteCookie("user_role");
        setAccessToken(null);
        setUserRole(null);
    };

    return (
        <>
            <AuthContext.Provider
                value={{
                    isAuthenticated: !!accessToken,
                    accessToken,
                    userRole,
                    loginUser,
                    logoutUser,
                    loading,
                }}>
                { loading ? null : children }
            </AuthContext.Provider>
        </>
    )
}