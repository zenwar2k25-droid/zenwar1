import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  UserCheck, 
  Rocket, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Users, 
  FileSpreadsheet,
  AlertCircle,
  Package,
  CreditCard,
  Sparkles,
  Smartphone,
  Landmark,
  CheckCircle2,
  RotateCcw,
  Sliders,
  QrCode,
  Eye,
  EyeOff,
  LogIn,
  Copy
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useBranding } from '../hooks/useBranding';

const logoEmojis = ['🏎️', '🏍️', '🛠️', '🔌', '🔥', '⚡', '⚙️', '🏎', '🚘', '🚙', '🚛', '🔧'];
const colorPresets = [
  { name: 'Cyan Streak', value: '#00f0ff' },
  { name: 'Veloce Violet', value: '#8b5cf6' },
  { name: 'Octane Orange', value: '#ff5e00' },
  { name: 'Emerald Drive', value: '#10b981' },
  { name: 'Boost Pink', value: '#ec4899' }
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData;

  React.useEffect(() => {
    if (googleData) {
      setFormData(prev => ({
        ...prev,
        name: googleData.name || prev.name,
        email: googleData.email || prev.email,
      }));
    }
  }, [googleData]);
  const [searchParams] = useSearchParams();
  const { subscriptionPlans, businesses, addWorkshop, saPaymentSettings, addSaPayment, addPendingRegistration, updatePendingRegistrationStatus , landingPageSettings, completeRegistrationPayment } = useDatabase();
  const branding = useBranding();

  const platformUpi = saPaymentSettings?.upiId || 'zenwar@upi';

  const planParam = searchParams.get('plan') || 'starter';
  const initialPlan = subscriptionPlans.find(p => p.id === planParam) || subscriptionPlans[0];

  const [step, setStep] = useState(1);
  const [onboardingType, setOnboardingType] = useState<'trial' | 'paid'>('trial');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [subscriptionDuration, setSubscriptionDuration] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '🛠️',
    brandColor: '#00f0ff',
    tenantDomain: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'razorpay' | 'card' | 'netbanking'>('upi');
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string>('');
  const [paymentState, setPaymentState] = useState<'idle' | 'verifying' | 'success' | 'failed' | 'pending_verification' | 'credentials'>('idle');
  const [simulatedCard, setSimulatedCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkoutLogs, setCheckoutLogs] = useState<string[]>([]);

  // Auto-generate tenant domain code from business name
  useEffect(() => {
    if (step === 3 && formData.name && !formData.tenantDomain) {
      const generated = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 15);
      setFormData(prev => ({ ...prev, tenantDomain: generated }));
    }
  }, [formData.name, step]);

  // Real-time tenant domain availability check
  useEffect(() => {
    if (formData.tenantDomain) {
      setDomainStatus('checking');
      const delayDebounce = setTimeout(() => {
        const uppercaseDomain = formData.tenantDomain.trim().toUpperCase();
        if (uppercaseDomain === 'SYSTEM' || uppercaseDomain === 'ADMIN') {
          setDomainStatus('taken');
        } else {
          const exists = businesses.some(w => w.tenantDomain.toUpperCase() === uppercaseDomain);
          setDomainStatus(exists ? 'taken' : 'available');
        }
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setDomainStatus('idle');
    }
  }, [formData.tenantDomain, businesses]);

  const validateStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!selectedPlan) {
        setErrorMsg('Please select a subscription plan.');
        return false;
      }
    } else if (step === 2) {
      if (!onboardingType) {
        setErrorMsg('Please select an onboarding option.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.name || !formData.phone || !formData.email || !formData.address) {
        setErrorMsg('Please populate all business details.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMsg('Please specify a valid email address.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.tenantDomain) {
        setErrorMsg('Please create a workspace domain code.');
        return false;
      }
      if (domainStatus === 'taken') {
        setErrorMsg('This tenant code is already in use. Try a different variation.');
        return false;
      }
      if (domainStatus !== 'available') {
        setErrorMsg('Checking domain status. Please wait.');
        return false;
      }
    } else if (step === 5) {
      if (!formData.username || !formData.password || !formData.confirmPassword) {
        setErrorMsg('Please fill out account credentials.');
        return false;
      }
      if (formData.password.length < 6) {
        setErrorMsg('Password should be at least 6 characters long.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const getPlanPrice = () => {
    const base = billingPeriod === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
    const setup = selectedPlan.setupFee || 0;
    const taxRate = selectedPlan.taxPercentage !== undefined ? selectedPlan.taxPercentage : (saPaymentSettings?.taxRatePercent ?? 18);
    const subtotal = base + setup;
    const tax = Math.round(subtotal * (taxRate / 100));
    return subtotal + tax;
  };

  // Build UPI deep link and QR URL
  const calculatedPrice = getPlanPrice();
  const upiUrl = `upi://pay?pa=${platformUpi}&pn=Zenwar&am=${calculatedPrice}&cu=INR&tn=${encodeURIComponent(`${selectedPlan.name} Subscription`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyCredentials = () => {
    const text = `Workspace URL: http://localhost:5173/#/login?tenant=${formData.tenantDomain.toUpperCase()}\nUsername: ${formData.username}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeActivation = () => { return; };

  const startSimulation = (status: 'success' | 'fail' | 'pending') => {
    setPaymentState('verifying');
    setCheckoutLogs([]);
    
    const logsList = [
      '[SECURE GATEWAY] Initializing checkout handshake...',
      '[SECURE GATEWAY] Running fraud detection engine...',
      '[FRAUD CHECK] IP reputation lookup: 100/100 (PASSED)',
      '[FRAUD CHECK] Email syntax & risk validation: (PASSED)',
      '[DUPLICATE PREVENT] Scanning active pool for duplicate domain: (PASSED)',
      '[SESSION GATE] Checking payment link lease timeout (5m validity): (PASSED)'
    ];

    let currentLogIdx = 0;
    const addNextLog = () => {
      if (currentLogIdx < logsList.length) {
        setCheckoutLogs(prev => [...prev, logsList[currentLogIdx]]);
        currentLogIdx++;
        setTimeout(addNextLog, 200);
      } else {
        if (status === 'success') {
          setTimeout(simulateSuccessScenario, 250);
        } else if (status === 'fail') {
          setTimeout(simulateFailureScenario, 250);
        } else {
          setTimeout(simulatePendingScenario, 250);
        }
      }
    };
    
    setTimeout(addNextLog, 100);
  };

  const simulateSuccessScenario = () => {
    const logsList = [
      '[QR POLLING] Initiating live transaction validation loop...',
      '[QR POLLING] Ping 1: Status = pending_payment',
      '[QR POLLING] Ping 2: Status = pending_payment',
      '[WEBHOOK] Webhook received from Razorpay (event: payment.captured)',
      '[WEBHOOK] Verifying x-razorpay-signature header...',
      '[WEBHOOK] Signature match: SUCCESS (HMAC-SHA256 authenticated)',
      '[DATABASE] Authorizing registration request payload...',
      '[DATABASE] Moving request to pending approval state...',
      '[LAUNCHER] Success! Payment verified and request submitted to Super Admin.'
    ];

    let currentLogIdx = 0;
    const addNextLog = () => {
      if (currentLogIdx < logsList.length) {
        setCheckoutLogs(prev => [...prev, logsList[currentLogIdx]]);
        currentLogIdx++;
        setTimeout(addNextLog, 200);
      } else {
        setPaymentState('success');
        if (currentRegistrationId) completeRegistrationPayment(currentRegistrationId);
        setTimeout(() => {
          setPaymentState('credentials');
        }, 1200);
      }
    };
    
    addNextLog();
  };

  const simulateFailureScenario = () => {
    const logsList = [
      '[QR POLLING] Initiating live transaction validation loop...',
      '[QR POLLING] Ping 1: Status = pending_payment',
      '[WEBHOOK] Webhook received from Razorpay (event: payment.failed)',
      '[WEBHOOK] Reason: Card Issuer declined transaction (insufficient_funds)',
      '[DATABASE] Warning: activeTenantCreation aborted. Rolling back tempRegistration...'
    ];

    let currentLogIdx = 0;
    const addNextLog = () => {
      if (currentLogIdx < logsList.length) {
        setCheckoutLogs(prev => [...prev, logsList[currentLogIdx]]);
        currentLogIdx++;
        setTimeout(addNextLog, 200);
      } else {
        if (currentRegistrationId) updatePendingRegistrationStatus(currentRegistrationId, 'FAILED');
        setPaymentState('failed');
      }
    };
    
    addNextLog();
  };

  const simulatePendingScenario = () => {
    const logsList = [
      '[QR POLLING] Initiating live transaction validation loop...',
      '[QR POLLING] Ping 1: Status = pending_payment',
      '[QR POLLING] Ping 2: Status = pending_payment',
      '[SESSION GATE] Lease timer limit reached or webhook pending clearance...',
      '[DATABASE] Action deferred. Temporary registration state stored in memory.',
      '[PORTAL] Redirecting to pending checkout portal view.'
    ];

    let currentLogIdx = 0;
    const addNextLog = () => {
      if (currentLogIdx < logsList.length) {
        setCheckoutLogs(prev => [...prev, logsList[currentLogIdx]]);
        currentLogIdx++;
        setTimeout(addNextLog, 200);
      } else {
        setPaymentState('pending_verification');
      }
    };
    
    addNextLog();
  };

  const handleSimulatePaymentSuccess = () => startSimulation('success');
  const handleSimulatePaymentFailure = () => startSimulation('fail');
  const handleSimulatePendingVerification = () => startSimulation('pending');

  
  if (landingPageSettings && !landingPageSettings.enableRegistration) {
    return (
      <div className="bg-bg-app text-text-primary min-h-screen flex flex-col justify-center items-center py-12 px-6 font-sans relative overflow-hidden">
        <div className="max-w-md w-full bg-bg-card border border-border-card rounded-2xl p-8 text-center relative z-10">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-white mb-2">Registration Disabled</h2>
          <p className="text-text-secondary mb-6">Business registration is currently unavailable. Please check back later or contact support.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-bold w-full">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const stepsData = [
    { title: 'Plan', icon: Package },
    { title: 'Duration', icon: Sliders },
    { title: 'Profile', icon: Building2 },
    { title: 'URL', icon: Globe },
    { title: 'Account', icon: UserCheck },
    { title: 'Launch', icon: Rocket }
  ];

  return (
    <div className="bg-bg-app text-text-primary min-h-screen flex flex-col justify-center items-center py-12 px-6 font-sans relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Neon Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/5 filter blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 cursor-pointer relative z-10" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
          <img 
            src={branding.lightLogoUrl} 
            alt="Zenwar" 
            className="w-full h-full object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <span className="font-bold text-xl tracking-wider">Zenwar</span>
      </div>

      <div className="w-full max-w-4xl glass-panel p-8 rounded-2xl relative z-10 border-border-card shadow-2xl">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 relative max-w-2xl mx-auto">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (stepsData.length - 1)) * 100}%` }}
          />

          {stepsData.map((item, index) => {
            const Icon = item.icon;
            const isActive = step >= index + 1;
            const isCurrent = step === index + 1;
            return (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-cyan-400 to-violet-500 border-none text-text-primary shadow-lg shadow-cyan-500/20' 
                      : 'bg-[#10121d] border-border-card text-text-muted'
                  } ${isCurrent ? 'ring-2 ring-cyan-400 ring-offset-4 ring-offset-[#08090d]' : ''}`}
                >
                  <Icon size={14} />
                </div>
                <span className={`text-[9px] font-bold mt-1.5 uppercase tracking-widest ${isActive ? 'text-cyan-400' : 'text-text-muted'} hidden sm:block`}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs max-w-xl mx-auto"
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Wizard Form Content */}
        <div className="min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Select Plan */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 border-b border-border-card pb-4">
                  <h4 className="text-xl font-bold text-text-primary">Select Your Platform Plan</h4>
                  <p className="text-text-secondary text-xs">Choose the roadmap corresponding to your business scale.</p>
                  
                  {/* Period Toggle Switch */}
                  <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-border-card mt-2">
                    <button 
                      type="button"
                      onClick={() => setBillingPeriod('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${billingPeriod === 'monthly' ? 'bg-cyan-400 text-black' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Monthly Billing
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBillingPeriod('yearly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'bg-cyan-400 text-black' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Yearly Billing <span className="bg-violet-600 text-text-primary font-mono text-[9px] px-1 py-0.5 rounded font-extrabold">-20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {subscriptionPlans.filter(p => p.enabled && !p.archived).map((plan) => {
                    const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                    const periodLabel = billingPeriod === 'monthly' ? 'month' : 'year';
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`glass-panel p-5 cursor-pointer border transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(0,240,255,0.05)] ${isSelected ? 'border-cyan-400 bg-cyan-950/5 shadow-lg shadow-cyan-500/5' : 'border-border-card'}`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-extrabold text-sm text-text-primary">{plan.name}</h3>
                              {plan.badge && (
                                <span className="inline-block bg-violet-600/30 text-violet-400 border border-violet-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase font-mono">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'}`}>
                              {isSelected && <Check size={10} className="font-extrabold" />}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-xl font-extrabold text-text-primary font-mono">₹{price.toLocaleString()}</div>
                            <div className="text-[10px] text-text-muted uppercase tracking-widest font-mono">per {periodLabel}</div>
                          </div>

                          <hr className="border-border-card" />

                          <ul className="text-xs text-text-secondary space-y-2">
                            {plan.features.slice(0, 5).map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Check size={12} className="text-cyan-400 shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-5 mt-auto">
                          <button
                            type="button"
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isSelected ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-transparent text-text-primary border-border-card hover:border-white/20'}`}
                          >
                            {isSelected ? 'Plan Selected' : 'Choose Plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Choose Free Trial or Paid */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto"
              >
                <div className="text-center space-y-2 border-b border-border-card pb-4">
                  <h4 className="text-xl font-bold text-text-primary">Choose Your Onboarding Option</h4>
                  <p className="text-text-secondary text-xs">Start risk-free or unlock instant full parameters now.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Trial Option */}
                  <div 
                    onClick={() => setOnboardingType('trial')}
                    className={`glass-panel p-5 cursor-pointer border transition-all flex items-start gap-4 hover:border-border-card ${onboardingType === 'trial' ? 'border-cyan-400 bg-cyan-950/5' : 'border-border-card'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Cpu size={20} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-text-primary">Start {selectedPlan.trialDays} Days Free Trial</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${onboardingType === 'trial' ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'}`}>
                          {onboardingType === 'trial' && <Check size={10} className="font-extrabold" />}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Try the {selectedPlan.name} features free for {selectedPlan.trialDays} days. Limit capped to {selectedPlan.maxInvoices} invoices and standard storage parameters. No card required.
                      </p>
                    </div>
                  </div>

                  {/* Direct Paid Option */}
                  <div 
                    onClick={() => setOnboardingType('paid')}
                    className={`glass-panel p-5 cursor-pointer border transition-all flex items-start gap-4 hover:border-border-card ${onboardingType === 'paid' ? 'border-cyan-400 bg-cyan-950/5' : 'border-border-card'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-text-primary">Direct Paid Subscription</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${onboardingType === 'paid' ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'}`}>
                          {onboardingType === 'paid' && <Check size={10} className="font-extrabold" />}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Skip trial caps. Activate instant whitelabeling, priority API integrations, maximum SMS/WhatsApp notification credits, and dedicated data backup routines.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-xs text-cyan-400 text-center">
                  {onboardingType === 'trial' ? (
                    <span>You will receive <strong>{selectedPlan.trialDays} days free trial</strong> for <strong>{selectedPlan.name}</strong></span>
                  ) : (
                    <span>Selected: <strong>{selectedPlan.name}</strong> ({billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}) - Total Payment: <strong>₹{calculatedPrice.toLocaleString()}</strong></span>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Business Profile Details */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="border-b border-border-card pb-2 mb-4">
                  <h4 className="text-lg font-bold text-text-primary">Business Identity</h4>
                  <p className="text-text-secondary text-xs">Tell us about your business branding and base profile details.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Business Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Apex Auto Center"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Owner Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Official Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@apexauto.com"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Business Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Auto Grid Road, Block 4, NY"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                </div>

                {/* Logo & Color Selection */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary block">Workspace Emoji Logo</label>
                    <div className="flex flex-wrap gap-2">
                      {logoEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, logoUrl: emoji })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border cursor-pointer ${
                            formData.logoUrl === emoji 
                              ? 'bg-cyan-500/20 border-cyan-400 scale-105' 
                              : 'bg-[#10121d] border-border-card hover:border-border-card'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary block">Brand Focus Accent Color</label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {colorPresets.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, brandColor: preset.value })}
                          className={`w-6 h-6 rounded-full transition-all border-2 relative cursor-pointer ${
                            formData.brandColor === preset.value
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: preset.value }}
                          title={preset.name}
                        >
                          {formData.brandColor === preset.value && (
                            <Check size={10} className="text-black absolute inset-0 m-auto font-bold" />
                          )}
                        </button>
                      ))}
                      <input 
                        type="color"
                        value={formData.brandColor}
                        onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border border-border-card cursor-pointer p-0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Tenant Domain setup */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b border-border-card pb-2">
                  <h4 className="text-lg font-bold text-text-primary">Create Tenant URL</h4>
                  <p className="text-text-secondary text-xs">This unique subdomain identifier separates your database partition securely.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary block">Workspace Tenant Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.tenantDomain}
                      onChange={e => setFormData({ ...formData, tenantDomain: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                      placeholder="APEXAUTO"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono tracking-widest text-text-primary"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      {domainStatus === 'checking' && (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      )}
                      {domainStatus === 'available' && (
                        <Check size={18} className="text-emerald-400" />
                      )}
                      {domainStatus === 'taken' && (
                        <X size={18} className="text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtext display URL */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-border-card">
                  <div className="text-xs text-text-secondary">Your secure login URL will be:</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono mt-1 break-all select-all">
                    https://zenwar.co/login?tenant={formData.tenantDomain || 'YOUR_CODE'}
                  </div>
                </div>

                <div className="text-xs leading-relaxed space-y-2">
                  {domainStatus === 'available' && (
                    <p className="text-emerald-400 flex items-center gap-1.5">
                      ✓ Workspace URL is available! Looks fast and clean.
                    </p>
                  )}
                  {domainStatus === 'taken' && (
                    <p className="text-red-400 flex items-center gap-1.5">
                      ⚠ This tenant domain code is already taken. Try adding a city suffix or abbreviation.
                    </p>
                  )}
                  <p className="text-text-muted">
                    * This code must be unique, alphanumeric (A-Z, 0-9), and should represent your brand. Your staff will use this code to log in.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Administrator Account Settings */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="border-b border-border-card pb-2 mb-4">
                  <h4 className="text-lg font-bold text-text-primary">Administrator Credentials</h4>
                  <p className="text-text-secondary text-xs">Create the owner account credential for initial workspace setup.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Admin Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="workshop_admin"
                    className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Master Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#10121d] border border-border-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-all text-text-primary"
                    />
                  </div>
                </div>

                <div className="text-xs text-text-muted flex gap-2 pt-2">
                  <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                  <span>Passwords must be at least 6 characters. Do not share credentials. This account holds master access to all billing and staff panels.</span>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Secure Payment Checkout OR Trial Launch Summary */}
            {step === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative min-h-[380px]"
              >
                {paymentState === 'idle' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        
                        {/* Payment Selection Tabs */}
                        <div className="lg:col-span-2 space-y-2 flex flex-col">
                          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-1">Select Payment Method</span>
                          
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('upi')}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${selectedPaymentMethod === 'upi' ? 'bg-cyan-950/20 border-cyan-400 text-text-primary' : 'bg-transparent border-border-card text-text-secondary hover:border-border-card'}`}
                          >
                            <QrCode size={16} className={selectedPaymentMethod === 'upi' ? 'text-cyan-400' : 'text-text-muted'} />
                            <div className="flex-1">
                              <div>UPI ID / QR Scanner</div>
                              <div className="text-[9px] font-light text-text-muted">GooglePay, PhonePe, Paytm</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('card')}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${selectedPaymentMethod === 'card' ? 'bg-cyan-950/20 border-cyan-400 text-text-primary' : 'bg-transparent border-border-card text-text-secondary hover:border-border-card'}`}
                          >
                            <CreditCard size={16} className={selectedPaymentMethod === 'card' ? 'text-cyan-400' : 'text-text-muted'} />
                            <div className="flex-1">
                              <div>Credit / Debit Cards</div>
                              <div className="text-[9px] font-light text-text-muted">Visa, MasterCard, RuPay</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('netbanking')}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${selectedPaymentMethod === 'netbanking' ? 'bg-cyan-950/20 border-cyan-400 text-text-primary' : 'bg-transparent border-border-card text-text-secondary hover:border-border-card'}`}
                          >
                            <Landmark size={16} className={selectedPaymentMethod === 'netbanking' ? 'text-cyan-400' : 'text-text-muted'} />
                            <div className="flex-1">
                              <div>Net Banking</div>
                              <div className="text-[9px] font-light text-text-muted">SBI, HDFC, ICICI, Axis</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('razorpay')}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${selectedPaymentMethod === 'razorpay' ? 'bg-cyan-950/20 border-cyan-400 text-text-primary' : 'bg-transparent border-border-card text-text-secondary hover:border-border-card'}`}
                          >
                            <Smartphone size={16} className={selectedPaymentMethod === 'razorpay' ? 'text-cyan-400' : 'text-text-muted'} />
                            <div className="flex-1">
                              <div>Razorpay Iframe</div>
                              <div className="text-[9px] font-light text-text-muted">Standard Card / Wallet API</div>
                            </div>
                          </button>
                        </div>

                        {/* Interactive Checkout Forms / Dynamic QR */}
                        <div className="lg:col-span-3 glass-panel p-5 border-border-card flex flex-col justify-between">
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-border-card pb-2">
                              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                {selectedPaymentMethod === 'upi' && 'Scan UPI QR Code'}
                                {selectedPaymentMethod === 'card' && 'Enter Card Details'}
                                {selectedPaymentMethod === 'netbanking' && 'Choose Your Bank'}
                                {selectedPaymentMethod === 'razorpay' && 'Razorpay Security Iframe'}
                              </span>
                              <span className="text-xs text-emerald-400 font-mono font-bold">₹{calculatedPrice.toLocaleString()}</span>
                            </div>

                            {/* UPI Panel - Dynamic QR */}
                            {selectedPaymentMethod === 'upi' && (
                              <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                                <div className="relative w-36 h-36 border border-border-card rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shrink-0 group">
                                  {/* glowing scanner laser line */}
                                  <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_cyan] animate-[scan_2s_linear_infinite]" />
                                  <img src={qrCodeUrl} className="w-full h-full object-contain" alt="UPI QR" />
                                </div>
                                <div className="space-y-1.5 text-xs text-text-secondary">
                                  <div className="text-text-primary font-bold">{selectedPlan.name}</div>
                                  <div>Amount: <strong className="text-text-primary">₹{calculatedPrice.toLocaleString()}</strong> ({billingPeriod})</div>
                                  <div className="text-[10px] text-text-muted">Scan using any UPI App (GPay, PhonePe, Bhim, Paytm). Activation will trigger immediately upon verification confirmation.</div>
                                </div>
                              </div>
                            )}

                            {/* Card Panel */}
                            {selectedPaymentMethod === 'card' && (
                              <div className="space-y-3 text-left">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-text-muted uppercase">Cardholder Name</label>
                                  <input 
                                    type="text" 
                                    value={simulatedCard.name}
                                    onChange={e => setSimulatedCard({ ...simulatedCard, name: e.target.value })}
                                    placeholder="Steven Austin" 
                                    className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-text-muted uppercase">Card Number</label>
                                  <input 
                                    type="text" 
                                    value={simulatedCard.number}
                                    onChange={e => setSimulatedCard({ ...simulatedCard, number: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                                    placeholder="4111 2222 3333 4444" 
                                    className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none font-mono"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-text-muted uppercase">Expiry Date</label>
                                    <input 
                                      type="text" 
                                      value={simulatedCard.expiry}
                                      onChange={e => setSimulatedCard({ ...simulatedCard, expiry: e.target.value })}
                                      placeholder="MM/YY" 
                                      className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none font-mono"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-text-muted uppercase">CVV Code</label>
                                    <input 
                                      type="password" 
                                      maxLength={3}
                                      value={simulatedCard.cvv}
                                      onChange={e => setSimulatedCard({ ...simulatedCard, cvv: e.target.value })}
                                      placeholder="•••" 
                                      className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Net Banking */}
                            {selectedPaymentMethod === 'netbanking' && (
                              <div className="space-y-3 text-left">
                                <label className="text-[10px] text-text-muted uppercase">Select Bank Option</label>
                                <select
                                  value={selectedBank}
                                  onChange={e => setSelectedBank(e.target.value)}
                                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                                >
                                  <option value="SBI">State Bank of India (SBI)</option>
                                  <option value="HDFC">HDFC Bank</option>
                                  <option value="ICICI">ICICI Bank</option>
                                  <option value="AXIS">Axis Bank</option>
                                  <option value="KOTAK">Kotak Mahindra Bank</option>
                                </select>
                                <div className="text-[10px] text-text-muted font-mono">You will be redirected to the secure bank portal simulation checkout.</div>
                              </div>
                            )}

                            {/* Razorpay Mock */}
                            {selectedPaymentMethod === 'razorpay' && (
                              <div className="p-4 border border-cyan-500/20 bg-cyan-950/5 rounded-xl text-xs space-y-2 text-text-secondary text-left">
                                <div className="font-bold text-text-primary flex items-center gap-1.5">
                                  <ShieldCheck size={14} className="text-cyan-400" /> Razorpay Integrated Checkout Panel
                                </div>
                                <p>Standard overlay dialog frame. Fully responsive checkout mapping card/netbanking/wallets directly linked to Platform Super Admin.</p>
                              </div>
                            )}
                          </div>

                          {/* Simulation Control Triggers */}
                          <div className="pt-5 border-t border-border-card">
                            <span className="text-[9px] font-bold text-text-muted uppercase block mb-2 text-left">Onboarding Payment Sandbox Simulators</span>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={handleSimulatePaymentSuccess}
                                className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px] cursor-pointer transition-all active:scale-95"
                              >
                                Simulate Success
                              </button>
                              <button
                                type="button"
                                onClick={handleSimulatePaymentFailure}
                                className="py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold text-[10px] cursor-pointer transition-all active:scale-95"
                              >
                                Simulate Fail
                              </button>
                              <button
                                type="button"
                                onClick={handleSimulatePendingVerification}
                                className="py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400 font-bold text-[10px] cursor-pointer transition-all active:scale-95"
                              >
                                Simulate Pending
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                  </>
                )}

            {/* PAYMENT STATES OVERLAY ANIMATIONS */}
            {paymentState !== 'idle' && (
                      <div className="absolute inset-0 bg-bg-app/95 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200 z-20">
                        {/* 1. Verifying status loader */}
                        {paymentState === 'verifying' && (
                          <div className="text-center space-y-4 max-w-md w-full px-6">
                            <div className="relative w-14 h-14 mx-auto">
                              <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
                              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm text-text-primary tracking-wide">Secure Transaction Gatekeeper</h3>
                              <p className="text-[10px] text-cyan-400 font-mono">ENCRYPTED GATEWAY // TLS 1.3</p>
                            </div>
                            
                            {/* Security Console Logs */}
                            <div className="bg-black/50 border border-border-card rounded-xl p-3.5 text-left font-mono text-[9px] text-text-secondary space-y-1 max-h-36 overflow-y-auto">
                              {checkoutLogs.map((log, idx) => (
                                <div key={idx} className="flex gap-1.5">
                                  <span className="text-cyan-500 shrink-0">&gt;</span>
                                  <span className={log.includes('PASSED') || log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('WARNING') || log.includes('EXPIRED') ? 'text-yellow-500' : 'text-text-secondary'}>{log}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Success screen */}
                        {paymentState === 'success' && (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                              <CheckCircle2 size={36} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-emerald-400">Payment Verified Successfully</h3>
                              <p className="text-xs text-text-muted font-mono mt-1">Tenant registration authorized. Initializing workspace environment...</p>
                            </div>
                          </div>
                        )}

                        {/* 3. Failed screen */}
                        {paymentState === 'failed' && (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 text-3xl mx-auto shadow-lg shadow-red-500/10 animate-shake">
                              <X size={36} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-red-400">Payment Verification Failed</h3>
                              <p className="text-xs text-text-muted font-mono mt-1">Transaction authentication failed or was declined by card issuer.</p>
                            </div>
                            <button
                              onClick={() => setPaymentState('idle')}
                              className="px-4 py-2 bg-white/5 border border-border-card hover:bg-hover-bg text-text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <RotateCcw size={12} /> Try Checkout Again
                            </button>
                          </div>
                        )}

                        {/* 4. Pending Verification loader */}
                        {paymentState === 'pending_verification' && (
                          <div className="text-center space-y-4">
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                              <div className="absolute inset-0 border-4 border-dashed border-yellow-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                              <Smartphone size={24} className="text-yellow-400 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-yellow-400">Pending Verification Status</h3>
                              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed mt-1">
                                UPI Transaction initialized. Open your UPI mobile app to complete the ₹{calculatedPrice} billing.
                              </p>
                              <p className="text-[10px] text-text-muted font-mono mt-1">Automatically checks for validation every 5s</p>
                            </div>
                            <div className="flex gap-3 justify-center pt-2">
                              <button
                                onClick={handleSimulatePaymentSuccess}
                                className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Simulate Success Confirmation
                              </button>
                              <button
                                onClick={() => setPaymentState('idle')}
                                className="px-3.5 py-1.5 bg-white/5 border border-border-card text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 5. Master Credentials Screen */}
                        {paymentState === 'credentials' && (
                          <div className="text-center space-y-6 max-w-md w-full px-6 py-4 animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                              <CheckCircle2 size={36} />
                            </div>
                            
                            <div className="space-y-1.5">
                              <h3 className="font-extrabold text-xl text-text-primary font-display">Provisioning Complete!</h3>
                              <p className="text-xs text-text-secondary">Your workspace is active. Store your master credentials safely.</p>
                            </div>

                            {/* Credentials detail block */}
                            <div className="glass-panel p-5 border-border-card bg-bg-card/80 text-left space-y-3.5 relative overflow-hidden rounded-xl">
                              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/5 filter blur-xl pointer-events-none" />
                              
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Workspace Access URL</span>
                                <a 
                                  href={`#/login?tenant=${formData.tenantDomain.toUpperCase()}`}
                                  className="text-xs font-bold text-text-primary hover:text-cyan-400 transition-colors flex items-center gap-1.5 underline"
                                >
                                  {`http://localhost:5173/#/login?tenant=${formData.tenantDomain.toUpperCase()}`}
                                  <Globe size={11} className="shrink-0 text-text-muted" />
                                </a>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block font-mono">Master Username</span>
                                  <span className="text-xs font-bold text-text-primary font-mono select-all">{formData.username}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block font-mono">Master Password</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-primary font-mono select-all">
                                      {showPassword ? formData.password : '••••••••'}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="p-1 rounded bg-white/5 hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-colors border-none cursor-pointer flex items-center justify-center"
                                    >
                                      {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <button
                                onClick={handleCopyCredentials}
                                className="flex-1 py-2.5 rounded-xl border border-border-card bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                              >
                                <Copy size={13} className="text-cyan-400" />
                                {copied ? 'Copied!' : 'Copy Credentials'}
                              </button>

                              <button
                                onClick={() => {
                                  localStorage.removeItem('zenwarAuth');
                                  localStorage.removeItem('zenwar_session');
                                  localStorage.removeItem('zenwar_current_route');
                                  navigate(`/login?tenant=${formData.tenantDomain.toUpperCase()}`);
                                  window.location.reload();
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 hover:brightness-110 text-text-primary font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border-none shadow-md shadow-cyan-500/10"
                              >
                                <LogIn size={13} />
                                Go to Login
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {paymentState === 'idle' && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-card relative z-10">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 6 && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-white/5 border border-border-card hover:bg-hover-bg px-5 py-2.5 rounded-xl text-xs font-bold text-text-primary transition-all active:scale-95 cursor-pointer ml-auto"
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
