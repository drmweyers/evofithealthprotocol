import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useToast } from '../hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Activity, Shield, Users, Heart } from 'lucide-react';

// Login form schema with basic validation and remember me option
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await login(values);
      
      toast({
        title: 'Login successful',
        description: `Welcome back${user.email ? `, ${user.email}` : ''}!`,
      });

      // Clear form
      form.reset();

      // Navigate based on role
      switch (user.role) {
        case 'admin':
          navigate('/protocols'); // Admin goes to protocols page to access enhanced wizard
          break;
        case 'trainer':
          navigate('/trainer');
          break;
        case 'customer':
          navigate('/my-meal-plans');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear password field on error
      form.setValue('password', '');

      toast({
        title: 'Login failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Brand and Features */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col space-y-8 p-8"
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
                  Professional Health Management System
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
              <div className="p-2 bg-emerald-100 rounded-xl">
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
              <div className="p-2 bg-blue-100 rounded-xl">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Personalized Care</h3>
                <p className="text-gray-600">
                  Tailored health protocols designed for your unique wellness journey
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="p-2 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Expert Network</h3>
                <p className="text-gray-600">
                  Connect with certified trainers and health professionals
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
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
            <p className="text-gray-600">Professional Health Management</p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your health dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
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
                          <Input 
                            {...field}
                            type="email"
                            autoComplete="email"
                            placeholder="your.email@domain.com"
                            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-200"
                          />
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
                              {...field}
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="Enter your password"
                              className="h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-200"
                            />
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
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-2 border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-gray-600 cursor-pointer">
                              Remember me
                            </FormLabel>
                          </div>
                          <Link 
                            to="/forgot-password" 
                            className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>

              {/* Test Credentials Hint (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Test Credentials:</h4>
                  <div className="text-xs text-amber-700 space-y-1">
                    <p><strong>Admin:</strong> admin@fitmeal.pro / AdminPass123!</p>
                    <p><strong>Trainer:</strong> trainer.test@evofitmeals.com / TestTrainer123!</p>
                    <p><strong>Customer:</strong> customer.test@evofitmeals.com / TestCustomer123!</p>
                  </div>
                </motion.div>
              )}

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  New to EvoFit?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Create your account
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
              By signing in, you agree to our{' '}
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

export default LoginPage; 