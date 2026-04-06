import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf } from "lucide-react";
import CropGrowthAnimation from "@/components/CropGrowthAnimation";
import FloatingParticles from "@/components/FloatingParticles";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AUTH_ENDPOINTS } from "@/lib/api";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [farmingType, setFarmingType] = useState("");
    const [experience, setExperience] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleGetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            console.log("Requesting OTP for:", email);
            const response = await fetch(AUTH_ENDPOINTS.SEND_OTP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Verification code sent to your email!");
            setStep(2);
        } catch (error: any) {
            console.error("OTP Error:", error);
            toast.error(error.message || "Failed to send OTP. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("Attempting signup with data:", { email, name, phone, otp });
            const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone,
                    address,
                    farming_type: farmingType,
                    experience_years: experience,
                    otp
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            toast.success("Account created successfully! Please login.");
            navigate("/login");
        } catch (error: any) {
            console.error("Signup Error Details:", error);
            toast.error(error.message || "Signup failed. Please try again.");
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
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2 animate-fade-up">
                            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
                                Grow <br />
                                <span className="text-[#FEF7CD]">smarter.</span>
                            </h1>
                            <p className="text-lg text-white/80 max-w-md">
                                Join our community of 30k+ farmers and agronomists.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#FEF7CD] text-primary-foreground font-bold px-3 py-1 rounded-full text-sm">
                                4.9/5
                            </div>
                            <div className="text-sm font-medium text-white/90">
                                Rated by users
                            </div>
                        </div>

                        {/* Animation Card */}
                        <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
                            <CropGrowthAnimation />
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white/50">
                    <div className="max-w-md mx-auto w-full space-y-8 animate-fade-in">
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-2 text-2xl font-bold text-primary font-serif">
                                    <Leaf className="h-8 w-8 text-primary animate-bounce-slow" />
                                    AgriML
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                {step === 1 ? "Create Account" : "Verify Email"}
                            </h2>
                            <p className="text-muted-foreground">
                                {step === 1 ? "Start your smart farming journey today" : `Enter 6-digit code sent to ${email}`}
                            </p>
                        </div>

                        {step === 1 ? (
                            <form className="space-y-6" onSubmit={handleGetOtp}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 234 567 890"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Farming Experience (Years)</Label>
                                        <Input
                                            id="experience"
                                            type="number"
                                            placeholder="e.g. 5"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="farmingType">Farming Type</Label>
                                    <Input
                                        id="farmingType"
                                        type="text"
                                        placeholder="Organic, Cattle, Dairy..."
                                        value={farmingType}
                                        onChange={(e) => setFarmingType(e.target.value)}
                                        className="h-12 bg-gray-50 border-gray-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Location / Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="City, State, Country"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="h-12 bg-gray-50 border-gray-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 bg-gray-50 border-gray-200"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 text-base rounded-xl font-semibold bg-[#2C4A34] hover:bg-[#1f3525] group shadow-lg"
                                >
                                    <span className="flex items-center justify-between w-full px-4">
                                        {isLoading ? "Processing..." : "Continue to Verify"}
                                        <div className="bg-[#D3E836] p-1.5 rounded-full text-[#2C4A34]">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </span>
                                </Button>
                            </form>
                        ) : (
                            <form className="space-y-6 animate-fade-up" onSubmit={handleSignup}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Verification Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            max={6}
                                            placeholder="000000"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-16 text-center text-3xl tracking-[1rem] font-bold bg-gray-50 border-gray-200 focus:ring-primary/20"
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Didn't receive code? <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Go Back</button>
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full h-12 text-base rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg"
                                >
                                    {isLoading ? "Verifying..." : "Complete Signup"}
                                </Button>
                            </form>
                        )}

                        <div className="text-center text-sm font-medium text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline font-bold transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
