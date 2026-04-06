import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, Home, ArrowRight } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";

const Logout = () => {
    const navigate = useNavigate();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const handleConfirmLogout = () => {
        localStorage.removeItem("user");
        setIsConfirmed(true);
    };

    useEffect(() => {
        if (isConfirmed) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate("/login");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isConfirmed, navigate]);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
            <FloatingParticles />

            <div className="relative z-10 w-full max-w-md px-4 animate-fade-up">
                <Card className="backdrop-blur-md bg-white/80 border-white/40 shadow-xl text-center">
                    {!isConfirmed ? (
                        <>
                            <CardHeader className="space-y-4 pb-2">
                                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                                    <LogOut className="w-8 h-8 text-amber-600 ml-1" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-800">
                                    Confirm Logout
                                </CardTitle>
                                <CardDescription className="text-gray-600 text-base">
                                    Are you sure you want to end your session?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <Button
                                    onClick={handleConfirmLogout}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg h-12"
                                >
                                    Yes, Log Out
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary text-primary rounded-xl h-12 font-semibold transition-all"
                                >
                                    Stay Logged In
                                </Button>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="space-y-4 pb-2">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <LogOut className="w-8 h-8 text-green-600 ml-1" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-800">
                                    Successfully Logged Out
                                </CardTitle>
                                <CardDescription className="text-gray-600 text-base">
                                    We hope to see you again soon!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <p className="text-sm text-gray-500">
                                    Redirecting to login page in <span className="font-bold text-green-600">{countdown}</span> seconds...
                                </p>

                                <div className="flex flex-col gap-3">
                                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white group" size="lg">
                                        <Link to="/login">
                                            Sign In Again
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>

                                    <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-50 text-green-700" size="lg">
                                        <Link to="/">
                                            <Home className="mr-2 w-4 h-4" />
                                            Return to Home
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500/80">
                        © 2024 AgriSense. Cultivating the future.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Logout;
