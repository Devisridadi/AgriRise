import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Leaf, Save, X, Edit2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingParticles from "@/components/FloatingParticles";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        farming_type: "",
        experience_years: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFormData({
                name: parsedUser.name || "",
                phone: parsedUser.phone || "",
                address: parsedUser.address || "",
                farming_type: parsedUser.farming_type || "",
                experience_years: parsedUser.experience_years || ""
            });
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.id,
                    ...formData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Update failed");
            }

            // Successfully updated
            const updatedUser = { ...user, ...data.user, name: data.user.full_name };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#F2FCE2]/50 relative overflow-hidden">
            <FloatingParticles />

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="group mb-10 text-primary hover:text-white hover:bg-primary backdrop-blur-md bg-white/40 border border-primary/20 rounded-2xl px-6 py-6 transition-all duration-500 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    <div className="relative flex items-center">
                        <ArrowLeft size={22} className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                        <span className="font-bold uppercase tracking-[0.2em] text-xs">Return to Harvest</span>
                        <div className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:block hidden">
                            <Leaf size={24} className="text-white animate-sway" />
                        </div>
                    </div>
                </Button>
                <Card className="backdrop-blur-md bg-white/90 border-white/40 shadow-xl overflow-hidden animate-fade-up">
                    <div className="h-32 bg-primary relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center">
                                    <User size={40} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardHeader className="pt-16 pb-6 px-8 flex flex-row items-end justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary uppercase">Full Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="text-2xl font-serif font-bold h-12 bg-white"
                                    />
                                </div>
                            ) : (
                                <>
                                    <CardTitle className="text-3xl font-serif font-bold text-gray-900">{user.name}</CardTitle>
                                    <p className="text-muted-foreground">User ID: {user.id.substring(0, 8)}...</p>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <X size={18} className="mr-2" /> Cancel
                                    </Button>
                                    <Button
                                        disabled={isLoading}
                                        onClick={handleUpdate}
                                        className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg"
                                    >
                                        <Save size={18} className="mr-2" /> {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg"
                                >
                                    <Edit2 size={18} className="mr-2" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Leaf size={18} />
                                    </div>
                                    Basic Information
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Mail size={20} className="text-primary/60 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email Address</p>
                                            <p className="font-medium text-gray-400">{user.email} (Non-editable)</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Phone size={20} className="text-primary/60 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone Number</p>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                    className="mt-1 bg-white"
                                                />
                                            ) : (
                                                <p className="font-medium">{user.phone || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <MapPin size={20} className="text-primary/60 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</p>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="Enter your location"
                                                    className="mt-1 bg-white"
                                                />
                                            ) : (
                                                <p className="font-medium">{user.address || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Farming Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Briefcase size={18} />
                                    </div>
                                    Farming Details
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Leaf size={20} className="text-primary/60 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Farming Type</p>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.farming_type}
                                                    onChange={(e) => setFormData({ ...formData, farming_type: e.target.value })}
                                                    placeholder="e.g. Organic, Cattle"
                                                    className="mt-1 bg-white"
                                                />
                                            ) : (
                                                <p className="font-medium">{user.farming_type || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Calendar size={20} className="text-primary/60 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experience (Years)</p>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={formData.experience_years}
                                                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                                    placeholder="e.g. 5"
                                                    className="mt-1 bg-white"
                                                />
                                            ) : (
                                                <p className="font-medium">{user.experience_years ? `${user.experience_years} Years` : "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
