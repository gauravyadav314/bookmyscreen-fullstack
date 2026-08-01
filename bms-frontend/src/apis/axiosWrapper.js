import axios from "axios";

const defaultHeader = {
    "Content-Type": "application/json",
    Accept : "application/json",
};

export const axiosWrapper = axios.create({
    baseURL : import.meta.env.VITE_BACKEND_URL || "http://localhost:9000/api/v1",
    withCredentials: true,
    headers : { ...defaultHeader },
})