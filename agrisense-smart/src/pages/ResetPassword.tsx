import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Lock, ShieldCheck } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";
import { toast } from "sonner";
import { AUTH_ENDPOINTS } from "@/lib/api";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If email is not in state, user might have refreshed or come directly
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            toast.error("Invalid session. Please start again.");
            navigate("/forgot-password");
        }
    }, [location, navigate]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (otp.length < 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(AUTH_ENDPOINTS.RESET_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Password reset successfully! Please login.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F2FCE2]/50 p-4 md:p-6 lg:p-8 items-center justify-center relative overflow-hidden">
            <FloatingParticles />

            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 z-10 relative backdrop-blur-sm bg-white/90 animate-fade-up">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 text-2xl font-bold text-primary font-serif">
                                <Leaf className="h-8 w-8 text-primary" />
                                AgriML
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h2>
                        <p className="text-muted-foreground">
                            Enter the code sent to {email} and your new password.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleReset}>
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="h-14 text-center text-2xl tracking-[0.5rem] font-bold bg-gray-50 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-12 pl-10 bg-gray-50 border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-12 pl-10 bg-gray-50 border-gray-200"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <Link to="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center text-sm font-medium">
                            <ArrowLeft size={14} className="mr-1" />
                            Back to send code
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
