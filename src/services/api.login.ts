import type {LoginFields} from "./../schemas/login.ts"

const API_URL = import.meta.env.VITE_API_URL;

export type LoginResponse = {
    access_token: string;
    vat?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
}

export async function login({username, password}: LoginFields): Promise<LoginResponse> {
    // const form = new URLSearchParams();
    // form.append("username", username);
    // form.append("password", password);


    const res = await fetch(API_URL + "/auth/authenticate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
    if (!res.ok){
        let detail = "Login failed";
        try {
            const data =  await res.json();
            if ( typeof data?.detail === "string" ) detail = data.detail;
        } catch {
            // Ignore JSON parse errors, use default detail
        }
        throw new Error(detail);
    }
    return await res.json();
}