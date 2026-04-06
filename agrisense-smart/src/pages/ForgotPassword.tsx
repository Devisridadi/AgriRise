import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Send } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";
import { toast } from "sonner";
import { AUTH_ENDPOINTS } from "@/lib/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Reset code sent to your email!");

            // Navigate to reset password page with email in state
            navigate("/reset-password", { state: { email } });
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
                        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Login
                        </Link>
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 text-2xl font-bold text-primary font-serif">
                                <Leaf className="h-8 w-8 text-primary" />
                                AgriML
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Forgot Password?</h2>
                        <p className="text-muted-foreground">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRequestOtp}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
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

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-base rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Sending..." : (
                                <>
                                    <Send size={18} />
                                    Send Reset Code
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="text-primary hover:underline font-bold">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
