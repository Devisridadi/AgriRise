import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf } from "lucide-react";
import CropGrowthAnimation from "@/components/CropGrowthAnimation";
import FloatingParticles from "@/components/FloatingParticles";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AUTH_ENDPOINTS } from "@/lib/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success("Welcome back!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F2FCE2]/50 p-4 md:p-6 lg:p-8 items-center justify-center relative overflow-hidden">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <FloatingParticles />
            </div>

            <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row relative min-h-[700px] z-10 backdrop-blur-sm bg-white/90">
                {/* Left Side - Image/Hero */}
                <div className="w-full md:w-1/2 relative bg-primary p-8 md:p-12 flex flex-col justify-end text-white overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-bf791df7f529?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 animate-fade-up">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#FEF7CD] text-primary-foreground font-bold px-3 py-1 rounded-full text-sm">
                                12k+
                            </div>
                            <div className="text-sm font-medium text-white/90">
                                <span className="block font-bold text-white">JOIN WITH 30k+ USERS!</span>
                                Let's see our happy customer
                            </div>
                        </div>

                        {/* Animation Card */}
                        <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
                            <CropGrowthAnimation />
                        </div>

                        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
                                Back to <br />
                                <span className="text-[#FEF7CD]">nature.</span>
                            </h1>
                            <p className="text-lg text-white/80 max-w-md">
                                Let get started with your 30 days free trail
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white/50">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        <div className="text-center space-y-2 animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary font-serif">
                                    <Leaf className="h-8 w-8 text-primary animate-bounce-slow" />
                                    AgriML
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back!</h2>
                            <p className="text-muted-foreground">
                                Welcome back!, Please enter your details
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                />
                            </div>

                            <div className="flex items-center justify-between animate-fade-up" style={{ animationDelay: "0.3s" }}>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                                    >
                                        Remember for 30 days
                                    </label>
                                </div>
                                <Link to="/forgot-password" className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors">
                                    Forgot Password
                                </Link>
                            </div>

                            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 text-base rounded-xl font-semibold bg-[#2C4A34] hover:bg-[#1f3525] relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <span className="relative z-10 flex items-center justify-between w-full px-4">
                                        {isLoading ? "Signing In..." : "Sign In"}
                                        <div className="bg-[#D3E836] p-1.5 rounded-full text-[#2C4A34] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                                            <ArrowUpRight size={20} className="font-bold" />
                                        </div>
                                    </span>
                                </Button>

                                <div className="text-center text-sm font-medium text-gray-600">
                                    Already have an account?{" "}
                                    <Link to="/signup" className="text-primary hover:underline font-bold transition-colors">
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
