import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Shield, 
  Users, 
  Heart, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Dumbbell,
  CheckCircle,
  XCircle,
  Check
} from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'trainer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface InvitationData {
  customerEmail: string;
  trainerEmail: string;
  expiresAt: string;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

const RegisterPage = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, redirect] = useLocation();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isVerifyingInvitation, setIsVerifyingInvitation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });

  // Check for invitation token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invitation');
    
    if (token) {
      setInvitationToken(token);
      verifyInvitation(token);
    }
  }, []);

  const verifyInvitation = async (token: string) => {
    setIsVerifyingInvitation(true);
    try {
      const response = await fetch(`/api/invitations/verify/${token}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid invitation');
      }
      
      const data = await response.json();
      setInvitationData(data.data.invitation);
      
      // Pre-fill email and set role to customer
      form.setValue('email', data.data.invitation.customerEmail);
      form.setValue('role', 'customer');
      
      toast({
        title: "Invitation Verified",
        description: `You've been invited by ${data.data.invitation.trainerEmail}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Invalid Invitation",
        description: error.message,
        variant: "destructive",
      });
      setInvitationToken(null);
    } finally {
      setIsVerifyingInvitation(false);
    }
  };

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      if (invitationToken) {
        // Register via invitation
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: invitationToken,
            password: values.password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to accept invitation');
        }

        const data = await response.json();
        
        toast({
          title: 'Account Created Successfully',
          description: 'You can now log in with your new account.',
        });

        // Redirect to login page
        redirect('/login');
      } else {
        // Regular registration
        const { confirmPassword, ...registerData } = values;
        const user = await register(registerData);

        if (!user || !user.role) {
          throw new Error('Invalid user data received');
        }
        
        toast({
          title: 'Registration successful',
          description: 'Welcome to EvoFitMeals!',
        });

        // Navigate based on role
        switch (user.role) {
          case 'customer':
            redirect('/my-meal-plans');
            break;
          case 'trainer':
            redirect('/');
            break;
          default:
            console.warn('Unknown user role:', user.role);
            redirect('/');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'An error occurred during registration';
      
      if (error.message?.includes('User already exists')) {
        errorMessage = 'An account with this email already exists. Please login or use a different email.';
      } else if (error.message?.includes('Password must')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPassword = form.watch('password') || '';
  const passwordStrength = checkPasswordStrength(currentPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left side - Brand and Features */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col space-y-8 p-8 sticky top-8"
        >
          {/* Brand Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  EvoFit Health Protocol
                </h1>
                <p className="text-gray-600 text-lg">
                  Join the Future of Health Management
                </p>
              </div>
            </div>
          </div>

          {/* Feature Benefits */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Secure & Professional</h3>
                <p className="text-gray-600">
                  HIPAA-compliant health data management with enterprise-grade security
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-start space-x-4"
            >
              <div className="p-3 bg-blue-100 rounded-xl">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Personalized Health Plans</h3>
                <p className="text-gray-600">
                  AI-powered health protocols tailored to your unique wellness journey
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Expert Network</h3>
                <p className="text-gray-600">
                  Connect with certified trainers and health professionals worldwide
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ Users</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">HIPAA Compliant & ISO 27001 Certified</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                EvoFit Health Protocol
              </h1>
            </div>
            <p className="text-gray-600">Join the Future of Health Management</p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Start your personalized health journey today
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Invitation Info */}
              {invitationData && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      <strong>Trainer Invitation</strong><br />
                      You've been invited by <strong>{invitationData.trainerEmail}</strong> to join EvoFit Health Protocol.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Loading State for Invitation Verification */}
              {isVerifyingInvitation && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <AlertDescription className="text-blue-800">
                    Verifying invitation...
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="your.email@domain.com" 
                              type="email"
                              autoComplete="email"
                              disabled={!!invitationData}
                              {...field} 
                              className="h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              autoComplete="new-password"
                              placeholder="Create a strong password"
                              {...field} 
                              className="h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-200"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        
                        {/* Password Strength Indicator */}
                        {currentPassword && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                              <span className={`text-xs font-semibold ${
                                passwordStrength.score >= 4 ? 'text-emerald-600' : 
                                passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {passwordStrength.score >= 4 ? 'Strong' : 
                                 passwordStrength.score >= 3 ? 'Good' : 'Weak'}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`h-2 rounded-full ${
                                    i < passwordStrength.score 
                                      ? passwordStrength.score >= 4 ? 'bg-emerald-500' :
                                        passwordStrength.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                      : 'bg-gray-200'
                                  }`} 
                                />
                              ))}
                            </div>
                            <div className="space-y-1">
                              {Object.entries({
                                length: 'At least 8 characters',
                                uppercase: 'One uppercase letter',
                                lowercase: 'One lowercase letter', 
                                number: 'One number',
                                special: 'One special character'
                              }).map(([key, label]) => (
                                <div key={key} className="flex items-center space-x-2">
                                  {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-gray-300" />
                                  )}
                                  <span className={`text-xs ${
                                    passwordStrength.checks[key as keyof typeof passwordStrength.checks] 
                                      ? 'text-emerald-600' : 'text-gray-500'
                                  }`}>
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              autoComplete="new-password"
                              placeholder="Confirm your password"
                              {...field} 
                              className="h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-200"
                            />
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Account Type
                        </FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!!invitationData}
                          >
                            <SelectTrigger className="h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                              <SelectValue placeholder="Choose your account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">
                                <div className="flex items-center space-x-3">
                                  <Heart className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">Customer</div>
                                    <div className="text-xs text-gray-500">Looking for health protocols</div>
                                  </div>
                                </div>
                              </SelectItem>
                              {!invitationData && (
                                <SelectItem value="trainer">
                                  <div className="flex items-center space-x-3">
                                    <Dumbbell className="h-4 w-4 text-emerald-600" />
                                    <div>
                                      <div className="font-medium">Trainer</div>
                                      <div className="text-xs text-gray-500">Creating health protocols</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <User className="h-5 w-5 mr-2" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-gray-700 hover:text-gray-900 transition-colors underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-gray-700 hover:text-gray-900 transition-colors underline">
                Privacy Policy
              </a>
            </p>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;