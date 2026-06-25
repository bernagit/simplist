import { User } from "@/models/auth";
import { Resp } from "@/models/base";
import api from "@/utils/ky";

async function login(email: string, password: string): Promise<{ token: string }> {
    return await api
        .post<{ token: string }>("auth/login", { json: { email, password } })
        .json();
}

async function register(name: string, email: string, password: string): Promise<{ token: string }> {
    return await api
        .post<{ token: string }>("auth/register", { json: { name, email, password } })
        .json();
}

async function logout(): Promise<void> {
    await api.post("auth/logout").json();
}

async function getMe(): Promise<Resp<User>> {
    const res = await api.get<Resp<User>>("auth/me").json();
    return res;
}

export const authService = {
    login,
    register,
    logout,
    getMe
};
