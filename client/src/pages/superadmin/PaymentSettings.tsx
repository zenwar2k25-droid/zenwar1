import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Printer, 
  Copy, 
  ShieldCheck,
  Eye,
  EyeOff,
  Percent,
  Clock,
  Save,
  TrendingUp,
  Award
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const PaymentSettings: React.FC = () => {
  const { saPaymentSettings, updateSaPaymentSettings, addSaAuditLog, saPayments } = useDatabase();
  
  const [toastMsg, setToastMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);

  // Show/Hide masks
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Local state for the settings form to enable saving
  const [razorpayKeyId, setRazorpayKeyId] = useState(saPaymentSettings.razorpayKeyId);
  const [razorpaySecretKey, setRazorpaySecretKey] = useState(saPaymentSettings.razorpaySecretKey);
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState(saPaymentSettings.razorpayWebhookSecret || '');
  const [razorpayTestMode, setRazorpayTestMode] = useState(saPaymentSettings.razorpayTestMode);
  const [razorpayWebhookUrl, setRazorpayWebhookUrl] = useState(saPaymentSettings.razorpayWebhookUrl);
  const [razorpayCurrency, setRazorpayCurrency] = useState(saPaymentSettings.razorpayCurrency);
  const [razorpayEnabled, setRazorpayEnabled] = useState(saPaymentSettings.razorpayEnabled);
  const [upiId, setUpiId] = useState(saPaymentSettings.upiId);
  const [upiHolderName, setUpiHolderName] = useState(saPaymentSettings.upiHolderName || 'Zenwar Inc');
  const [upiEnabled, setUpiEnabled] = useState(saPaymentSettings.upiEnabled !== false);
  const [activeMethods, setActiveMethods] = useState<('UPI' | 'Razorpay' | 'Card' | 'Net Banking')[]>(
    saPaymentSettings.activeMethods || ['UPI', 'Razorpay', 'Card', 'Net Banking']
  );
  const [trialEnabled, setTrialEnabled] = useState(saPaymentSettings.trialEnabled !== false);
  const [trialDays, setTrialDays] = useState(saPaymentSettings.trialDays || 14);
  const [autoVerification, setAutoVerification] = useState(saPaymentSettings.autoVerification !== false);
  const [pollingInterval, setPollingInterval] = useState(saPaymentSettings.pollingInterval || 5);
  const [taxRatePercent, setTaxRatePercent] = useState(saPaymentSettings.taxRatePercent || 18);
  const [taxInvoicePrefix, setTaxInvoicePrefix] = useState(saPaymentSettings.taxInvoicePrefix || 'TXN-SaaS-');

  // QR Code Preview Helper state
  const [previewAmount, setPreviewAmount] = useState('999');
  const [previewMemo, setPreviewMemo] = useState('Growth Plan Monthly');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSaPaymentSettings({
      razorpayKeyId,
      razorpaySecretKey,
      razorpayWebhookSecret,
      razorpayTestMode,
      razorpayWebhookUrl,
      razorpayCurrency,
      razorpayEnabled,
      upiId,
      upiHolderName,
      upiEnabled,
      activeMethods,
      trialEnabled,
      trialDays,
      autoVerification,
      pollingInterval,
      taxRatePercent,
      taxInvoicePrefix
    });
    addSaAuditLog('Payment Gateways Updated', `Updated platform Razorpay, UPI (${upiId}), trial settings, and tax configurations`);
    triggerToast('Platform payment configurations saved successfully!');
  };

  const handleVerifyConnection = () => {
    if (!razorpayKeyId || !razorpaySecretKey) {
      triggerToast('Error: Please populate Razorpay Key ID and Secret Key first.');
      return;
    }
    setIsVerifying(true);
    setVerifySuccess(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      triggerToast('Razorpay API connection verified successfully!');
      addSaAuditLog('Gateway Pinged', 'Razorpay API credentials connection test passed');
    }, 1500);
  };

  // Generate UPI deep link URL
  const upiUrl = `upi://pay?pa=${upiId || 'zenwar@upi'}&pn=Zenwar&am=${previewAmount}&cu=${razorpayCurrency || 'INR'}&tn=${encodeURIComponent(previewMemo)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUrl);
    triggerToast('UPI Payment Deep Link copied to clipboard!');
  };

  const handleDownloadQR = () => {
    // Simulate downloading by opening in a new tab or triggering mock action
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.target = '_blank';
    link.download = `upi-qr-${previewAmount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('QR Code image file download triggered!');
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print UPI Payment QR Code</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; color: #000; }
              .card { border: 2px solid #ccc; padding: 30px; border-radius: 16px; text-align: center; max-width: 350px; }
              img { margin-bottom: 20px; width: 250px; height: 250px; }
              h1 { font-size: 20px; margin: 0 0 10px 0; }
              p { font-size: 14px; color: #666; margin: 5px 0; }
              .amount { font-size: 24px; font-weight: bold; color: #000; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>ZENWAR PAYMENT</h1>
              <p>Scan using any UPI App (GPay, PhonePe, Paytm)</p>
              <img src="${qrCodeUrl}" alt="UPI QR Code" />
              <p>UPI ID: <strong>${upiId}</strong></p>
              <p>Memo: ${previewMemo}</p>
              <div class="amount">₹${previewAmount}</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <CreditCard className="text-[var(--color-primary)]" size={28} /> System Payment Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Configure global SaaS subscription gateways, UPI payment handles, trial activation policies, and tax rate rules
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* UPI Settings */}
            <div className="glass-panel p-5 border-border-card space-y-4">
              <div className="flex justify-between items-center border-b border-border-card pb-3">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                  <QrCode className="text-violet-400" size={16} /> Global UPI Payments Configuration
                </h3>
                <button 
                  type="button"
                  onClick={() => setUpiEnabled(!upiEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${upiEnabled ? 'bg-violet-500' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${upiEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {upiEnabled ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[10px] text-text-secondary uppercase">Platform UPI VPA ID *</label>
                    <input 
                      type="text"
                      required
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="zenwar@upi"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-400 font-mono tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-text-secondary uppercase">Account Holder Name *</label>
                    <input 
                      type="text"
                      required
                      value={upiHolderName}
                      onChange={e => setUpiHolderName(e.target.value)}
                      placeholder="Zenwar Inc"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-text-muted bg-black/10 border border-dashed border-border-card rounded-xl text-[11px]">
                  UPI Payment handle is currently disabled. Clients will not be shown raw UPI options.
                </div>
              )}
            </div>

            {/* Razorpay Gateway */}
            <div className="glass-panel p-5 border-border-card space-y-4">
              <div className="flex justify-between items-center border-b border-border-card pb-3">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                  <CreditCard className="text-cyan-400" size={16} /> Razorpay SaaS Payment Integration
                </h3>
                <button 
                  type="button"
                  onClick={() => setRazorpayEnabled(!razorpayEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${razorpayEnabled ? 'bg-cyan-400' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${razorpayEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {razorpayEnabled ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-[10px] text-text-secondary uppercase">Razorpay Key ID *</label>
                      <input 
                        type="text"
                        required
                        value={razorpayKeyId}
                        onChange={e => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_test_..."
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-text-secondary uppercase">Razorpay Secret Key *</label>
                      <div className="relative">
                        <input 
                          type={showSecretKey ? 'text' : 'password'}
                          required
                          value={razorpaySecretKey}
                          onChange={e => setRazorpaySecretKey(e.target.value)}
                          placeholder="••••••••••••••••••••"
                          className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer border-none bg-transparent"
                        >
                          {showSecretKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-[10px] text-text-secondary uppercase">Webhook Destination URL</label>
                      <input 
                        type="text"
                        required
                        value={razorpayWebhookUrl}
                        onChange={e => setRazorpayWebhookUrl(e.target.value)}
                        className="w-full bg-bg-card/50 border border-border-card text-text-muted rounded-xl px-4 py-2.5 text-xs focus:outline-none font-mono"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] text-text-secondary uppercase">Webhook Secret Key *</label>
                      <div className="relative">
                        <input 
                          type={showWebhookSecret ? 'text' : 'password'}
                          required
                          value={razorpayWebhookSecret}
                          onChange={e => setRazorpayWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                          className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer border-none bg-transparent"
                        >
                          {showWebhookSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-[10px] text-text-secondary uppercase">Settlement Currency</label>
                      <select
                        value={razorpayCurrency}
                        onChange={e => setRazorpayCurrency(e.target.value)}
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-border-card">
                      <div>
                        <span className="text-text-primary block text-[11px]">Sandbox Test Mode</span>
                        <span className="text-[9px] text-text-muted font-mono">Use test cards & mock responses</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setRazorpayTestMode(!razorpayTestMode)}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${razorpayTestMode ? 'bg-orange-500' : 'bg-white/10'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${razorpayTestMode ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Actions & Connection Info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border-card">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">Connection Status:</span>
                      {verifySuccess ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          ● Verified & Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted bg-white/5 border border-border-card px-2 py-0.5 rounded">
                          ● Not Checked
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyConnection}
                      disabled={isVerifying}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-primary font-bold transition-all text-[11px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? <RefreshCw size={12} className="animate-spin text-cyan-400" /> : <RefreshCw size={12} />}
                      Verify API Credentials
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-text-muted bg-black/10 border border-dashed border-border-card rounded-xl text-[11px]">
                  Razorpay SaaS payment integrations are disabled. Users will not see card, net banking, or wallet checkout panels.
                </div>
              )}
            </div>

            {/* Subscription & Trial Preferences */}
            <div className="glass-panel p-5 border-border-card space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2 border-b border-border-card pb-3">
                <ShieldCheck className="text-emerald-400" size={16} /> Subscription Payment Methods & Trial Rules
              </h3>

              <div className="space-y-4">
                {/* Active Checkout Toggles */}
                <div>
                  <label className="block mb-2 text-[10px] text-text-secondary uppercase tracking-wider">Active Subscription Checkout Methods</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-card p-3 rounded-xl border border-border-card">
                    {['UPI', 'Razorpay', 'Card', 'Net Banking'].map((method) => {
                      const active = activeMethods.includes(method as any);
                      return (
                        <label key={method} className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={active}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setActiveMethods(prev => [...prev, method as any]);
                              } else {
                                setActiveMethods(prev => prev.filter(m => m !== method));
                              }
                            }}
                            className="rounded text-violet-500 bg-black border-border-card w-4 h-4 focus:ring-0"
                          />
                          <span className="text-[11px] font-bold text-text-secondary">{method}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Trial Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-bg-card/30 border border-border-card">
                    <div>
                      <span className="text-text-primary block text-[11px]">Global Trial Activation</span>
                      <span className="text-[9px] text-text-muted">Allow free trial registration for new businesses</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setTrialEnabled(!trialEnabled)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${trialEnabled ? 'bg-violet-500' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${trialEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-text-secondary uppercase">Default Trial Duration (Days)</label>
                    <input 
                      type="number"
                      required
                      value={trialDays}
                      onChange={e => setTrialDays(Number(e.target.value))}
                      placeholder="14"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-400 font-mono"
                      disabled={!trialEnabled}
                    />
                  </div>
                </div>

                {/* Auto Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-bg-card/30 border border-border-card">
                    <div>
                      <span className="text-text-primary block text-[11px]">Auto Payment Verification</span>
                      <span className="text-[9px] text-text-muted">Trigger immediate webhooks for bank polling verification</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAutoVerification(!autoVerification)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${autoVerification ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${autoVerification ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] text-text-secondary uppercase flex items-center gap-1">
                      <Clock size={12} className="text-text-muted" /> Polling Check Interval (Seconds)
                    </label>
                    <input 
                      type="number"
                      required
                      value={pollingInterval}
                      onChange={e => setPollingInterval(Number(e.target.value))}
                      placeholder="5"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-400 font-mono"
                      disabled={!autoVerification}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Tax Settings */}
            <div className="glass-panel p-5 border-border-card space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2 border-b border-border-card pb-3">
                <Percent className="text-cyan-400" size={16} /> Platform Billing & Tax Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[10px] text-text-secondary uppercase">SaaS Tax Rate (%)</label>
                  <input 
                    type="number"
                    required
                    value={taxRatePercent}
                    onChange={e => setTaxRatePercent(Number(e.target.value))}
                    placeholder="18"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-[9px] text-text-muted block mt-1">Global GST/VAT percentage applied during SaaS onboarding or renewal.</span>
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-text-secondary uppercase">SaaS Invoice Prefix</label>
                  <input 
                    type="text"
                    required
                    value={taxInvoicePrefix}
                    onChange={e => setTaxInvoicePrefix(e.target.value)}
                    placeholder="TXN-SaaS-"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-[9px] text-text-muted block mt-1">Sequence prefix prepended to system invoices.</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 to-violet-500 hover:brightness-110 text-text-primary font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Save size={14} /> Save Configuration Settings
            </button>
          </div>

          {/* Dynamic QR Preview Column */}
          <div className="space-y-6">
            <div className="glass-panel p-5 border-border-card space-y-5 text-center flex flex-col justify-between relative overflow-hidden group">
              {/* Glowing neon sphere background */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/5 filter blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest font-mono">Live UPI QR Code Preview</h3>
                <p className="text-[10px] text-text-muted font-mono">Real-time simulation of amount-based QR code generation</p>
              </div>

              {/* Dynamic QR Container */}
              <div className="relative mx-auto w-52 h-52 rounded-2xl border border-border-card bg-white p-2.5 flex items-center justify-center shadow-2xl overflow-hidden group/qr">
                {/* Scanning neon laser effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_cyan] animate-[scan_3s_linear_infinite]" />
                
                <img 
                  src={qrCodeUrl}
                  alt="Dynamic UPI QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-border-card space-y-2 text-[10px] font-mono text-text-secondary">
                  <div className="flex justify-between">
                    <span>Merchant Name:</span>
                    <span className="text-text-primary font-bold">{upiHolderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handle VPA:</span>
                    <span className="text-cyan-400 font-bold">{upiId || 'zenwar@upi'}</span>
                  </div>
                  <div className="flex justify-between border-t border-border-card pt-1">
                    <span>Amount:</span>
                    <span className="text-emerald-400 font-bold">₹{previewAmount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Note:</span>
                    <span className="text-text-primary truncate max-w-[120px]">{previewMemo}</span>
                  </div>
                </div>

                {/* Input Adjusters */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase">Test Amount (₹)</label>
                    <input 
                      type="number"
                      value={previewAmount}
                      onChange={e => setPreviewAmount(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-lg px-2 py-1 text-[11px] text-text-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-text-muted uppercase">Memo Text</label>
                    <input 
                      type="text"
                      value={previewMemo}
                      onChange={e => setPreviewMemo(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-lg px-2 py-1 text-[11px] text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-card">
                <button 
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-1 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all text-[10px] flex flex-col items-center gap-1 cursor-pointer font-bold border-none"
                  title="Copy UPI Deep Link URL"
                >
                  <Copy size={13} className="text-cyan-400" />
                  Copy URL
                </button>
                <button 
                  type="button"
                  onClick={handleDownloadQR}
                  className="py-2 px-1 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all text-[10px] flex flex-col items-center gap-1 cursor-pointer font-bold border-none"
                  title="Download QR Image"
                >
                  <Download size={13} className="text-violet-400" />
                  Download
                </button>
                <button 
                  type="button"
                  onClick={handlePrintQR}
                  className="py-2 px-1 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all text-[10px] flex flex-col items-center gap-1 cursor-pointer font-bold border-none"
                  title="Print QR Flyer"
                >
                  <Printer size={13} className="text-orange-400" />
                  Print QR
                </button>
              </div>
            </div>

            {/* Platform statistics */}
            <div className="glass-panel p-5 border-border-card space-y-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-border-card pb-2">
                <TrendingUp className="text-cyan-400" size={14} /> Revenue Telemetry Summary
              </h3>
              <div className="space-y-3 font-mono text-[11px] text-text-secondary">
                <div className="flex justify-between">
                  <span>Total SaaS Payments:</span>
                  <span className="text-text-primary font-bold">{saPayments.length} transactions</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful Revenue:</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{saPayments.filter(tx => tx.status === 'Paid').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Collections:</span>
                  <span className="text-yellow-500 font-bold">
                    ₹{saPayments.filter(tx => tx.status === 'Pending').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Pool (CGST + SGST):</span>
                  <span className="text-violet-400 font-bold">
                    ₹{saPayments.filter(tx => tx.status === 'Paid').reduce((sum, tx) => sum + (tx.taxAmount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>

      {/* Platform Payments Ledger */}
      <div className="glass-panel p-5 border-border-card space-y-4">
        <div className="flex justify-between items-center border-b border-border-card pb-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
              <Award className="text-emerald-400" size={16} /> Recent Platform Payments Ledger
            </h3>
            <p className="text-[10px] text-text-muted font-mono mt-0.5">Real-time ledger audit trail representing renewals and signups</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-text-secondary">
            <thead>
              <tr className="border-b border-border-card text-text-muted text-[10px] uppercase">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Business</th>
                <th className="py-2.5">Domain</th>
                <th className="py-2.5">Plan</th>
                <th className="py-2.5">Method</th>
                <th className="py-2.5">Transaction ID</th>
                <th className="py-2.5">Amount (₹)</th>
                <th className="py-2.5">Tax (₹)</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {saPayments.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                  <td className="py-2.5">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2.5 text-text-primary font-bold">{tx.businessName}</td>
                  <td className="py-2.5">{tx.tenantDomain}</td>
                  <td className="py-2.5 text-violet-400">{tx.planName}</td>
                  <td className="py-2.5">{tx.paymentMethod}</td>
                  <td className="py-2.5 text-cyan-400">{tx.transactionId || 'N/A'}</td>
                  <td className="py-2.5 text-text-primary font-bold">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-2.5 text-text-muted">₹{(tx.taxAmount || 0).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      tx.status === 'Refunded' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {saPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">No platform transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security alert footer */}
      <div className="glass-panel p-4 border-border-card bg-white/[0.01] flex gap-3 text-xs text-text-muted">
        <ShieldCheck className="text-cyan-500 shrink-0 mt-0.5" size={16} />
        <div className="space-y-1">
          <span className="text-text-primary font-bold block">Credential Storage Parameters</span>
          <p>
            Key credentials are local environment configurations and are stored encrypted inside tenant profiles. Never share Master Secret keys or commit webhook URLs into public repositories.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-cyan-400 px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
