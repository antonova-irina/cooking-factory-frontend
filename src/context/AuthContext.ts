import {createContext} from "react";
import type {LoginFields} from "./../schemas/login.ts";

type AuthContextProps = {
    isAuthenticated: boolean;
    accessToken: string | null;
    userRole: string | null;
    loginUser: (fields: LoginFields) => Promise<void>;
    logoutUser: () => void;
    loading: boolean;
}

export const AuthContext =
    createContext<AuthContextProps | undefined>(undefined);