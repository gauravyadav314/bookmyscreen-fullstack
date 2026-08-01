import { useContext, createContext } from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendOTP, verifyOTP, activate, logout } from "../apis";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [step, setStep] = useState(1);
    const [showModal , setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [interval, setInterval] = useState(null);
    const [authData, setAuthData] = useState();
    const [auth, setAuth] = useState(false);

    // Mutations
    const sendOtpRequestMutation = useMutation({
        mutationFn : (email) => sendOTP({email}),
    })

    const verifyOtpRequestMutation = useMutation({
        mutationFn : (reqData) => verifyOTP(reqData),
    })

    const activateUserMutation = useMutation({
        mutationFn : (reqData) => activate(reqData),
    })

    const logOutMutation = useMutation({
        mutationFn : () => logout(),
    })


    const toggleModal = () => {
        setShowModal(!showModal)
        if(step !== 1){
            setStep(1);
        }
    }

    const sendOtpRequest = async ({email, onNext, setLoading}) => {
        sendOtpRequestMutation.mutate(email, {
            onSuccess : (res) => {
                console.log(res.data);
                setAuthData(res.data);
                toast.success("OTP sent to your email");
                onNext();
            },
            onError : (err) => {
                console.log(err);
                const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Something went wrong";
                toast.error(msg);
            }
        })
        
    }

    const verifyOtpRequest = async (otp, onNext) => {
        if (!authData || !authData.hash || !authData.email) {
            toast.error("Session expired. Please request a new OTP.");
            setStep(1);
            return;
        }

        const { hash, email } = authData;
        const reqData = { otp, hash, email };

        verifyOtpRequestMutation.mutate(reqData, {
            onSuccess : (res) => {
                setAuthData(null);
                setUser(res.data.user);
                setAuth(true);
                if(!res.data.user?.activateUser){
                    onNext();
                }else{
                    setStep(1);
                    toggleModal();
                }
            },
            onError : (err) => {
                console.log(err);
                const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Something went wrong";
                toast.error(msg);
            }
        })
    }

    const activateUserRequest = async (data) => {
        const { name, phone } = data;
        const id = user?._id;
        const reqData = { id, name, phone };

        activateUserMutation.mutate(reqData, {
            onSuccess : (res) => {
                console.log(res);
                setUser(res.data);
                setStep(1);
                toggleModal();
            },
            onError : (err) => {
                console.log(err);
                const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Something went wrong";
                toast.error(msg);
            }
        })
    };

    const logoutRequest = () => {
        logOutMutation.mutate(null, {
            onSuccess: (data) => {
            console.log(data);
            setAuth(false);
            setUser(null);
            window.location.href = "/" 
        },
            onError: (error) => {
            console.log(error);
            const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong";
            toast.error(msg);
        },
        })
    }

    const loginDemoUser = (role = "customer") => {
        const demoUser = {
            _id: "demo_user_67890",
            name: role === "admin" ? "Admin Demo" : "Amrit Sharma",
            email: role === "admin" ? "admin@bookmyscreen.com" : "amrit@example.com",
            phone: "+91 9876543210",
            role: role === "admin" ? "ADMIN" : "CUSTOMER",
            activateUser: true,
        };
        setUser(demoUser);
        setAuth(true);
        setShowModal(false);
        setStep(1);
        toast.success(`Logged in as ${demoUser.name}`);
    };

    return (
        <AuthContext.Provider value={{ step, setStep, showModal, toggleModal, sendOtpRequest, authData, user, setUser ,verifyOtpRequest, activateUserRequest, logoutRequest, loginDemoUser, auth, setAuth, otpLoader:sendOtpRequestMutation.isPending, verifyOtpLoader: verifyOtpRequestMutation.isPending, activateUserLoader: activateUserMutation.isPending }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext);