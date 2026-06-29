import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AlertCircle, Shield, Key, Phone, Users, ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useBranding } from '../hooks/useBranding';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../lib/api';
import { GoogleConfigContext } from '../App';
import { useContext } from 'react';

const ActiveGoogleLoginButton: React.FC<{
  onSuccess: (code: string) => void;
  onError: (error: any) => void;
  disabled: boolean;
}> = ({ onSuccess, onError, disabled }) => {
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.code),
    onError: (errorResponse) => onError(errorResponse)
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
      className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        <path fill="none" d="M1 1h22v22H1z" />
      </svg>
      Continue with Google
    </button>
  );
};

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get('tenant') || '';
  const { login, businesses , landingPageSettings, liveWebsiteState, restoreSession, superAdminUsers, mechanics } = useDatabase();
  const branding = useBranding();
  const { clientId, enabled, reason } = useContext(GoogleConfigContext);
  const [role, setRole] = useState<'admin' | 'mechanic'>('admin');
  
  // States
  const [tenantDomain, setTenantDomain] = useState(tenantParam.toUpperCase() || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [staffDomain, setStaffDomain] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [unlinkedGoogleData, setUnlinkedGoogleData] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Password Recovery States
  const [forgotFlow, setForgotFlow] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryOtpCode, setRecoveryOtpCode] = useState('');
  const [newRecoveryPass, setNewRecoveryPass] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleGoogleSuccess = async (code: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const apiRes = await api.loginWithGoogle(code);
      if (apiRes.success && apiRes.user?.isGoogleAuth) {
        const googleEmail = apiRes.user.email.toLowerCase();
        let matchedUser = null;

        // 1. Check Super Admin
        const isSuperAdmin = superAdminUsers.some(sa => sa.email.toLowerCase() === googleEmail && sa.status === 'Active');
        if (isSuperAdmin) {
          matchedUser = {
            name: apiRes.user.name,
            email: googleEmail,
            role: 'superadmin',
            tenantDomain: 'SYSTEM',
            profilePhoto: apiRes.user.picture
          };
        } else {
          // 2. Check Business Owners/Admins
          const matchedBusiness = businesses.find(b => b.email.toLowerCase() === googleEmail && (b.status === 'Active' || b.status === 'Trial' || b.status === 'Pending Payment'));
          if (matchedBusiness) {
            matchedUser = {
              name: apiRes.user.name,
              email: googleEmail,
              role: 'admin',
              tenantDomain: matchedBusiness.tenantDomain,
              businessId: matchedBusiness.id,
              profilePhoto: apiRes.user.picture
            };
          } else {
            // 3. Check Staff Users
            const matchedStaff = mechanics.find(m => m.email && m.email.toLowerCase() === googleEmail && m.loginAccessDisabled !== true);
            if (matchedStaff) {
               matchedUser = {
                 name: apiRes.user.name,
                 email: googleEmail,
                 role: 'mechanic',
                 mechanicId: matchedStaff.id,
                 tenantDomain: matchedStaff.tenantDomain,
                 profilePhoto: apiRes.user.picture
               };
            }
          }
        }

        if (matchedUser) {
          restoreSession(matchedUser);
          triggerToast(`Welcome, ${apiRes.user.name}!`);
          if (matchedUser.role === 'superadmin') {
            navigate('/super-admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setUnlinkedGoogleData(apiRes.user);
        }
      } else {
        setErrorMsg(apiRes.message || 'Backend auth failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Could not connect to MongoDB Backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse: any) => {
    console.error('Google Login Error:', errorResponse);
    setErrorMsg('Google login failed. Please check your configuration and try again.');
  };

  const handleGoogleLogin = () => {
    // This function is kept for backward compatibility if needed, 
    // but the actual button logic is now in ActiveGoogleLoginButton or the fallback button
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const user = login(tenantDomain, email, password);
        if (user) {
          if (user.role === 'superadmin') {
            triggerToast('Welcome back, Super Admin!');
            navigate('/super-admin');
          } else {
            triggerToast(`Welcome back, ${user.name || 'Admin'}!`);
            navigate('/dashboard');
          }
        } else {
          setErrorMsg('Invalid credentials. Check your Domain / Tenant Code, Username/Email, and Password.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };



  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setRecoveryStep(2);
      setLoading(false);
      triggerToast('Recovery code "5582" sent to your email!');
    }, 600);
  };

  const handleForgotVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      if (recoveryOtpCode === '5582') {
        setRecoveryStep(3);
      } else {
        setErrorMsg('Invalid verification code. Use 5582.');
      }
      setLoading(false);
    }, 500);
  };

  const handleForgotReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecoveryPass) return;
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      triggerToast('Password reset successfully! Log in now.');
      setForgotFlow(false);
      setRecoveryStep(1);
      setForgotEmail('');
      setRecoveryOtpCode('');
      setNewRecoveryPass('');
      setLoading(false);
    }, 600);
  };

  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      triggerToast('Simulated SMS OTP Code "4389" sent!');
    }, 600);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      if (otpCode === '4389') {
        const user = login('APEXAUTO', 'workshop_admin', 'Business@123');
        if (user && user.role === 'superadmin') {
          navigate('/super-admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg('Invalid OTP. Please enter 4389.');
      }
      setLoading(false);
    }, 600);
  };

  const handleMechanicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const user = login(staffDomain, staffUsername, staffPassword);
        if (user) {
          triggerToast(`Staff console loaded for ${user.name || 'Staff'}`);
          navigate('/dashboard');
        } else {
          setErrorMsg('Invalid credentials. Check your Domain / Tenant Code, Staff Username, and Password.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };


  if (landingPageSettings && !landingPageSettings.enableLogin && !location.search.includes('admin=true')) {
    return (
      <div className="bg-bg-app text-text-primary min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-bg-card border border-border-card rounded-2xl p-8 text-center relative z-10">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-white mb-2">Login Disabled</h2>
          <p className="text-text-secondary mb-6">Business login is temporarily disabled by the administrator.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-bold w-full">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (unlinkedGoogleData) {
    return (
      <div className="bg-bg-app text-text-primary min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="max-w-md w-full bg-bg-card border border-border-card rounded-2xl p-8 text-center relative z-10">
          <AlertCircle className="w-16 h-16 mx-auto text-brand-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Account Not Linked</h2>
          <p className="text-text-muted mb-6">
            Your Google account ({unlinkedGoogleData.email}) is not linked with any Zenwar account.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/register', { state: { googleData: unlinkedGoogleData } })}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-medium hover:brightness-110 transition-all shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]"
            >
              Register Business
            </button>
            <button
              onClick={() => setUnlinkedGoogleData(null)}
              className="w-full bg-bg-app border border-border-card text-text-primary py-3 rounded-xl font-medium hover:border-brand-primary transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-app min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute -top-1/4 -left-1/4 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 filter blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        {(() => {
          const currentDomainToMatch = role === 'admin' ? tenantDomain : staffDomain;
          const matchedShopForLogo = businesses.find(
            w => (w.tenantDomain || '').toUpperCase() === (currentDomainToMatch || '').trim().toUpperCase()
          );
        
          if (landingPageSettings && !landingPageSettings.enableLogin && !location.search.includes('admin=true')) {
            return (
              <div className="bg-bg-app text-text-primary min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
                <div className="max-w-md w-full bg-bg-card border border-border-card rounded-2xl p-8 text-center relative z-10">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold font-display text-white mb-2">Login Disabled</h2>
                  <p className="text-text-secondary mb-6">Business login is temporarily disabled by the administrator.</p>
                  <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-bold w-full">
                    Return to Home
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 overflow-hidden">
                <img 
                  src={branding.lightLogoUrl} 
                  alt="Zenwar" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <h2 className="text-2xl font-extrabold text-text-primary tracking-wide">
                {matchedShopForLogo ? matchedShopForLogo.name : 'Zenwar'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Smart Business &amp; Billing Management</p>
            </div>
          );
        })()}

        {/* Auth Panel */}
        <div className="glass-panel p-6 sm:p-8 border-border-card relative shadow-2xl">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/5 border border-border-card rounded-xl">
            <button
              onClick={() => { setRole('admin'); setErrorMsg(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <Shield size={14} /> Admin Hub
            </button>
            <button
              onClick={() => { setRole('mechanic'); setErrorMsg(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${role === 'mechanic' ? 'bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-text-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <Users size={14} /> Staff Terminal
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 whitespace-pre-wrap">
              {errorMsg}
            </div>
          )}

          {/* Admin Login View */}
          {role === 'admin' && (
            <div className="space-y-4">
              {/* Toggle Login Method */}
              {!otpSent ? (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Domain / Tenant Code</label>
                    <input
                      type="text"
                      value={tenantDomain}
                      onChange={e => setTenantDomain(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      placeholder="Domain / Tenant Code"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40 text-text-primary uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Admin Email or Username</label>
                    <input
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Admin Email or Username"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40 text-text-primary"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-text-secondary">Access Code / Password</label>
                      <button 
                        type="button"
                        onClick={() => { setForgotFlow(true); setRecoveryStep(1); setErrorMsg(''); }}
                        className="text-[10px] text-[var(--color-primary)] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Access Code / Password"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Booting Portal...' : 'Authenticate'}
                  </button>

                  {true && (
                    <>
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-border-card"></div>
                        <span className="flex-shrink mx-4 text-[10px] text-text-muted font-mono">OR</span>
                        <div className="flex-grow border-t border-border-card"></div>
                      </div>

                      {(() => {
                        const isGoogleAuthConfigured = Boolean(enabled && clientId && clientId.endsWith('.apps.googleusercontent.com'));

                        if (isGoogleAuthConfigured) {
                          return (
                            <ActiveGoogleLoginButton 
                              onSuccess={handleGoogleSuccess} 
                              onError={handleGoogleError} 
                              disabled={loading} 
                            />
                          );
                        }

                        // Fallback button for unconfigured state
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const errorMessage = reason 
                                ? `Google Sign-In is not configured correctly.\n\nReason:\n${reason}\n\nPlease contact the system administrator.` 
                                : 'Google Sign-In is not configured correctly.\n\nPlease contact the system administrator.';
                              setErrorMsg(errorMessage);
                            }}
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              <path fill="none" d="M1 1h22v22H1z" />
                            </svg>
                            Continue with Google
                          </button>
                        );
                      })()}
                    </>
                  )}
                </form>
              ) : null}

              {/* OTP Option */}
              {!otpSent ? (
                <form onSubmit={handleOtpRequest} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Mobile Phone (OTP Login)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full bg-bg-card border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white/5 hover:bg-hover-bg text-text-primary border border-border-card font-semibold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending Request...' : 'Send SMS OTP code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Enter Verification Code</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Type 4389 to mock verify"
                        className="w-full bg-bg-card border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40"
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-primary)] font-mono mt-1.5 block">Hint: Code is 4389</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 bg-white/5 hover:bg-hover-bg text-text-primary font-semibold py-3.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enter'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Forgot Password Flow View */}
          {forgotFlow && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Account Password Recovery</h3>
                <span className="text-[9px] font-mono text-[var(--color-primary)] font-semibold">STEP {recoveryStep} OF 3</span>
              </div>

              {recoveryStep === 1 && (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Enter Register Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="owner@apexauto.com"
                        className="w-full bg-bg-card border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] text-text-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setForgotFlow(false)}
                      className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg cursor-pointer"
                    >
                      {loading ? 'Sending...' : 'Send Recovery Code'}
                    </button>
                  </div>
                </form>
              )}

              {recoveryStep === 2 && (
                <form onSubmit={handleForgotVerify} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Email Verification Code</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="text"
                        required
                        maxLength={4}
                        value={recoveryOtpCode}
                        onChange={e => setRecoveryOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 4-digit code"
                        className="w-full bg-bg-card border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] text-text-primary font-mono text-center tracking-widest"
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-primary)] font-mono mt-1 block">Hint: Code is 5582</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setRecoveryStep(1)}
                      className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg cursor-pointer"
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              )}

              {recoveryStep === 3 && (
                <form onSubmit={handleForgotReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Enter New Password</label>
                    <input 
                      type="password"
                      required
                      value={newRecoveryPass}
                      onChange={e => setNewRecoveryPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] text-text-primary"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-text-primary font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Reset & Save Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mechanic / Staff Console View */}
          {role === 'mechanic' && (
            <form onSubmit={handleMechanicSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Domain / Tenant Code</label>
                <input
                  type="text"
                  value={staffDomain}
                  onChange={e => setStaffDomain(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="Domain / Tenant Code"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-secondary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40 text-text-primary uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Staff Username</label>
                <input
                  type="text"
                  value={staffUsername}
                  onChange={e => setStaffUsername(e.target.value)}
                  placeholder="Staff Username"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-secondary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-40 text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Staff Password</label>
                <input
                  type="password"
                  value={staffPassword}
                  onChange={e => setStaffPassword(e.target.value)}
                  placeholder="Access Code / Password"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-secondary)] transition-all text-text-primary"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border-card text-xs text-[var(--text-secondary)] space-y-2">
                <div className="flex justify-between">
                  <span>Selected Role:</span>
                  <span className="text-[var(--color-secondary)] font-semibold uppercase font-mono">STAFF ACCESS</span>
                </div>
                <div className="flex justify-between">
                  <span>Permissions:</span>
                  <span className="text-[var(--text-primary)]">View/Update Job checklist, change work progress</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Connecting Staff Link...' : 'Load Staff Dashboard'}
              </button>
            </form>
          )}
        </div>

        {/* Footer hints */}
        <p className="text-[10px] text-center text-text-muted mt-6 font-mono leading-relaxed">
          Tenant Admin: Domain: APEXAUTO, Username: workshop_admin, Password: Business@123 <br />
          Super Admin: Domain: SYSTEM, Username: zenwar_admin, Password: Smart@123 <br />
          Staff User: Domain: APEXAUTO, Username: staff_user, Password: Staff@123 <br />
          OTP Bypass Code: 4389 (Forgot Password OTP: 5582)
        </p>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <ShieldCheck size={16} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
