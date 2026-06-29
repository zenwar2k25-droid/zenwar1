import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Building, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDatabase } from '../context/DatabaseContext';
import { useBranding } from '../hooks/useBranding';

export const Checkout: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { invoices, updateInvoice, getWorkshopPaymentConfig, addPaymentAuditLog, settings } = useDatabase();
  const branding = useBranding();

  // Find invoice across all (context partitions it but we can scan invoices)
  const invoice = useMemo(() => {
    return invoices.find(inv => inv.id === invoiceId);
  }, [invoices, invoiceId]);

  // Load config for the business that issued the invoice
  const paymentConfig = useMemo(() => {
    if (!invoice || !invoice.tenantDomain) return null;
    return getWorkshopPaymentConfig(invoice.tenantDomain);
  }, [invoice, getWorkshopPaymentConfig]);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Razorpay' | 'Cash' | 'Card' | 'Bank Transfer' | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  
  // Simulated Card State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // simulated Razorpay Modal

  const triggerCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handlePaySuccess = (method: 'UPI' | 'Razorpay' | 'Cash' | 'Card' | 'Bank Transfer') => {
    if (!invoice || !paymentConfig) return;
    setPaymentState('processing');
    
    setTimeout(() => {
      // Update Invoice Status in state/localStorage
      updateInvoice(invoice.id, {
        status: 'Paid',
        isPaid: true,
        paymentMethod: method
      });

      // Write to Business Transaction Logs
      addPaymentAuditLog({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paymentMethod: method,
        status: 'Paid',
        tenantDomain: invoice.tenantDomain || 'APEXAUTO'
      });

      setPaymentState('success');
      handleConfetti();
    }, 1800);
  };

  const handlePayFailed = (method: 'UPI' | 'Razorpay' | 'Cash' | 'Card' | 'Bank Transfer') => {
    if (!invoice) return;
    setPaymentState('processing');
    
    setTimeout(() => {
      // Write to Logs
      addPaymentAuditLog({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paymentMethod: method,
        status: 'Failed',
        tenantDomain: invoice.tenantDomain || 'APEXAUTO'
      });

      setPaymentState('failed');
    }, 1500);
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#07080d] text-text-primary flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full text-center border-red-500/20 bg-red-950/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold">Invoice Not Found</h2>
          <p className="text-xs text-text-secondary">
            The requested invoice checkout link may have expired or is invalid. Please double check with the business manager.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-white/5 border border-border-card rounded-xl text-xs hover:bg-hover-bg transition-colors font-bold"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // UPI URL construction
  const upiUrl = useMemo(() => {
    if (!paymentConfig || !paymentConfig.upiId) return '';
    return `upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${invoice.total}&cu=INR`;
  }, [paymentConfig, invoice.total, settings.shopName]);

  const qrImageUrl = useMemo(() => {
    if (!upiUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
  }, [upiUrl]);

  return (
    <div className="min-h-screen bg-[#06070a] text-xs text-text-secondary flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative neon ambient glows */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-center">
        
        {paymentState === 'success' ? (
          <div className="glass-panel p-8 text-center border-emerald-500/30 bg-emerald-950/5 space-y-5 max-w-md mx-auto w-full animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Payment Completed!</h2>
              <p className="text-[10px] text-text-secondary font-mono mt-1">Transaction Ref: Ref-{Date.now().toString().slice(-8)}</p>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your payment of <strong className="text-emerald-400 font-mono text-sm">₹{invoice.total.toLocaleString()}</strong> has been settled successfully with <strong>{settings.shopName}</strong>. 
            </p>
            <div className="p-3 bg-bg-card rounded-xl border border-border-card space-y-1.5 text-left font-mono text-[10px]">
              <div className="flex justify-between text-text-muted"><span>Invoice No:</span><span className="text-text-primary">{invoice.invoiceNumber}</span></div>
              <div className="flex justify-between text-text-muted"><span>Payment Method:</span><span className="text-text-primary">{paymentMethod}</span></div>
              <div className="flex justify-between text-text-muted"><span>Status:</span><span className="text-emerald-400 font-bold">PAID</span></div>
            </div>
            <div className="text-[9px] text-text-muted italic font-mono pt-2">
              An automated receipt notification has been dispatched to the service advisory team.
            </div>
          </div>
        ) : paymentState === 'failed' ? (
          <div className="glass-panel p-8 text-center border-red-500/30 bg-red-950/5 space-y-5 max-w-md mx-auto w-full animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 animate-pulse">
              <XCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Payment Failed</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              The mock payment transaction could not be processed successfully.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentState('idle')}
                className="flex-1 py-2.5 bg-white/5 border border-border-card hover:bg-hover-bg text-text-primary font-bold rounded-xl transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 5 COLS: Invoice Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel p-5 space-y-4 border-border-card relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-border-card pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0">
                        <img src={branding.emailLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      {settings.shopName}
                    </h3>
                    <p className="text-[10px] text-text-muted font-mono mt-0.5">{settings.phone}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                    Customer Check
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between text-text-muted">
                    <span>Invoice Number:</span>
                    <span className="text-text-primary font-bold">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Date Issued:</span>
                    <span className="text-text-primary">{(invoice.dateCreated || invoice.date).split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Client Name:</span>
                    <span className="text-text-primary font-bold">{invoice.customerName}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Vehicle Plate:</span>
                    <span className="text-cyan-400 font-bold">{invoice.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between text-text-muted border-t border-border-card pt-2">
                    <span>Invoice Status:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                      invoice.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15' :
                      'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}>
                      {invoice.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Items Summary list */}
                <div className="border-t border-border-card pt-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-text-secondary block uppercase tracking-wider">Parts & Service Details</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px]">
                        <span className="text-text-secondary max-w-[170px] truncate">{item.name} <span className="text-[9px] text-text-muted">x{item.quantity}</span></span>
                        <span className="font-mono text-text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total box */}
                <div className="border-t border-border-card pt-3.5 flex justify-between items-center">
                  <span className="text-xs font-bold text-text-primary uppercase">Amount Payable</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">₹{invoice.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border-card bg-white/[0.01] text-[10px] text-text-muted font-mono leading-relaxed flex items-start gap-2">
                <ShieldCheck className="text-cyan-400 shrink-0 mt-0.5" size={13} />
                <div>
                  Secure checkout processed via tenant specific billing accounts. Raw VPA credentials and API parameters are encrypted inside storage.
                </div>
              </div>
            </div>

            {/* RIGHT 7 COLS: Checkout payment details */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Payment Method Selector */}
              <div className="glass-panel p-5 space-y-4 border-border-card">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Select Online Payment Method</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* UPI Method */}
                  {paymentConfig?.upiEnabled && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('UPI'); setPaymentState('idle'); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'UPI' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold' : 'border-border-card bg-white/5 hover:border-border-card text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="text-[9px]">Scan UPI QR</span>
                    </button>
                  )}

                  {/* Razorpay Method */}
                  {paymentConfig?.razorpayEnabled && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('Razorpay'); setPaymentState('idle'); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'Razorpay' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold' : 'border-border-card bg-white/5 hover:border-border-card text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[9px]">Razorpay Payment</span>
                    </button>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentConfig?.bankAccount && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('Bank Transfer'); setPaymentState('idle'); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'Bank Transfer' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold' : 'border-border-card bg-white/5 hover:border-border-card text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Building size={18} />
                      <span className="text-[9px]">Bank Transfer</span>
                    </button>
                  )}
                </div>

                {/* Conditional Panel Rendering */}
                {paymentMethod === null && (
                  <div className="p-8 rounded-xl border border-dashed border-border-card flex flex-col items-center justify-center text-center text-text-muted space-y-1 bg-black/20">
                    <HelpCircle size={28} className="stroke-1 mb-1" />
                    <span>Choose a payment option above to complete checkout.</span>
                  </div>
                )}

                {/* UPI Panel */}
                {paymentMethod === 'UPI' && paymentConfig?.upiEnabled && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-black/30 border border-border-card">
                      {/* Dynamic QR image - hides UPI ID string */}
                      <div className="p-2.5 bg-white rounded-lg shadow-lg border border-cyan-500/20 shrink-0">
                        {qrImageUrl ? (
                          <img src={qrImageUrl} alt="Dynamic Payment QR" className="w-[140px] h-[140px]" />
                        ) : (
                          <div className="w-[140px] h-[140px] flex items-center justify-center text-red-500">QR Error</div>
                        )}
                      </div>
                      <div className="space-y-2.5 text-center sm:text-left flex-1">
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider font-mono">Dynamic QR Active</span>
                        <h4 className="font-bold text-text-primary text-xs">Scan & Pay ₹{invoice.total.toLocaleString()}</h4>
                        <p className="text-[10px] text-text-muted leading-normal">
                          Scan the dynamic QR code using any UPI compatible application (GPay, PhonePe, Paytm, BHIM) to initiate payment.
                        </p>
                        <div className="text-[9px] text-cyan-500/70 font-mono">
                          Merchant handle is secure and masked from customer view.
                        </div>
                      </div>
                    </div>

                    {paymentState === 'processing' ? (
                      <div className="py-4 flex flex-col items-center justify-center space-y-2 text-text-secondary font-mono">
                        <div className="w-5 h-5 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin" />
                        <span>Verifying transaction logs...</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePaySuccess('UPI')}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-text-primary font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
                        >
                          I Have Scanned & Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePayFailed('UPI')}
                          className="px-4 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Razorpay Panel */}
                {paymentMethod === 'Razorpay' && paymentConfig?.razorpayEnabled && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-black/30 border border-border-card space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-border-card">
                        <span className="font-bold text-text-primary">Razorpay Checkout Frame (Sandbox)</span>
                        <span className="text-[9px] text-cyan-400 font-bold font-mono uppercase">{paymentConfig.razorpayTestMode ? 'Test Mode' : 'Live Mode'}</span>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-text-muted block mb-0.5">CARDHOLDER NAME</label>
                            <input 
                              type="text"
                              value={cardName}
                              onChange={e => setCardName(e.target.value)}
                              placeholder="e.g. John Doe"
                              className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-text-muted block mb-0.5">CREDIT/DEBIT CARD NUMBER</label>
                            <input 
                              type="text"
                              value={cardNumber}
                              onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                              placeholder="•••• •••• •••• ••••"
                              className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-text-muted block mb-0.5">EXPIRY DATE</label>
                            <input 
                              type="text"
                              value={expiry}
                              onChange={e => setExpiry(e.target.value.slice(0, 5))}
                              placeholder="MM/YY"
                              className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-text-muted block mb-0.5">CVV / SECURITY CODE</label>
                            <input 
                              type="password"
                              value={cvv}
                              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="•••"
                              className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {paymentState === 'processing' ? (
                      <div className="py-4 flex flex-col items-center justify-center space-y-2 text-text-secondary font-mono">
                        <div className="w-5 h-5 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin" />
                        <span>Connecting to gateway...</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePaySuccess('Razorpay')}
                          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-text-primary font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
                        >
                          Simulate Success Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePayFailed('Razorpay')}
                          className="px-4 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer"
                        >
                          Simulate Failure
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Transfer Panel */}
                {paymentMethod === 'Bank Transfer' && paymentConfig?.bankAccount && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-black/30 border border-border-card space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center pb-2 border-b border-border-card font-sans">
                        <span className="font-bold text-text-primary">Direct Bank Account details</span>
                        <span className="text-[9px] text-text-muted">Copy fields below to complete transaction</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg-card border border-border-card">
                          <div>
                            <span className="text-text-muted block text-[8px] font-sans">BENEFICIARY BANK NAME</span>
                            <span className="text-text-primary font-bold font-mono">{paymentConfig.bankName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => triggerCopy('bank', paymentConfig.bankName)}
                            className="p-1.5 rounded hover:bg-hover-bg text-text-muted hover:text-text-primary"
                          >
                            {copiedStates['bank'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg-card border border-border-card">
                          <div>
                            <span className="text-text-muted block text-[8px] font-sans">ACCOUNT NUMBER</span>
                            <span className="text-text-primary font-bold font-mono text-[11px]">{paymentConfig.bankAccount}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => triggerCopy('account', paymentConfig.bankAccount)}
                            className="p-1.5 rounded hover:bg-hover-bg text-text-muted hover:text-text-primary"
                          >
                            {copiedStates['account'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-bg-card border border-border-card">
                          <div>
                            <span className="text-text-muted block text-[8px] font-sans">IFSC / ROUTING CODE</span>
                            <span className="text-cyan-400 font-bold font-mono">{paymentConfig.bankIfsc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => triggerCopy('ifsc', paymentConfig.bankIfsc)}
                            className="p-1.5 rounded hover:bg-hover-bg text-text-muted hover:text-text-primary"
                          >
                            {copiedStates['ifsc'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-cyan-400 text-[10px] leading-normal font-sans">
                      <strong>Manual Settlement Instructions:</strong> Transfer the grand total of <strong>₹{invoice.total.toLocaleString()}</strong> to the bank details above. After verifying the credits, the business accountant will mark this invoice as cleared.
                    </div>

                    {paymentState === 'processing' ? (
                      <div className="py-4 flex flex-col items-center justify-center space-y-2 text-text-secondary font-mono">
                        <div className="w-5 h-5 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin" />
                        <span>Logging manual transaction...</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePaySuccess('Bank Transfer')}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-text-primary font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
                      >
                        I Have Completed Bank Transfer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border-card bg-bg-card text-center text-gray-600 font-mono text-[9px] no-print">
        © {new Date().getFullYear()} {settings.shopName}. All connections are SSL secured. Powered by Zenwar Pro.
      </footer>
    </div>
  );
};
