import { useState } from "react";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simple encryption simulation (in production, use proper authentication)
  const ADMIN_CREDENTIALS = {
    username: 'mymeds_admin',
    password: 'MyMeds2024!@#',
    adminCode: 'MM2024'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password &&
      credentials.adminCode === ADMIN_CREDENTIALS.adminCode
    ) {
      toast({
        title: "Access Granted",
        description: "Welcome to My Meds Admin Panel",
      });
      onLogin(true);
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials. Please check your username, password, and admin code.",
        variant: "destructive"
      });
      onLogin(false);
    }

    setIsLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pharmacy-secondary/20 to-pharmacy-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pharmacy-secondary/20 shadow-2xl">
        <CardHeader className="text-center bg-pharmacy-primary text-pharmacy-white rounded-t-lg">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8 text-pharmacy-white" />
            <CardTitle className="text-2xl text-pharmacy-white">Admin Access</CardTitle>
          </div>
          <p className="text-pharmacy-white/80">My Meds Pharmacy - Secure Portal</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pharmacy-dark mb-2">
                Admin Username *
              </label>
              <Input
                type="text"
                required
                value={credentials.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Enter admin username"
                className="border-pharmacy-secondary/30 focus:border-pharmacy-primary focus:ring-pharmacy-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pharmacy-dark mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  className="border-pharmacy-secondary/30 focus:border-pharmacy-primary focus:ring-pharmacy-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pharmacy-primary hover:text-pharmacy-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-pharmacy-dark mb-2">
                Admin Security Code *
              </label>
              <Input
                type="password"
                required
                value={credentials.adminCode}
                onChange={(e) => handleChange('adminCode', e.target.value)}
                placeholder="Enter security code"
                className="border-pharmacy-secondary/30 focus:border-pharmacy-primary focus:ring-pharmacy-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-pharmacy-primary hover:bg-pharmacy-accent text-pharmacy-white text-lg py-3 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pharmacy-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <div className="bg-pharmacy-secondary/10 p-3 rounded-lg">
              <p className="text-xs text-pharmacy-dark/70">
                🔒 Secure encrypted access for authorized staff only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};