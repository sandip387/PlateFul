import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
      console.log('Password reset email sent to:', email);
    }, 1000);
  };

  const handleResendEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Password reset email resent to:', email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover-lift">
            <img 
              src="/lovable-uploads/3eb505a2-d097-4c6c-b32c-4526e0a2aed2.png" 
              alt="Plateful" 
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="shadow-warm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isEmailSent 
                ? 'We\'ve sent a password reset link to your email address'
                : 'No worries! Enter your email and we\'ll send you reset instructions'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary border-0 shadow-warm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-foreground">{email}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Resending...</span>
                      </div>
                    ) : (
                      'Resend Email'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Still having trouble?
          </p>
          <Link to="/contact" className="text-sm text-primary hover:underline">
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;