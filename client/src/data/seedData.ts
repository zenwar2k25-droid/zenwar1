export interface BrandingConfig {
  logoUrl: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  appIconUrl: string;
  emailLogoUrl: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  year: number;
}

export interface Customer {
  id: string;
  name: string;
  businessType?: BusinessType;
  phone: string;
  email: string;
  loyaltyPoints: number;
  vehicles: Vehicle[];
  businessId?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

export interface StaffPermissions {
  billing: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  invoices: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  inventory: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  reports: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  dashboard: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
}

export interface Mechanic {
  id: string;
  name: string;
  businessType?: BusinessType;
  role: string;
  rating: number;
  attendance: 'Present' | 'Absent' | 'Late';
  salary: number;
  efficiency: number; // percentage (e.g. 92)
  tasksAssigned: number;
  phone: string;
  avatar: string;
  businessId?: string;
  username?: string;
  password?: string;
  loginAccessDisabled?: boolean;
  verifiedAt?: string;
  staffId?: string;
  email?: string;
  mobileNumber?: string;
  department?: string;
  branch?: string;
  tenantDomain?: string;
  createdBy?: string;
  profilePhoto?: string; // base64 representation
  permissions?: StaffPermissions;
}

export interface InventoryItem {
  id: string;
  name: string;
  businessType?: BusinessType;
  category: string;
  subCategory?: string;
  stock: number;
  threshold: number; // Minimum stock
  price: number; // Selling Price
  mrp?: number;
  location: string; 
  rack?: string;
  shelf?: string;
  bin?: string;
  barcode: string;
  supplier: string;
  supplierMobile?: string;
  brand?: string;
  sku?: string;
  hsnCode?: string;
  unitType?: 'KG' | 'Gram' | 'Litre' | 'ML' | 'Piece' | 'Box' | 'Packet' | 'Dozen' | 'Tray' | 'Meter' | 'Set' | 'Bottle' | 'piece' | 'liter' | 'kg' | 'set' | 'meter';
  purchasePrice?: number;
  gstRate?: number;
  description?: string;
  imageBase64?: string;
  businessId?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

export interface InventoryHistory {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  changeType: 'Import' | 'Manual Adjust' | 'Invoice Sold' | 'Purchase Added';
  quantityChange: number;
  newStockLevel: number;
  date: string;
  notes: string;
  tenantDomain?: string;
  createdBy?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface JobCard {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  plateNumber: string;
  complaints: string[];
  assignedMechanicId: string;
  checklist: ChecklistItem[];
  status: 'Diagnosing' | 'In Progress' | 'Quality Check' | 'Ready' | 'Delivered';
  dateCreated: string;
  deliveryDate: string;
  notes: string;
  costEstimation: number;
  beforeImage: string;
  afterImage: string;
  businessId?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  vehicleInfo: string;
  serviceType: string;
  date: string;
  slot: string;
  status: 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled';
  businessId?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  businessType?: BusinessType;
  quantity: number;
  price: number;
  type: 'part' | 'labor';
  description?: string;
  gstRate?: number;
  productId?: string;
}

export interface Invoice {
  paidAmount?: number;
  balanceAmount?: number;
  paymentStatus?: 'PAID' | 'PARTIAL' | 'PENDING';
  paymentHistory?: {
    id: string;
    date: string;
    amount: number;
    method: string;
    remarks?: string;
  }[];
  dueDate?: string;
  remarks?: string;
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  vehiclePlate: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number; // 18% total (CGST 9% + SGST 9%)
  discount: number;
  total: number;
  paymentMethod: 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Razorpay';
  isPaid: boolean;
  businessId?: string;
  serviceCharge?: number;
  roundOff?: number;
  gstRate?: number;
  status?: 'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Partially Paid';
  dateCreated?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Rent' | 'Utility' | 'Tools' | 'Salary' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  businessId?: string;
  tenantDomain?: string;
  createdBy?: string;
  role?: string;
}

// Initial Data Seeds
export const seedMechanics: Mechanic[] = [
  { id: 'm-1', name: 'Alex Rivera', role: 'Senior Engine Tech', rating: 4.9, attendance: 'Present', salary: 45000, efficiency: 96, tasksAssigned: 2, phone: '+1 (555) 019-2831', avatar: '🏎️', username: 'staff_user', password: 'Staff@123' },
  { id: 'm-2', name: 'Marcus Chen', role: 'Electrical Specialist', rating: 4.8, attendance: 'Present', salary: 42000, efficiency: 91, tasksAssigned: 3, phone: '+1 (555) 021-3948', avatar: '⚡' },
  { id: 'm-3', name: 'David Miller', role: 'Suspension & Brake Expert', rating: 4.6, attendance: 'Late', salary: 38000, efficiency: 87, tasksAssigned: 1, phone: '+1 (555) 039-4859', avatar: '🔧' },
  { id: 'm-4', name: 'Vikram Singh', role: 'Diagnostics Engineer', rating: 4.9, attendance: 'Present', salary: 46000, efficiency: 98, tasksAssigned: 0, phone: '+1 (555) 041-5960', avatar: '💻' },
  { id: 'm-5', name: 'Sarah Connor', role: 'Transmission Tech', rating: 4.7, attendance: 'Absent', salary: 40000, efficiency: 89, tasksAssigned: 0, phone: '+1 (555) 052-6071', avatar: '⚙️' }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)' })) as Mechanic[];

export const seedInventory: InventoryItem[] = [
  { id: 'p-1', name: 'Synthetic Engine Oil 5W-30', category: 'Lubricants', stock: 45, threshold: 10, price: 1800, location: 'Shelf A-1', barcode: '890105230012', supplier: 'Apex Lubes Ltd.', brand: 'Mobil 1', sku: 'MOB-5W30-SYN', hsnCode: '34039900', unitType: 'liter', purchasePrice: 1350, gstRate: 18, description: 'Premium synthetic engine oil for modern passenger car engines.' },
  { id: 'p-2', name: 'Premium Ceramic Brake Pads', category: 'Spares', stock: 8, threshold: 10, price: 3200, location: 'Bin B-3', barcode: '890105230045', supplier: 'Brembo Distributors', brand: 'Brembo', sku: 'BREM-BP-CER', hsnCode: '68138100', unitType: 'set', purchasePrice: 2400, gstRate: 18, description: 'High durability ceramic brake pads providing excellent stopping power.' },
  { id: 'p-3', name: 'High Flow Air Filter', category: 'Filters', stock: 18, threshold: 5, price: 950, location: 'Shelf C-2', barcode: '890105230089', supplier: 'K&N Air Supply', brand: 'K&N', sku: 'KN-AF-HF01', hsnCode: '84213100', unitType: 'piece', purchasePrice: 700, gstRate: 18, description: 'Washable high-flow air filter element.' },
  { id: 'p-4', name: '12V Lead Acid Car Battery', category: 'Electrical', stock: 4, threshold: 5, price: 6500, location: 'Floor Grid E', barcode: '890105230112', supplier: 'Exide Retail', brand: 'Exide', sku: 'EXI-12V-LA', hsnCode: '85071000', unitType: 'piece', purchasePrice: 4800, gstRate: 28, description: 'Maintenance-free automotive starting battery.' },
  { id: 'p-5', name: 'Spark Plug Platinum V2', category: 'Spares', stock: 120, threshold: 20, price: 450, location: 'Bin D-12', barcode: '890105230188', supplier: 'NGK Spark Co.', brand: 'NGK', sku: 'NGK-SP-PL2', hsnCode: '85111000', unitType: 'piece', purchasePrice: 320, gstRate: 18, description: 'High efficiency platinum spark plug.' },
  { id: 'p-6', name: 'LED Headlight Bulb H7', category: 'Electrical', stock: 15, threshold: 6, price: 2100, location: 'Shelf A-4', barcode: '890105230231', supplier: 'Philips Automotive', brand: 'Philips', sku: 'PHIL-LED-H7', hsnCode: '85395000', unitType: 'piece', purchasePrice: 1600, gstRate: 12, description: 'Bright white H7 LED conversion bulb set.' }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)', role: 'admin' })) as InventoryItem[];

export const seedCustomers: Customer[] = [
  {
    id: 'c-1',
    name: 'Robert Downey',
    phone: '9876543210',
    email: 'robert@tony.com',
    loyaltyPoints: 340,
    vehicles: [
      { id: 'v-1', make: 'Audi', model: 'R8 Coupe', plateNumber: 'MH-12-RS-3000', year: 2021 }
    ]
  },
  {
    id: 'c-2',
    name: 'Emma Watson',
    phone: '8765432109',
    email: 'emma@wats.com',
    loyaltyPoints: 120,
    vehicles: [
      { id: 'v-2', make: 'Tesla', model: 'Model S Plaid', plateNumber: 'DL-3C-AS-4567', year: 2022 }
    ]
  },
  {
    id: 'c-3',
    name: 'Bruce Wayne',
    phone: '7654321098',
    email: 'bruce@waynecorp.com',
    loyaltyPoints: 1200,
    vehicles: [
      { id: 'v-3', make: 'Lamborghini', model: 'Aventador SVJ', plateNumber: 'GOTHAM-01', year: 2023 }
    ]
  },
  {
    id: 'c-4',
    name: 'John Wick',
    phone: '6543210987',
    email: 'wick@continental.com',
    loyaltyPoints: 50,
    vehicles: [
      { id: 'v-4', make: 'Ford', model: 'Mustang Mach 1', plateNumber: 'NY-JW-1969', year: 1969 }
    ]
  }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)', role: 'admin' })) as Customer[];

export const seedJobCards: JobCard[] = [
  {
    id: 'jc-1001',
    customerId: 'c-1',
    customerName: 'Robert Downey',
    phone: '9876543210',
    vehicleId: 'v-1',
    vehicleMake: 'Audi',
    vehicleModel: 'R8 Coupe',
    plateNumber: 'MH-12-RS-3000',
    complaints: ['Engine knocking sound under load', 'Scheduled oil and filter change', 'Check front suspension noise'],
    assignedMechanicId: 'm-1',
    checklist: [
      { id: 'chk-1', label: 'Engine Oil Checked & Flushed', checked: true },
      { id: 'chk-2', label: 'Oil Filter Replaced', checked: true },
      { id: 'chk-3', label: 'Suspension Bushing Lubrication', checked: false },
      { id: 'chk-4', label: 'Brake Rotor Examination', checked: true },
      { id: 'chk-5', label: 'Air Filter Cleaning', checked: false }
    ],
    status: 'In Progress',
    dateCreated: '2026-05-24T10:30:00Z',
    deliveryDate: '2026-05-26T18:00:00Z',
    notes: 'Knocking issue seems to stem from carbon deposits or low fuel octane rating. Will monitor ignition timing.',
    costEstimation: 8500,
    beforeImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
    afterImage: ''
  },
  {
    id: 'jc-1002',
    customerId: 'c-3',
    customerName: 'Bruce Wayne',
    phone: '7654321098',
    vehicleId: 'v-3',
    vehicleMake: 'Lamborghini',
    vehicleModel: 'Aventador SVJ',
    plateNumber: 'GOTHAM-01',
    complaints: ['Brake pads wear indicator warning active', 'Supercharger air pressure fluctuation'],
    assignedMechanicId: 'm-4',
    checklist: [
      { id: 'chk-6', label: 'OBD Diagnostic Scan', checked: true },
      { id: 'chk-7', label: 'Supercharger Pressure Test', checked: true },
      { id: 'chk-8', label: 'Carbon Ceramic Pads Swap', checked: true },
      { id: 'chk-9', label: 'Coolant Level Topup', checked: true }
    ],
    status: 'Quality Check',
    dateCreated: '2026-05-25T08:15:00Z',
    deliveryDate: '2026-05-25T19:00:00Z',
    notes: 'Replaced brake wear sensor wires. Calibration of turbo/supercharger pressure control valve completed.',
    costEstimation: 28000,
    beforeImage: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'jc-1003',
    customerId: 'c-4',
    customerName: 'John Wick',
    phone: '6543210987',
    vehicleId: 'v-4',
    vehicleMake: 'Ford',
    vehicleModel: 'Mustang Mach 1',
    plateNumber: 'NY-JW-1969',
    complaints: ['Front fender alignment post-collision', 'Clutch pedal stiff and slipping'],
    assignedMechanicId: 'm-3',
    checklist: [
      { id: 'chk-10', label: 'Fender Unbending & Prep', checked: true },
      { id: 'chk-11', label: 'Clutch Assembly Overhaul', checked: true },
      { id: 'chk-12', label: 'Flywheel Resurfacing', checked: true },
      { id: 'chk-13', label: 'Gearbox Fluid Swap', checked: true }
    ],
    status: 'Ready',
    dateCreated: '2026-05-23T14:20:00Z',
    deliveryDate: '2026-05-25T16:00:00Z',
    notes: 'Clutch replaced with heavy-duty Stage 2 performance kit. Fender re-aligned and painted.',
    costEstimation: 38500,
    beforeImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400'
  }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)', role: 'admin' })) as JobCard[];

export const seedAppointments: Appointment[] = [
  { id: 'ap-1', customerName: 'Emma Watson', phone: '8765432109', vehicleInfo: 'Tesla Model S (DL-3C-AS-4567)', serviceType: 'Battery Diagnostic & HVAC Clean', date: '2026-05-26', slot: '10:00 AM - 11:30 AM', status: 'Scheduled' },
  { id: 'ap-2', customerName: 'Bruce Wayne', phone: '7654321098', vehicleInfo: 'Lamborghini SVJ (GOTHAM-01)', serviceType: 'High-Speed Balancing & Track Check', date: '2026-05-25', slot: '04:00 PM - 05:30 PM', status: 'Checked In' },
  { id: 'ap-3', customerName: 'Steve Rogers', phone: '9081726354', vehicleInfo: 'Harley Softail (US-CAP-75)', serviceType: 'Full Service Package', date: '2026-05-27', slot: '11:30 AM - 01:00 PM', status: 'Scheduled' }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)', role: 'admin' })) as Appointment[];

export const seedInvoices: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'GF-2026-1001',
    customerId: 'c-2',
    customerName: 'Emma Watson',
    phone: '8765432109',
    vehiclePlate: 'DL-3C-AS-4567',
    date: '2026-05-24',
    items: [
      { id: 'i-1', name: 'Cabin AC Air Filter Replacement', quantity: 1, price: 950, type: 'part' },
      { id: 'i-2', name: 'EV Brake Caliper Servicing (Front)', quantity: 2, price: 1200, type: 'part' },
      { id: 'i-3', name: 'Brake Cleaning & Labor Chargers', quantity: 1, price: 1500, type: 'labor' }
    ],
    subtotal: 4850,
    paidAmount: 4850,
    balanceAmount: 0,
    paymentStatus: 'PAID',
    paymentHistory: [
      { id: 'hist-' + Date.now() + Math.random(), date: '2026-05-20', amount: 4850, method: 'Cash', remarks: 'Initial Seed Payment' }
    ],
    gstAmount: 873, // 18% of 4850
    discount: 250,
    total: 5473,
    paymentMethod: 'UPI',
    isPaid: true
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'GF-2026-1002',
    customerId: 'c-1',
    customerName: 'Robert Downey',
    phone: '9876543210',
    vehiclePlate: 'MH-12-RS-3000',
    date: '2026-05-25',
    items: [
      { id: 'i-4', name: 'Synthetic Engine Oil 5W-30', quantity: 4, price: 1800, type: 'part' },
      { id: 'i-5', name: 'Premium Spark Plugs Set', quantity: 6, price: 450, type: 'part' },
      { id: 'i-6', name: 'Engine Compression Diagnostic Labor', quantity: 1, price: 2500, type: 'labor' }
    ],
    subtotal: 12400,
    paidAmount: 12400,
    balanceAmount: 0,
    paymentStatus: 'PAID',
    paymentHistory: [
      { id: 'hist-' + Date.now() + Math.random(), date: '2026-05-20', amount: 12400, method: 'Cash', remarks: 'Initial Seed Payment' }
    ],
    gstAmount: 2232, // 18% of 12400
    discount: 500,
    total: 14132,
    paymentMethod: 'Card',
    isPaid: true
  }
].map(item => ({ ...item, businessId: 'w-1', tenantDomain: 'APEXAUTO', createdBy: 'Steve Austin (Owner)', role: 'admin' })) as Invoice[];

export const seedExpenses: Expense[] = [
];

export interface BusinessModuleAccess {
  dashboard: boolean;
  billing: boolean;
  invoices: boolean;
  jobCards: boolean;
  customers: boolean;
  inventory: boolean;
  staffs: boolean;
  appointments: boolean;
  reports: boolean;
  settings: boolean;
  whatsapp: boolean;
  multiBranch: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  paymentIntegration: boolean;
}

export interface Inquiry {
  id: string;
  fullName: string;
  businessName?: string;
  businessType?: string;
  mobileNumber: string;
  email?: string;
  district: string;
  state?: string;
  message: string;
  source: 'Landing Page' | 'Manual' | 'Other';
  leadStatus: 'New' | 'Contacted' | 'Follow Up' | 'Converted' | 'Closed';
  readStatus: 'UNREAD' | 'READ';
  priority?: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const seedInquiries: Inquiry[] = [
  {
    id: "inq-1",
    fullName: "Tony Stark",
    businessName: "Stark Industries",
    businessType: "Enterprise",
    mobileNumber: "9876543210",
    email: "tony@stark.com",
    district: "Chennai",
    state: "Tamil Nadu",
    message: "I need an enterprise setup for my high tech business.",
    source: 'Landing Page',
    leadStatus: 'New',
    readStatus: 'UNREAD',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

export type BusinessType = 
  | 'Auto Workshop'
  | 'Spare Parts Store'
  | 'Fruit Shop'
  | 'Sweet Stall'
  | 'Bakery'
  | 'Grocery Store'
  | 'Mobile Store'
  | 'Hardware Store'
  | 'Electrical Store'
  | 'Pharmacy'
  | 'Custom Business';

export interface PendingRegistration {
  registrationId: string;
  businessName: string;
  businessType?: BusinessType;
  ownerName: string;
  mobile: string;
  email: string;
  selectedPlan: string;
  subscriptionType: 'Monthly' | 'Yearly';
  duration: number;
  totalAmount: number;
  requestStatus: 'Submitted' | 'Under Review' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Pending Payment' | 'Payment Verified' | 'Business Created';
  rejectionReason?: string;
  paymentStatus: 'PENDING_PAYMENT' | 'FAILED' | 'PAID';
  createdAt: string;
  tenantDomain: string;
}

export interface Business {
  id: string;
  name: string;
  businessType?: BusinessType;
  tenantDomain: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  planId: string;
  status: 'Active' | 'Trial' | 'Pending Payment' | 'Failed' | 'Expired' | 'Suspended';
  registeredDate: string;
  trialDays?: number;
  renewalDate?: string;
  staffLimit?: number;
  activeUsers: number;
  verified?: boolean;
  verifiedBy?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING';
  branches?: number;
  logoUrl?: string;
  brandColor?: string;
  theme?: string;
  smsCredits?: number;
  whatsappCredits?: number;
  usage?: any;
  username?: string;
  password?: string;
  gstNumber?: string;
  loginAccessDisabled?: boolean;
  verifiedAt?: string;
  passwordUpdatedAt?: string;
  forcePasswordReset?: boolean;
  profilePhoto?: string;
  moduleOverrides?: Partial<BusinessModuleAccess>; // SA per-tenant overrides
  loginHistory?: {
    timestamp: string;
    ip: string;
    device: string;
    location: string;
    success: boolean;
  }[];
  deviceActivity?: {
    deviceId: string;
    name: string;
  businessType?: BusinessType;
    ip: string;
    lastActive: string;
    status: 'Active' | 'Inactive';
  }[];
}

export interface PermissionRule {
  role: string;
  billing: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  invoices: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  inventory: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  reports: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
  dashboard: { read: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; approve: boolean };
}

export interface PlanModuleAccess {
  dashboard: boolean;
  billing: boolean;
  invoices: boolean;
  jobCards: boolean;
  customers: boolean;
  inventory: boolean;
  staffs: boolean;
  appointments: boolean;
  reports: boolean;
  settings: boolean;
  whatsapp: boolean;
  multiBranch: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  paymentIntegration: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  businessType?: BusinessType;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxStorageMb: number;
  maxInvoices: number;
  features: string[];
  trialDays: number;
  whatsappCredits?: number;
  smsCredits?: number;
  customBranding: boolean;
  apiAccess: boolean;
  multiBranchSupport: boolean;
  badge?: string;
  isPopular?: boolean;
  enabled?: boolean;
  archived?: boolean;
  trialEnabled?: boolean;
  renewalAmount?: number;
  setupFee?: number;
  taxPercentage?: number;
  moduleAccess?: PlanModuleAccess; // which modules this plan unlocks
}


// ---------------------------------------------------------
// WEBSITE BUILDER CMS SCHEMAS
// ---------------------------------------------------------

export interface HeroContent {
  badgeText: string;
  mainHeading: string;
  highlightText: string;
  description: string;
  primaryButtonText: string;
  primaryButtonAction: string;
  secondaryButtonText: string;
  secondaryButtonAction: string;
  textColor: string;
  buttonStyle: 'solid' | 'outline' | 'glass';
  alignment: 'left' | 'center' | 'right';
  enabled: boolean;
}

export interface HeroSliderSettings {
  autoplay: boolean;
  loop: boolean;
  slideDuration: number; // ms
  transitionSpeed: number; // ms
  animationType: 'fade' | 'slide';
  pauseOnHover: boolean;
  mobileOptimized: boolean;
  showArrows: boolean;
  showDots: boolean;
  lazyLoad: boolean;
}

export type HeroBannerAction = 'Open Starter Plan' | 'Open Pro Plan' | 'Open Enterprise Plan' | 'Open Custom Subscription Plan' | 'Open Contact Form' | 'Open Registration Form' | 'Open Pricing Section' | 'Scroll to Features' | 'Scroll to FAQ' | 'Scroll to Contact Section' | 'No Action';

export interface HeroBanner {
  id: string;
  name: string;
  imageUrl: string;
  mediaId?: string;
  order: number;
  action?: HeroBannerAction;
  active: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  link?: string;
  active: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  userLimit: string;
  storage: string;
  businessLimit: string;
  trialDays: number;
  buttonText: string;
  highlightPlan: boolean;
  badge: string;
  order: number;
  link?: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  company: string;
  designation: string;
  rating: number; // 1-5
  feedback: string;
  photoUrl: string;
  order: number;
  link?: string;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  link?: string;
  active: boolean;
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  supportEmail: string;
  supportNumber: string;
  whatsapp: string;
  officeHours: string;
  emergencyContact: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  enabled: boolean;
}

export interface ContactPageConfig {
  companyName: string;
  supportEmail: string;
  salesEmail: string;
  accountsEmail: string;
  technicalSupportEmail: string;
  mobileNumber: string;
  whatsappNumber: string;
  officeAddress: string;
  workingHours: string;
  emergencyContact: string;
  googleMapLink: string;
  socialMedia: { facebook: string, twitter: string, instagram: string, linkedin: string };
  supportImage: string;
  backgroundBanner: string;
  active: boolean;
}

export interface ContactTeamMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  whatsapp: string;
  email: string;
  availability: 'Online' | 'Busy' | 'Offline';
  photoUrl: string;
  order: number;
  active: boolean;
}

export interface AboutTimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  bannerImage?: string;
  images?: string[];
  order: number;
  active: boolean;
}

export interface AboutTeamMember {
  id: string;
  name: string;
  designation: string;
  description: string;
  photoUrl: string;
  socialLinks: { linkedin: string, twitter: string };
  order: number;
  active: boolean;
}


export interface FeaturesPageConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  active: boolean;
}

export interface PricingPageConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  active: boolean;
}
export interface AboutCoreValue {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  imageUrl?: string;
  order: number;
  active: boolean;
}

export interface AboutPageConfig {
  heroBanner: string;
  heroBgImage: string;
  aboutTitle: string;
  companyDescription: string;
  companyImage: string;
  mission: string;
  missionImage: string;
  vision: string;
  visionImage: string;
  ceoMessage: string;
  ceoPhoto: string;
  history: string;
  coreValues: AboutCoreValue[];
  statistics: { label: string; value: string }[];
  gallery: string[];
  officeImages: {
    exterior: string;
    interior: string;
    reception: string;
    meetingRoom: string;
    teamPhotos: string[];
  };
  achievements: {
    awards: string[];
    certificates: string[];
    eventPhotos: string[];
  };
  backgroundImage: string;
  videoLink: string;
  active: boolean;
  timeline: AboutTimelineEvent[];
  leadership: AboutTeamMember[];
}


export interface FooterConfig {
  companyName: string;
  logoUrl: string;
  description: string;
  copyright: string;
  quickLinks: { name: string; url: string }[];
  policies: { name: string; url: string }[];
  socialLinks: { platform: string; url: string }[];
  paymentIcons: string[]; // URLs
}

export interface SEOConfig {
  websiteTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  faviconUrl: string;
  logoUrl: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  robotsTxt: string;
  schemaJson: string;
  canonicalUrl: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: 'Hero' | 'About' | 'Gallery' | 'Team' | 'Branches' | 'Testimonials' | 'Features' | 'Icons' | 'Logos' | 'Other';
  sizeKb: number;
  uploadDate: string;
}

export interface WebsiteState {
  heroContent: HeroContent;
  heroSliderSettings: HeroSliderSettings;
  heroBanners: HeroBanner[];
  features: Feature[];
  pricing: PricingPlan[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  contact: ContactConfig;
  contactPage?: ContactPageConfig;
  contactTeam?: ContactTeamMember[];
  aboutPage?: AboutPageConfig;
  featuresPage?: FeaturesPageConfig;
  pricingPage?: PricingPageConfig;
  branchDirectory?: BranchDirectoryConfig;
  branding?: BrandingConfig;
  footer: FooterConfig;
  seo: SEOConfig;
  authSettings?: AuthSettings;
}

export interface WebsiteVersion {
  id: string;
  versionName: string;
  publishedAt: string;
  publishedBy: string;
  notes: string;
  state: WebsiteState;
}

// ---------------------------------------------------------
// INITIAL DEMO STATES
// ---------------------------------------------------------

export const demoHeroContent: HeroContent = {
  badgeText: "Enterprise Suite",
  mainHeading: "Manage Your Entire",
  highlightText: "Business Operations",
  description: "The ultimate cloud-based platform for billing, inventory, staff, and customer management across multiple branches.",
  primaryButtonText: "Start Free Trial",
  primaryButtonAction: "/register",
  secondaryButtonText: "View Pricing",
  secondaryButtonAction: "#pricing",
  textColor: "#ffffff",
  buttonStyle: "solid",
  alignment: "left",
  enabled: true
};

export const demoHeroSliderSettings: HeroSliderSettings = {
  autoplay: true,
  loop: true,
  slideDuration: 5000,
  transitionSpeed: 500,
  animationType: 'fade',
  pauseOnHover: true,
  mobileOptimized: true,
  showArrows: true,
  showDots: true,
  lazyLoad: true
};

export const demoFeatures: Feature[] = [
  { id: 'f1', title: 'Smart Billing', description: 'Generate GST-compliant invoices with automatic QR codes in seconds.', icon: 'Zap', order: 1, active: true },
  { id: 'f2', title: 'Inventory Control', description: 'Track stock levels, set low-stock alerts, and manage multiple warehouses.', icon: 'Package', order: 2, active: true },
  { id: 'f3', title: 'Multi-Branch Support', description: 'Control and monitor unlimited branch locations from a single dashboard.', icon: 'MapPin', order: 3, active: true }
];

export const demoTestimonials: Testimonial[] = [
  { id: 't1', customerName: 'Rajesh Kumar', company: 'Kumar Motors', designation: 'Owner', rating: 5, feedback: 'Zenwar completely transformed how we run our operations. The billing is lightning fast.', photoUrl: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random', order: 1, active: true }
];

export const demoFAQs: FAQ[] = [
  { id: 'faq1', question: 'How do I add a new branch?', answer: 'Go to Settings > Branches and click "Add New Branch".', category: 'General', order: 1, active: true },
  { id: 'faq2', question: 'Does Zenwar support GST?', answer: 'Yes, Zenwar fully supports Indian GST formats and automated calculations.', category: 'Billing', order: 2, active: true }
];

export const demoContactConfig: ContactConfig = {
  title: "Get in Touch",
  subtitle: "Our support team is available 24/7 to help you scale your business.",
  supportEmail: "support@zenwar.com",
  supportNumber: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  officeHours: "Mon - Sat: 9:00 AM - 7:00 PM",
  emergencyContact: "+91 99999 88888",
  socialMedia: { facebook: "#", twitter: "#", instagram: "#", linkedin: "#" },
  enabled: true
};

export const demoFooterConfig: FooterConfig = {
  companyName: "Zenwar Business Suite",
  logoUrl: "",
  description: "Enterprise SaaS for modern businesses.",
  copyright: "© 2026 Zenwar. All rights reserved.",
  quickLinks: [{ name: "Features", url: "#features" }, { name: "Pricing", url: "#pricing" }],
  policies: [{ name: "Privacy Policy", url: "/privacy" }, { name: "Terms of Service", url: "/terms" }],
  socialLinks: [{ platform: "Twitter", url: "#" }],
  paymentIcons: []
};

export const demoSEOConfig: SEOConfig = {
  websiteTitle: "Zenwar Business Suite",
  metaTitle: "Zenwar | Enterprise Management Platform",
  metaDescription: "Manage billing, inventory, and staff across multiple branches.",
  keywords: "ERP, SaaS, Billing, Inventory, Multi-branch",
  ogTitle: "Zenwar Business Suite",
  ogDescription: "The ultimate platform for your business.",
  faviconUrl: "",
  logoUrl: "",
  googleAnalyticsId: "",
  facebookPixelId: "",
  robotsTxt: "User-agent: *\\nAllow: /",
  schemaJson: "{}",
  canonicalUrl: "https://zenwar.com"
};

export const demoMediaAssets: MediaAsset[] = [
  { id: 'img1', name: 'Dashboard Preview', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80', folder: 'Gallery', sizeKb: 250, uploadDate: new Date().toISOString() }
];






// ---------------------------------------------------------

export interface SaAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  target: 'all' | 'enterprise' | 'growth' | 'starter' | string; // target string allows specific tenantDomain
  type: 'announcement' | 'maintenance' | 'alert';
  acknowledgements?: { tenantDomain: string; userId?: string; date: string }[];
  actionUrl?: string;
  actionText?: string;
}


export interface SaAuditLog {
  id: string;
  action: string;
  adminUser: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface SaBackup {
  id: string;
  name: string;
  businessType?: BusinessType;
  dateCreated: string;
  sizeKb: number;
  version: string;
}

// Super Admin Seed Datasets
export const seedBusinesses: Business[] = [
  {
    id: 'b-1',
    name: 'Zenwar Auto Workshop',
    tenantDomain: 'AUTO001',
    businessType: 'Auto Workshop',
    ownerName: 'Rahul Kumar',
    email: 'rahul@auto.com',
    phone: '9876543210',
    planId: 'pro',
    status: 'Active',
    registeredDate: '2023-11-15',
    activeUsers: 8,
    staffLimit: 10,
    renewalDate: '2024-11-15',
    verified: true,
    verificationStatus: 'VERIFIED',
    verifiedBy: 'system',
    verifiedAt: '2023-11-15'
  },
  {
    id: 'b-2',
    name: 'Zenwar Fruit Shop',
    tenantDomain: 'FRUIT001',
    businessType: 'Fruit Shop',
    ownerName: 'Arjun Singh',
    email: 'arjun@fruit.com',
    phone: '9876543211',
    planId: 'starter',
    status: 'Active',
    registeredDate: '2024-01-10',
    activeUsers: 3,
    staffLimit: 3,
    verified: true,
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'b-3',
    name: 'Zenwar Sweet Stall',
    tenantDomain: 'SWEET001',
    businessType: 'Sweet Stall',
    ownerName: 'Manoj Tiwari',
    email: 'manoj@sweet.com',
    phone: '9876543212',
    planId: 'enterprise',
    status: 'Active',
    registeredDate: '2023-08-20',
    activeUsers: 15,
    verified: true,
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'b-4',
    name: 'Zenwar Grocery Store',
    tenantDomain: 'GROC001',
    businessType: 'Grocery Store',
    ownerName: 'Sunil Patel',
    email: 'sunil@groc.com',
    phone: '9876543213',
    planId: 'starter',
    status: 'Pending Payment',
    registeredDate: '2024-05-01',
    activeUsers: 0,
    verificationStatus: 'PENDING'
  },
  {
    id: 'b-5',
    name: 'Zenwar Mobile Store',
    tenantDomain: 'MOB001',
    businessType: 'Mobile Store',
    ownerName: 'Vikram Das',
    email: 'vikram@mob.com',
    phone: '9876543214',
    planId: 'pro',
    status: 'Active',
    registeredDate: '2024-03-12',
    activeUsers: 5,
    verified: true,
    verificationStatus: 'VERIFIED'
  }
];

export const seedPermissionRules: PermissionRule[] = [
  {
    role: 'Super Admin',
    billing: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    inventory: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    reports: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    invoices: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    dashboard: { read: true, create: true, edit: true, delete: true, export: true, approve: true }
  },
  {
    role: 'Business Admin',
    billing: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    inventory: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    reports: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    invoices: { read: true, create: true, edit: true, delete: true, export: true, approve: true },
    dashboard: { read: true, create: true, edit: true, delete: true, export: true, approve: true }
  },
  {
    role: 'Manager',
    billing: { read: true, create: true, edit: true, delete: false, export: true, approve: true },
    inventory: { read: true, create: true, edit: true, delete: false, export: true, approve: true },
    reports: { read: true, create: true, edit: true, delete: false, export: true, approve: true },
    invoices: { read: true, create: true, edit: true, delete: false, export: true, approve: true },
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
  },
  {
    role: 'Accountant',
    billing: { read: true, create: false, edit: false, delete: false, export: true, approve: false },
    inventory: { read: true, create: false, edit: false, delete: false, export: true, approve: false },
    reports: { read: true, create: false, edit: false, delete: false, export: true, approve: false },
    invoices: { read: true, create: false, edit: false, delete: false, export: true, approve: false },
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
  },
  {
    role: 'Service Advisor',
    billing: { read: true, create: true, edit: true, delete: false, export: false, approve: false },
    inventory: { read: true, create: true, edit: false, delete: false, export: false, approve: false },
    reports: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
    invoices: { read: true, create: true, edit: false, delete: false, export: false, approve: false },
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
  },
  {
    role: 'Mechanic',
    billing: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
    inventory: { read: true, create: false, edit: false, delete: false, export: false, approve: false },
    reports: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
    invoices: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
  },
  {
    role: 'Receptionist',
    billing: { read: true, create: true, edit: false, delete: false, export: false, approve: false },
    inventory: { read: true, create: false, edit: false, delete: false, export: false, approve: false },
    reports: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
    invoices: { read: true, create: true, edit: false, delete: false, export: false, approve: false },
    dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
  }
]

const starterModuleAccess: PlanModuleAccess = {
  dashboard: true,
  billing: true,
  invoices: true,
  jobCards: true,
  customers: true,
  inventory: false,
  staffs: false,
  appointments: true,
  reports: false,
  settings: true,
  whatsapp: false,
  multiBranch: false,
  advancedAnalytics: false,
  apiAccess: false,
  paymentIntegration: false
};

const growthModuleAccess: PlanModuleAccess = {
  dashboard: true,
  billing: true,
  invoices: true,
  jobCards: true,
  customers: true,
  inventory: true,
  staffs: true,
  appointments: true,
  reports: true,
  settings: true,
  whatsapp: true,
  multiBranch: true,
  advancedAnalytics: false,
  apiAccess: false,
  paymentIntegration: true
};

const enterpriseModuleAccess: PlanModuleAccess = {
  dashboard: true,
  billing: true,
  invoices: true,
  jobCards: true,
  customers: true,
  inventory: true,
  staffs: true,
  appointments: true,
  reports: true,
  settings: true,
  whatsapp: true,
  multiBranch: true,
  advancedAnalytics: true,
  apiAccess: true,
  paymentIntegration: true
};

export const seedSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Ride',
    priceMonthly: 4999,
    priceYearly: 47990,
    maxUsers: 3,
    maxStorageMb: 100,
    maxInvoices: 500,
    features: ['Basic POS Billing', 'Checklist Diagnostics', '3 Staff Accounts', '1 Branch Support', 'SMS Notifications'],
    trialDays: 7,
    whatsappCredits: 100,
    smsCredits: 500,
    customBranding: false,
    apiAccess: false,
    multiBranchSupport: false,
    isPopular: false,
    enabled: true,
    archived: false,
    trialEnabled: true,
    renewalAmount: 4999,
    setupFee: 0,
    taxPercentage: 18,
    moduleAccess: starterModuleAccess
  },
  {
    id: 'growth',
    name: 'Growth Speedster',
    priceMonthly: 12999,
    priceYearly: 124790,
    maxUsers: 10,
    maxStorageMb: 1024,
    maxInvoices: 2000,
    features: ['Multi-Branch Switching', 'Full CRM Ledger', 'Advanced P&L Reports', '10 Staff Accounts', 'WhatsApp Alerts integration'],
    trialDays: 14,
    whatsappCredits: 1000,
    smsCredits: 5000,
    customBranding: false,
    apiAccess: false,
    multiBranchSupport: true,
    badge: 'Most Popular',
    isPopular: true,
    enabled: true,
    archived: false,
    trialEnabled: true,
    renewalAmount: 12999,
    setupFee: 0,
    taxPercentage: 18,
    moduleAccess: growthModuleAccess
  },
  {
    id: 'enterprise',
    name: 'Enterprise Flow',
    priceMonthly: 29999,
    priceYearly: 287990,
    maxUsers: 99,
    maxStorageMb: 10240,
    maxInvoices: 10000,
    features: ['Custom Branding (Whitelabel)', 'Priority API Integrations', 'Unlimited Staff', 'Unlimited Branches', 'Dedicated Super Admin Roster', 'Automated Daily Data backups'],
    trialDays: 30,
    whatsappCredits: 10000,
    smsCredits: 50000,
    customBranding: true,
    apiAccess: true,
    multiBranchSupport: true,
    isPopular: false,
    enabled: true,
    archived: false,
    trialEnabled: false,
    renewalAmount: 29999,
    setupFee: 1999,
    taxPercentage: 18,
    moduleAccess: enterpriseModuleAccess
  }
];

// ========================================
// SUPER ADMIN USERS SYSTEM
// ========================================

export type SuperAdminRole = 'owner' | 'operations' | 'support' | 'billing' | 'marketing';

export interface SuperAdminPermissions {
  dashboard: boolean;
  businesses: boolean;
  permissions: boolean;
  staff: boolean;
  subscriptions: boolean;
  builder: boolean;
  revenue: boolean;
  payments: boolean;
  notifications: boolean;
  activityLogs: boolean;
  security: boolean;
  settings: boolean;
  adminUsers: boolean;
}

export interface SuperAdminUser {
  id: string;
  name: string;
  businessType?: BusinessType;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: SuperAdminRole;
  permissions: SuperAdminPermissions;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  profilePhoto?: string;
  designation?: string;
  bio?: string;
}

const fullSaPermissions: SuperAdminPermissions = {
  dashboard: true, businesses: true, permissions: true, staff: true,
  subscriptions: true, builder: true, revenue: true, payments: true,
  notifications: true, activityLogs: true, security: true, settings: true, adminUsers: true
};

export const seedSuperAdminUsers: SuperAdminUser[] = [
  {
    id: 'sa-1',
    name: 'Mark Rivera',
    username: 'zenwar_admin',
    email: 'zenwar_admin@zenwar.com',
    phone: '+1 (555) 100-3000',
    password: 'Smart@123',
    role: 'owner',
    permissions: fullSaPermissions,
    status: 'Active',
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString(),
    avatar: '👑'
  },
  {
    id: 'sa-2',
    name: 'Alex Chen',
    username: 'ops_admin',
    email: 'ops@zenwar.com',
    phone: '+1 (555) 200-1001',
    password: 'Ops@1234',
    role: 'operations',
    permissions: {
      dashboard: true, businesses: true, permissions: true, staff: true,
      subscriptions: true, builder: false, revenue: true, payments: false,
      notifications: true, activityLogs: true, security: false, settings: false, adminUsers: false
    },
    status: 'Active',
    createdAt: '2024-06-15',
    lastLogin: '2026-05-26T10:00:00Z',
    avatar: '⚙️'
  },
  {
    id: 'sa-3',
    name: 'Sara Patel',
    username: 'support_admin',
    email: 'support@zenwar.com',
    phone: '+1 (555) 300-2002',
    password: 'Support@123',
    role: 'support',
    permissions: {
      dashboard: true, businesses: true, permissions: false, staff: false,
      subscriptions: false, builder: false, revenue: false, payments: false,
      notifications: true, activityLogs: true, security: false, settings: false, adminUsers: false
    },
    status: 'Active',
    createdAt: '2025-01-10',
    lastLogin: '2026-05-25T15:30:00Z',
    avatar: '🎧'
  },
  {
    id: 'sa-4',
    name: 'Kevin Ross',
    username: 'billing_admin',
    email: 'billing@zenwar.com',
    phone: '+1 (555) 400-3003',
    password: 'Billing@123',
    role: 'billing',
    permissions: {
      dashboard: true, businesses: false, permissions: false, staff: false,
      subscriptions: true, builder: false, revenue: true, payments: true,
      notifications: false, activityLogs: true, security: false, settings: false, adminUsers: false
    },
    status: 'Active',
    createdAt: '2025-03-20',
    lastLogin: '2026-05-27T08:45:00Z',
    avatar: '💳'
  },
  {
    id: 'sa-5',
    name: 'Zara Kim',
    username: 'marketing_admin',
    email: 'marketing@zenwar.com',
    phone: '+1 (555) 500-4004',
    password: 'Mkt@1234',
    role: 'marketing',
    permissions: {
      dashboard: true, businesses: false, permissions: false, staff: false,
      subscriptions: false, builder: true, revenue: false, payments: false,
      notifications: true, activityLogs: false, security: false, settings: false, adminUsers: false
    },
    status: 'Active',
    createdAt: '2025-05-01',
    lastLogin: '2026-05-24T12:00:00Z',
    avatar: '📢'
  }
];

export const seedSaAnnouncements: SaAnnouncement[] = [
  { id: 'sa-a-1', title: 'System-wide Upgrade v2.4.0', message: 'Zenwar will undergo scheduled system upgrades on May 29, 2026, from 02:00 AM to 04:00 AM IST.', date: '2026-05-24', target: 'all', type: 'maintenance' },
  { id: 'sa-a-2', title: 'SMS Credit Topup Promotions', message: 'Enjoy 15% bonus credits on all SMS packages purchased before June 1st.', date: '2026-05-25', target: 'starter', type: 'announcement' }
];

export const seedSaAuditLogs: SaAuditLog[] = [
  { id: 'log-1', action: 'Business Suspended', adminUser: 'SuperAdmin (Mark)', target: 'Metro Car Care (w-3)', timestamp: '2026-05-25T14:22:00Z', ipAddress: '192.168.1.45', device: 'Chrome / Windows 11' },
  { id: 'log-2', action: 'Permission Matrix Edit', adminUser: 'SuperAdmin (Mark)', target: 'Accountant Role (Billing view: true)', timestamp: '2026-05-25T10:10:00Z', ipAddress: '192.168.1.45', device: 'Safari / macOS' },
  { id: 'log-3', action: 'Subscription Upgraded', adminUser: 'Billing System', target: 'Elite Motors (w-4) Starter -> Enterprise', timestamp: '2026-05-24T18:45:00Z', ipAddress: '54.210.12.89', device: 'Internal Cron Worker' }
];

export const seedSaBackups: SaBackup[] = [
  { id: 'bak-1', name: 'zenwar_backup_daily_2026_05_24.sql', dateCreated: '2026-05-24T00:00:00Z', sizeKb: 1420, version: 'v2.3.9' },
  { id: 'bak-2', name: 'zenwar_backup_daily_2026_05_25.sql', dateCreated: '2026-05-25T00:00:00Z', sizeKb: 1452, version: 'v2.4.0' }
];

export const defaultany: any = {
  theme: {
    primaryColor: '#00f0ff',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#08090d',
    textColor: '#f3f4f6',
    fontFamily: 'Inter',
    accentColor: '#ff5e00',
    gradientStart: '#00f0ff',
    gradientEnd: '#8b5cf6',
    cardBg: '#121422'
  },
  seo: {
    title: 'Zenwar - Advanced Business & Billing Management Software',
    description: 'Zenwar is the ultimate SaaS business management ecosystem built for auto garages, retail stores, pharmacies, bakeries, and more.',
    keywords: 'mechanic billing software, business management software, business invoice software, auto repair CRM'
  },
  sections: [
    {
      id: 'navbar',
      type: 'navbar',
      visible: true,
      content: {
        logo: '⚡',
        title: 'Zenwar',
        ctaText: 'Get Started',
        links: [
          { label: 'Features', target: 'features' },
          { label: 'Pricing', target: 'pricing' },
          { label: 'Testimonials', target: 'testimonials' },
          { label: 'FAQ', target: 'faq' },
          { label: 'Contact', target: 'contact' }
        ]
      }
    },
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      badge: 'Empowering Next-Gen Businesses',
      title: 'Run Any Business Smarter With Zenwar',
      subtitle: 'Billing, Inventory, Staff Management, CRM, Reports and Analytics for every type of business.',
      content: {
        banners: [
          {
            id: 'banner1',
            title: 'Run Any Business Smarter With Zenwar',
            subtitle: 'Billing, Inventory, Staff Management, CRM, Reports and Analytics for every type of business.',
            image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=1200',
            cta1: 'Start Free Trial',
            cta2: 'See Features'
          },
          {
            id: 'banner2',
            title: 'Smart Billing & GST Invoicing',
            subtitle: 'Generate beautiful invoices in seconds across multiple industries.',
            image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200',
            cta1: 'Explore Billing',
            cta2: 'View Demo'
          },
          {
            id: 'banner3',
            title: 'Customer & Staff Management',
            subtitle: 'Track team performance and customer loyalty effortlessly.',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200',
            cta1: 'Get Started',
            cta2: 'Learn More'
          }
        ]
      }
    },
    {
      id: 'features',
      type: 'features',
      visible: true,
      title: 'Engineered For High-Performance Shops',
      subtitle: 'All the tools required to run your billing, mechanics work, scheduling, and invoicing seamlessly.',
      content: {
        items: [
          { title: 'Smart GST Billing', desc: 'Generate compliance invoices, thermal bills, and send instant WhatsApp alerts in 3 clicks.', icon: 'Zap' },
          { title: 'Live Job Cards', desc: 'Track repairs from diagnostic phase to QA, assign techs, check checklists, and snap photos.', icon: 'Wrench' },
          { title: 'Stock & Inventory Control', desc: 'Automatic stock deductions upon billing, low stock alerts, barcode scanning, and supplier ledger.', icon: 'Sliders' },
          { title: 'Mechanic Workboard', desc: 'Monitor payroll, log attendance, track repair efficiency metrics, and assign daily checkouts.', icon: 'Users' },
          { title: 'Service Reminders', desc: 'Send automatic WhatsApp alerts for oil changes, tuning slots, and safety inspection appointments.', icon: 'BellRing' },
          { title: 'Revenue Analytics', desc: 'Generate expense records, profit & loss sheets, and chart monthly growth with exports.', icon: 'TrendingUp' }
        ]
      }
    },
    {
      id: 'about',
      type: 'about',
      visible: false,
      title: 'Revving Up Business Efficiency Worldwide',
      subtitle: 'Our mission is to equip independent garages with enterprise-grade cloud tools.',
      content: {
        text: 'Zenwar started as a simple invoicing tool for bike shops and evolved into an all-in-one SaaS trusted by over 10,000 mechanics. We believe in visual clarity, high efficiency, and zero paper trail waste.'
      }
    },
    {
      id: 'statistics',
      type: 'statistics',
      visible: false,
      title: 'Performance Metrics In Numbers',
      content: {
        items: [
          { label: 'Businesses Powered', value: '10,000+' },
          { label: 'Invoices Generated', value: '2.5M+' },
          { label: 'Active Mechanics', value: '45k+' },
          { label: 'System Uptime', value: '99.99%' }
        ]
      }
    },
    {
      id: 'screenshots',
      type: 'screenshots',
      visible: false,
      title: 'Take A Look Under The Hood',
      content: {
        items: [
          { title: 'Dashboard Analytics', url: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=1200' },
          { title: 'Billing Center', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200' }
        ]
      }
    },
    {
      id: 'cta',
      type: 'cta',
      visible: true,
      title: 'Ready to Supercharge Your Business?',
      subtitle: 'Get started today. No credit card required. Start your free trial on all premium tiers.',
      content: {
        ctaText: 'Start Free Trial'
      }
    },
    {
      id: 'pricing',
      type: 'pricing',
      visible: true,
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the roadmap corresponding to your business scale. Save 20% on yearly plans.'
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      visible: true,
      title: 'Trusted By Elite Businesses',
      subtitle: 'Hear what business owners are saying about migrating their operations to Zenwar.',
      content: {
        items: [
          { name: 'Anil Sharma', role: 'Owner, Sharma Auto Care', text: 'We saw a 35% reduction in billing times and eliminated spare parts leakages within 2 weeks of using Zenwar. The GST invoice builder is remarkably fast!', avatar: 'AS' },
          { name: 'Jason Pinto', role: 'Founder, Motorworks Hub', text: 'Managing mechanics and assignment checkouts used to be a nightmare of chalkboards and papers. Now my mechanics log in directly, view assigned lists, and tick off checkers instantly.', avatar: 'JP' },
          { name: 'Meera Kapoor', role: 'Director, Apex Superbikes Hub', text: 'Automatic WhatsApp integration helps us send invoices and service reminders with a click. Customers love the transparent estimated costs and before/after details.', avatar: 'MK' }
        ]
      }
    },
    {
      id: 'faq',
      type: 'faq',
      visible: true,
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our business CRM suite.',
      content: {
        items: [
          { q: 'Do I need dedicated scanners for barcodes?', a: 'No! Zenwar has a built-in barcode scanner UI designed to work directly with standard laptop/tablet webcams and phone cameras.' },
          { q: 'How does the GST invoicing system compute taxes?', a: 'The billing system auto-calculates SGST and CGST percentages (e.g. 9% + 9% for 18% tax categories) based on components selected, applying custom discount multipliers before taxes.' },
          { q: 'Is the data persistent if I close the browser?', a: 'Yes, our sandbox prototype maintains a complete virtual database inside your browser\'s Local Storage, meaning all your added cards, invoices, and updates persist securely.' },
          { q: 'Can I print receipts to regular printers?', a: 'Absolutely. The billing screen features a professional full-page A4 Invoice format and printable layout, with direct PDF download integration.' }
        ]
      }
    },
    {
      id: 'contact',
      type: 'contact',
      visible: true,
      title: 'Connect With Our Team',
      subtitle: 'Need a custom enterprise setup or have queries? Send us a message.',
      content: {
        ctaText: 'Send Message'
      }
    },
    {
      id: 'footer',
      type: 'footer',
      visible: true,
      content: {
        logo: '⚡',
        title: 'Zenwar',
        text: '© 2026 Zenwar. All rights reserved. Smart Business & Billing Management.',
        links: [
          { label: 'Privacy Policy', url: '#' },
          { label: 'Terms of Service', url: '#' },
          { label: 'Documentation', url: '#' }
        ]
      }
    }
  ]
};

// SaaS Super Admin Payments & Configurations
export interface SaPayment {
  id: string;
  tenantDomain: string;
  businessName: string;
  businessType?: BusinessType;
  planId: string;
  planName: string;
  billingPeriod: 'monthly' | 'yearly';
  amount: number;
  paymentMethod: 'UPI' | 'Razorpay' | 'Card' | 'Net Banking' | 'Trial';
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  transactionId?: string;
  upiId?: string;
  paymentType?: 'onboarding' | 'renewal';
  taxAmount?: number;
}




export interface HeroBanner {
  id: string;
  name: string;
  imageUrl: string;
  mediaId?: string;
  order: number;
  action?: HeroBannerAction;
  active: boolean;
}

export interface BranchDirectoryMapSettings {
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  defaultCenter: { lat: number; lng: number };
  autoFitBranches: boolean;
  showLabels: boolean;
  showBranchNumbers: boolean;
  showClusterPins: boolean;
  enableFullscreen: boolean;
  enableStreetView: boolean;
  enableUserLocation: boolean;
  mapTheme: 'light' | 'dark' | 'satellite';
}

export interface BranchLocation {
  id: string;
  name: string;
  branchCode: string;
  district: string;
  state: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  businessStatus: 'Open' | 'Closed';
  imageUrl?: string;
  pinColor?: string;
  pinIcon?: string;
  branchLogo?: string;
  numberBadge?: string;
  activeColor?: string;
  hoverAnimation?: boolean;
  active: boolean;
  order: number;
  link?: string;
}

export interface BranchDirectoryConfig {
  branches: BranchLocation[];
  mapSettings: BranchDirectoryMapSettings;
}

export interface SaPaymentSettings {
  razorpayKeyId: string;
  razorpaySecretKey: string;
  razorpayTestMode: boolean;
  razorpayWebhookUrl: string;
  razorpayWebhookSecret: string;
  razorpayCurrency: string;
  razorpayEnabled: boolean;
  upiId: string;
  upiHolderName: string;
  upiEnabled: boolean;
  activeMethods: ('UPI' | 'Razorpay' | 'Card' | 'Net Banking')[];
  trialEnabled: boolean;
  trialDays: number;
  autoVerification: boolean;
  pollingInterval: number;
  taxRatePercent: number;
  taxInvoicePrefix: string;
}

// Sandbox Demo Business Seeding
export const demoWorkshopProfile = {
  id: 'w-demo',
  name: 'Zenwar Demo',
  tenantDomain: 'DEMO001',
  ownerName: 'Demo Manager',
  email: 'demo@zenwar.co',
  phone: '+91 99999 88888',
  planId: 'enterprise',
  status: 'Active' as const,
  registeredDate: '2026-05-01',
  activeUsers: 5,
  branches: 1,
  logoUrl: '⚡',
  brandColor: '#00f0ff',
  smsCredits: 1000,
  whatsappCredits: 1000,
  usage: {
    storageMb: 140,
    storageLimit: 10240,
    invoicesCount: 5,
    invoicesLimit: 10000
  },
  username: 'demo_user',
  password: 'demo_password',
  gstNumber: '27AAAAA1111A1Z1',
  loginAccessDisabled: false
};

export const demoSeedMechanics: Mechanic[] = [
  { id: 'dm-1', name: 'Johnathan Admin', role: 'Business Admin', rating: 4.8, attendance: 'Present', salary: 45000, efficiency: 95, tasksAssigned: 1, phone: '+91 98765 43211', avatar: '👨‍💼', username: 'demo_admin', password: 'password' },
  { id: 'dm-2', name: 'Sarah Ledger', role: 'Accountant', rating: 4.9, attendance: 'Present', salary: 35000, efficiency: 98, tasksAssigned: 0, phone: '+91 98765 43212', avatar: '👩‍💼', username: 'demo_accountant', password: 'password' },
  { id: 'dm-3', name: 'Mike Grease', role: 'Senior Engine Tech', rating: 4.7, attendance: 'Present', salary: 30000, efficiency: 92, tasksAssigned: 4, phone: '+91 98765 43213', avatar: '🔧', username: 'demo_mechanic', password: 'password' },
  { id: 'dm-4', name: 'Lily Frontdesk', role: 'Receptionist', rating: 4.6, attendance: 'Late', salary: 22000, efficiency: 89, tasksAssigned: 0, phone: '+91 98765 43214', avatar: '👩‍💻', username: 'demo_receptionist', password: 'password' },
  { id: 'dm-5', name: 'Bob Stocker', role: 'Manager', rating: 4.7, attendance: 'Present', salary: 28000, efficiency: 90, tasksAssigned: 0, phone: '+91 98765 43215', avatar: '📦', username: 'demo_inventory', password: 'password' }
].map(item => ({ ...item, businessId: 'w-demo', tenantDomain: 'DEMO001', createdBy: 'Super Admin', profilePhoto: '' })) as Mechanic[];

export const demoSeedInventory: InventoryItem[] = [
  { id: 'dp-1', name: 'Castrol EDGE 5W-40', category: 'Lubricants', stock: 50, threshold: 10, price: 1200, location: 'Shelf A-1', barcode: '890105230001', supplier: 'Castrol Distributor', brand: 'Castrol', sku: 'CAS-5W40-ED', hsnCode: '34039900', unitType: 'liter', purchasePrice: 850, gstRate: 18, description: 'High performance fully synthetic engine oil.' },
  { id: 'dp-2', name: 'Ceramic Brake Pads Set', category: 'Spares', stock: 15, threshold: 5, price: 3500, location: 'Shelf B-2', barcode: '890105230002', supplier: 'Brembo India', brand: 'Brembo', sku: 'BREM-BP-CER-D', hsnCode: '68138100', unitType: 'set', purchasePrice: 2200, gstRate: 18, description: 'Brembo ceramic low-dust pads.' },
  { id: 'dp-3', name: 'Meyle Performance Air Filter', category: 'Filters', stock: 25, threshold: 8, price: 800, location: 'Shelf C-1', barcode: '890105230003', supplier: 'Meyle Spares', brand: 'Meyle', sku: 'MEY-AF-001', hsnCode: '84213100', unitType: 'piece', purchasePrice: 500, gstRate: 18, description: 'Heavy duty high air-flow replacement filter.' },
  { id: 'dp-4', name: 'Exide Mile XL 12V Battery', category: 'Electrical', stock: 8, threshold: 3, price: 5500, location: 'Grid D', barcode: '890105230004', supplier: 'Exide Retail', brand: 'Exide', sku: 'EXI-12V-XL', hsnCode: '85071000', unitType: 'piece', purchasePrice: 3800, gstRate: 28, description: 'Zero maintenance lead acid battery.' },
  { id: 'dp-5', name: 'Michelin Pilot Sport 4S', category: 'Spares', stock: 12, threshold: 4, price: 12000, location: 'Tyre Rack A', barcode: '890105230005', supplier: 'Michelin India', brand: 'Michelin', sku: 'MIC-PS4S-18', hsnCode: '40111000', unitType: 'piece', purchasePrice: 9000, gstRate: 28, description: 'Premium ultra-high performance tyre.' },
  { id: 'dp-6', name: 'WD-40 Multi-Use Spray', category: 'Lubricants', stock: 40, threshold: 10, price: 450, location: 'Shelf A-3', barcode: '890105230006', supplier: 'WD-40 Distribution', brand: 'WD-40', sku: 'WD40-SP-400', hsnCode: '34039900', unitType: 'piece', purchasePrice: 300, gstRate: 18, description: 'Anti-rust lubricant spray.' },
  { id: 'dp-7', name: 'NGK Iridium Spark Plug', category: 'Spares', stock: 60, threshold: 15, price: 650, location: 'Shelf D-1', barcode: '890105230007', supplier: 'NGK Spares Ltd', brand: 'NGK', sku: 'NGK-IR-SP', hsnCode: '85111000', unitType: 'piece', purchasePrice: 420, gstRate: 18, description: 'NGK Iridium alloy long life spark plug.' }
].map(item => ({ ...item, businessId: 'w-demo', tenantDomain: 'DEMO001', createdBy: 'Super Admin', role: 'admin' })) as InventoryItem[];

export const demoSeedCustomers: Customer[] = [
  { id: 'dc-1', name: 'Vijay Mallya', phone: '9820098200', email: 'vijay@mallya.com', loyaltyPoints: 450, vehicles: [{ id: 'dv-1', make: 'Mercedes-Benz', model: 'S-Class', plateNumber: 'MH-01-VM-1', year: 2022 }] },
  { id: 'dc-2', name: 'Sachin Tendulkar', phone: '9910099100', email: 'sachin@master.com', loyaltyPoints: 120, vehicles: [{ id: 'dv-2', make: 'BMW', model: 'M5 Competition', plateNumber: 'MH-12-ST-10', year: 2023 }] },
  { id: 'dc-3', name: 'MS Dhoni', phone: '9710097100', email: 'dhoni@csk.com', loyaltyPoints: 340, vehicles: [{ id: 'dv-3', make: 'Hummer', model: 'H2', plateNumber: 'JH-01-MSD-7', year: 2018 }] },
  { id: 'dc-4', name: 'Virat Kohli', phone: '9610096100', email: 'virat@king.com', loyaltyPoints: 50, vehicles: [{ id: 'dv-4', make: 'Audi', model: 'RS e-tron GT', plateNumber: 'DL-01-VK-18', year: 2023 }] }
].map(item => ({ ...item, businessId: 'w-demo', tenantDomain: 'DEMO001', createdBy: 'Super Admin', role: 'admin' })) as Customer[];

export const demoSeedJobCards: JobCard[] = [
  {
    id: 'djc-1001',
    customerId: 'dc-2',
    customerName: 'Sachin Tendulkar',
    phone: '9910099100',
    vehicleId: 'dv-2',
    vehicleMake: 'BMW',
    vehicleModel: 'M5 Competition',
    plateNumber: 'MH-12-ST-10',
    complaints: ['Regular 10k Oil Service', 'Check coolant leakage', 'Top up engine fluid'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-1', label: 'Engine Oil Checked & Flushed', checked: true },
      { id: 'dchk-2', label: 'Oil Filter Replaced', checked: true },
      { id: 'dchk-3', label: 'Coolant Hose Tightening', checked: true },
      { id: 'dchk-4', label: 'Fluid Levels Checked', checked: false }
    ],
    status: 'In Progress',
    dateCreated: '2026-05-27T10:30:00Z',
    deliveryDate: '2026-05-29T18:00:00Z',
    notes: 'Engine coolant hose has a slight clamp issue. Clamp tightened. Mobil 1 synthetics applied.',
    costEstimation: 6500,
    beforeImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
    afterImage: ''
  },
  {
    id: 'djc-1002',
    customerId: 'dc-1',
    customerName: 'Vijay Mallya',
    phone: '9820098200',
    vehicleId: 'dv-1',
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'S-Class',
    plateNumber: 'MH-01-VM-1',
    complaints: ['Brake squealing noise', 'Replace front brake pads', 'Check brake fluid water content'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-5', label: 'Remove Front Wheels', checked: true },
      { id: 'dchk-6', label: 'Brake Pad Replacement', checked: false },
      { id: 'dchk-7', label: 'Caliper Grease Application', checked: false },
      { id: 'dchk-8', label: 'Fluid Quality Test', checked: true }
    ],
    status: 'Diagnosing',
    dateCreated: '2026-05-27T14:15:00Z',
    deliveryDate: '2026-05-28T19:00:00Z',
    notes: 'Brake fluid shows < 1% moisture, pads are worn out. Front rotors are slightly scored.',
    costEstimation: 12000,
    beforeImage: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=400',
    afterImage: ''
  },
  {
    id: 'djc-1003',
    customerId: 'dc-3',
    customerName: 'MS Dhoni',
    phone: '9710097100',
    vehicleId: 'dv-3',
    vehicleMake: 'Hummer',
    vehicleModel: 'H2',
    plateNumber: 'JH-01-MSD-7',
    complaints: ['Check Engine Light is ON', 'Rough idle on cold start'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-9', label: 'OBD2 Scanner Run', checked: true },
      { id: 'dchk-10', label: 'Clean Throttle Body', checked: true },
      { id: 'dchk-11', label: 'Spark Plugs Check', checked: true }
    ],
    status: 'Ready',
    dateCreated: '2026-05-26T08:15:00Z',
    deliveryDate: '2026-05-27T17:00:00Z',
    notes: 'Error code P0300 (Random Misfire) resolved. Replaced spark plugs and cleaned throttle body carbon deposits.',
    costEstimation: 8500,
    beforeImage: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'djc-1004',
    customerId: 'dc-4',
    customerName: 'Virat Kohli',
    phone: '9610096100',
    vehicleId: 'dv-4',
    vehicleMake: 'Audi',
    vehicleModel: 'RS e-tron GT',
    plateNumber: 'DL-01-VK-18',
    complaints: ['Full body foam wash', 'Interior vacuuming and detailing', 'Leather seat conditioning'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-12', label: 'Foam Wash', checked: true },
      { id: 'dchk-13', label: 'Interior Detailing', checked: true },
      { id: 'dchk-14', label: 'Leather Conditioning', checked: true }
    ],
    status: 'Delivered',
    dateCreated: '2026-05-26T09:00:00Z',
    deliveryDate: '2026-05-26T16:00:00Z',
    notes: 'Premium detailing package complete. Exterior wax coating added.',
    costEstimation: 3500,
    beforeImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'djc-1005',
    customerId: 'dc-1',
    customerName: 'Vijay Mallya',
    phone: '9820098200',
    vehicleId: 'dv-1',
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'S-Class',
    plateNumber: 'MH-01-VM-1',
    complaints: ['Car pulling to left at highway speeds', 'Steering wheel off-center'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-15', label: '4-Wheel Laser Alignment', checked: true },
      { id: 'dchk-16', label: 'Tyre Pressure Check', checked: true },
      { id: 'dchk-17', label: 'Suspension Inspection', checked: true }
    ],
    status: 'Ready',
    dateCreated: '2026-05-27T11:00:00Z',
    deliveryDate: '2026-05-28T12:00:00Z',
    notes: 'Completed laser wheel alignment. Toe and camber angles adjusted back to Mercedes factory values.',
    costEstimation: 2500,
    beforeImage: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=400',
    afterImage: ''
  },
  {
    id: 'djc-1006',
    customerId: 'dc-4',
    customerName: 'Virat Kohli',
    phone: '9610096100',
    vehicleId: 'dv-4',
    vehicleMake: 'Audi',
    vehicleModel: 'RS e-tron GT',
    plateNumber: 'DL-01-VK-18',
    complaints: ['AC blower not blowing cold air', 'Musty odor when turning on AC'],
    assignedMechanicId: 'dm-3',
    checklist: [
      { id: 'dchk-18', label: 'AC Gas Level Check', checked: true },
      { id: 'dchk-19', label: 'Cabin Filter Replacement', checked: false },
      { id: 'dchk-20', label: 'Evaporator Core Clean', checked: true }
    ],
    status: 'Quality Check',
    dateCreated: '2026-05-26T14:30:00Z',
    deliveryDate: '2026-05-27T16:00:00Z',
    notes: 'AC condenser cleaned, refrigerant gas topped up. Cabin filter needs replacement (waiting for approval).',
    costEstimation: 9500,
    beforeImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400',
    afterImage: ''
  }
].map(item => ({ ...item, businessId: 'w-demo', tenantDomain: 'DEMO001', createdBy: 'Super Admin', role: 'admin' })) as JobCard[];

export const demoSeedInvoices: Invoice[] = [
  {
    id: 'dinv-1001',
    invoiceNumber: 'DEMO-2026-1001',
    customerId: 'dc-2',
    customerName: 'Sachin Tendulkar',
    phone: '9910099100',
    vehiclePlate: 'MH-12-ST-10',
    date: '2026-05-20',
    items: [
      { id: 'di-1', name: 'Castrol EDGE 5W-40', quantity: 4, price: 1200, type: 'part', gstRate: 18, productId: 'dp-1' },
      { id: 'di-2', name: 'Meyle Performance Air Filter', quantity: 1, price: 800, type: 'part', gstRate: 18, productId: 'dp-3' },
      { id: 'di-3', name: 'Oil Filter & Spark Plug Labor', quantity: 1, price: 1500, type: 'labor', gstRate: 18 }
    ],
    subtotal: 7100,
    gstAmount: 1278,
    discount: 500,
    total: 7878,
    paymentMethod: 'Card',
    isPaid: true,
    status: 'Paid',
    businessId: 'w-demo',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  },
  {
    id: 'dinv-1002',
    invoiceNumber: 'DEMO-2026-1002',
    customerId: 'dc-1',
    customerName: 'Vijay Mallya',
    phone: '9820098200',
    vehiclePlate: 'MH-01-VM-1',
    date: '2026-05-24',
    items: [
      { id: 'di-4', name: 'Ceramic Brake Pads Set', quantity: 1, price: 3500, type: 'part', gstRate: 18, productId: 'dp-2' },
      { id: 'di-5', name: 'Michelin Pilot Sport 4S', quantity: 4, price: 12000, type: 'part', gstRate: 28, productId: 'dp-5' },
      { id: 'di-6', name: 'High Speed Balancing & Caliper Overhaul', quantity: 1, price: 4000, type: 'labor', gstRate: 18 }
    ],
    subtotal: 55500,
    gstAmount: 14780,
    discount: 0,
    total: 70280,
    paymentMethod: 'UPI',
    isPaid: true,
    status: 'Paid',
    businessId: 'w-demo',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  },
  {
    id: 'dinv-1003',
    invoiceNumber: 'DEMO-2026-1003',
    customerId: 'dc-3',
    customerName: 'MS Dhoni',
    phone: '9710097100',
    vehiclePlate: 'JH-01-MSD-7',
    date: '2026-05-25',
    items: [
      { id: 'di-7', name: 'NGK Iridium Spark Plug', quantity: 4, price: 650, type: 'part', gstRate: 18, productId: 'dp-7' },
      { id: 'di-8', name: 'Engine Diagnostics and Scanner Labor', quantity: 1, price: 2500, type: 'labor', gstRate: 18 }
    ],
    subtotal: 5100,
    gstAmount: 918,
    discount: 0,
    total: 6018,
    paymentMethod: 'UPI',
    isPaid: false,
    status: 'Pending',
    businessId: 'w-demo',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  },
  {
    id: 'dinv-1004',
    invoiceNumber: 'DEMO-2026-1004',
    customerId: 'dc-4',
    customerName: 'Virat Kohli',
    phone: '9610096100',
    vehiclePlate: 'DL-01-VK-18',
    date: '2026-05-26',
    items: [
      { id: 'di-9', name: 'WD-40 Multi-Use Spray', quantity: 1, price: 450, type: 'part', gstRate: 18, productId: 'dp-6' },
      { id: 'di-10', name: 'Foam Wash & Detailing Services', quantity: 1, price: 3000, type: 'labor', gstRate: 18 }
    ],
    subtotal: 3450,
    gstAmount: 621,
    discount: 200,
    total: 3871,
    paymentMethod: 'UPI',
    isPaid: true,
    status: 'Paid',
    businessId: 'w-demo',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  },
  {
    id: 'dinv-1005',
    invoiceNumber: 'DEMO-2026-1005',
    customerId: 'dc-3',
    customerName: 'MS Dhoni',
    phone: '9710097100',
    vehiclePlate: 'JH-01-MSD-7',
    date: '2026-05-27',
    items: [
      { id: 'di-11', name: 'Exide Mile XL 12V Battery', quantity: 1, price: 5500, type: 'part', gstRate: 28, productId: 'dp-4' },
      { id: 'di-12', name: 'Battery Install & Charging Check', quantity: 1, price: 800, type: 'labor', gstRate: 18 }
    ],
    subtotal: 6300,
    gstAmount: 1684,
    discount: 300,
    total: 7684,
    paymentMethod: 'Cash',
    isPaid: true,
    status: 'Paid',
    businessId: 'w-demo',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  }
];

export const demoSeedInventoryHistory: InventoryHistory[] = [
  {
    id: 'dhist-1',
    productId: 'dp-1',
    productName: 'Castrol EDGE 5W-40 Advanced Full Synthetic Motor Oil',
    sku: 'CAS-EDGE-5W40',
    changeType: 'Import',
    quantityChange: 48,
    newStockLevel: 48,
    date: '2026-05-15T10:00:00Z',
    notes: 'Initial stock import from vendor',
    tenantDomain: 'DEMO001',
    createdBy: 'System'
  },
  {
    id: 'dhist-2',
    productId: 'dp-1',
    productName: 'Castrol EDGE 5W-40 Advanced Full Synthetic Motor Oil',
    sku: 'CAS-EDGE-5W40',
    changeType: 'Invoice Sold',
    quantityChange: -4,
    newStockLevel: 44,
    date: '2026-05-20T11:30:00Z',
    notes: 'Sold on Invoice DEMO-2026-1001',
    tenantDomain: 'DEMO001',
    createdBy: 'Sarah Ledger'
  }
];

export const seedPendingRegistrations: PendingRegistration[] = [];


export const demoBanners: HeroBanner[] = [
  {
    id: 'banner-1',
    name: 'Main Banner',
    imageUrl: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80',
    order: 0,
    active: true
  }
];

export const demoBranches: BranchLocation[] = [
  {
    id: 'branch-1',
    name: 'Chennai Headquarters',
    branchCode: 'CHN-HQ',
    district: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    address: '123 Anna Salai, Chennai, TN',
    lat: 13.0827,
    lng: 80.2707,
    contactPerson: 'Arun Kumar',
    mobile: '+91 9876543210',
    whatsapp: '+91 9876543210',
    email: 'chennai@zenwar.com',
    workingHours: '9 AM - 6 PM',
    businessStatus: 'Open',
    active: true,
    order: 0,
    pinColor: '#00f0ff',
  },
  {
    id: 'branch-2',
    name: 'Salem Service Center',
    branchCode: 'SLM-01',
    district: 'Salem',
    state: 'Tamil Nadu',
    country: 'India',
    address: '45 Omalur Main Rd, Salem, TN',
    lat: 11.6643,
    lng: 78.1460,
    contactPerson: 'Suresh Menon',
    mobile: '+91 9876543211',
    whatsapp: '+91 9876543211',
    email: 'salem@zenwar.com',
    workingHours: '9 AM - 6 PM',
    businessStatus: 'Open',
    active: true,
    order: 1,
    pinColor: '#ff0055',
  },
  {
    id: 'branch-3',
    name: 'Bengaluru Hub',
    branchCode: 'BLR-01',
    district: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    address: '78 MG Road, Bengaluru, KA',
    lat: 12.9716,
    lng: 77.5946,
    contactPerson: 'Ramesh Reddy',
    mobile: '+91 9876543212',
    whatsapp: '+91 9876543212',
    email: 'blr@zenwar.com',
    workingHours: '9 AM - 7 PM',
    businessStatus: 'Open',
    active: true,
    order: 2,
    pinColor: '#00ffaa',
  }
];

export const demoBranchDirectoryConfig: BranchDirectoryConfig = {
  branches: demoBranches,
  mapSettings: {
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 18,
    defaultCenter: { lat: 20.5937, lng: 78.9629 }, // Center of India
    autoFitBranches: true,
    showLabels: true,
    showBranchNumbers: false,
    showClusterPins: true,
    enableFullscreen: true,
    enableStreetView: false,
    enableUserLocation: true,
    mapTheme: 'dark',
  }
};

export const demoPricing: PricingPlan[] = seedSubscriptionPlans.map((p, i) => ({
  id: p.id,
  name: p.name,
  monthlyPrice: p.priceMonthly,
  yearlyPrice: p.priceYearly,
  description: p.businessType || 'For standard business needs',
  features: p.features,
  userLimit: p.maxUsers > 100 ? 'Unlimited' : String(p.maxUsers),
  storage: p.maxStorageMb > 100000 ? 'Unlimited' : `${p.maxStorageMb}MB`,
  businessLimit: '1',
  trialDays: p.trialDays,
  buttonText: 'Get Started',
  highlightPlan: p.isPopular || false,
  badge: p.badge || '',
  order: i,
  active: p.enabled || false
}));


export const demoContactPageConfig: ContactPageConfig = {
  companyName: 'Zenwar Business Suite',
  supportEmail: 'support@zenwar.in',
  salesEmail: 'sales@zenwar.in',
  accountsEmail: 'accounts@zenwar.in',
  technicalSupportEmail: 'tech@zenwar.in',
  mobileNumber: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  officeAddress: '123 Business Avenue, Tech Park, India',
  workingHours: 'Mon - Fri, 9:00 AM - 6:00 PM',
  emergencyContact: '+91 99999 00000',
  googleMapLink: 'https://maps.google.com/?q=india',
  socialMedia: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
  supportImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
  backgroundBanner: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80',
  active: true
};

export const demoContactTeam: ContactTeamMember[] = [
  {
    id: 'ct1',
    name: 'Eswaran MS',
    designation: 'Founder',
    department: 'Management',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'eswaran@zenwar.in',
    availability: 'Online',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    order: 1,
    active: true
  }
];


export const demoFeaturesPageConfig: FeaturesPageConfig = {
  title: 'Powerful Business Features',
  subtitle: 'Everything you need to manage your multi-branch operations efficiently.',
  backgroundImage: '',
  active: true
};

export const demoPricingPageConfig: PricingPageConfig = {
  title: 'Choose Your Plan',
  subtitle: 'Transparent pricing for businesses of all sizes. No hidden fees.',
  backgroundImage: '',
  active: true
};
export const demoAboutPageConfig: AboutPageConfig = {
  heroBanner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  heroBgImage: '',
  aboutTitle: 'Empowering Mechanics Nationwide',
  companyDescription: 'Zenwar Business Suite is the ultimate all-in-one software designed specifically for modern auto repair shops and mechanic businesses.',
  companyImage: '',
  history: 'Founded in 2020, we started with a simple vision: to eliminate the paperwork that slows down talented mechanics.',
  mission: 'To provide accessible, powerful, and easy-to-use digital tools for the automotive repair industry.',
  missionImage: '',
  vision: 'A future where every mechanic shop operates at peak efficiency through intelligent software.',
  visionImage: '',
  ceoMessage: 'We built Zenwar because we saw how hard mechanics work, and how much time they lose to administrative tasks.',
  ceoPhoto: '',
  coreValues: [
    { id: '1', title: 'Innovation', description: 'Always moving forward', iconUrl: '', order: 1, active: true },
    { id: '2', title: 'Reliability', description: 'Software you can trust', iconUrl: '', order: 2, active: true }
  ],
  statistics: [
    { label: 'Active Shops', value: '5,000+' },
    { label: 'Invoices Generated', value: '2M+' },
    { label: 'Support Uptime', value: '99.9%' }
  ],
  gallery: [],
  officeImages: {
    exterior: '',
    interior: '',
    reception: '',
    meetingRoom: '',
    teamPhotos: []
  },
  achievements: {
    awards: [],
    certificates: [],
    eventPhotos: []
  },
  backgroundImage: '',
  videoLink: 'https://youtube.com/watch?v=demo',
  active: true,
  timeline: [],
  leadership: []
};
export const demoBrandingConfig: BrandingConfig = {
  logoUrl: '/logo.png', // Temporary placeholder until upload
  lightLogoUrl: '/logo.png',
  darkLogoUrl: '/logo.png',
  faviconUrl: '/logo.png',
  appIconUrl: '/logo.png',
  emailLogoUrl: '/logo.png',
};

export interface AuthSettings {
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  authorizedOrigin: string;
  authorizedRedirect: string;
  emailEnabled: boolean;
  microsoftEnabled: boolean;
  appleEnabled: boolean;
  facebookEnabled: boolean;
}

export const demoAuthSettings: AuthSettings = {
  googleEnabled: false,
  googleClientId: '',
  googleClientSecret: '',
  authorizedOrigin: 'http://localhost:5173',
  authorizedRedirect: 'http://localhost:5173/auth/google/callback',
  emailEnabled: true,
  microsoftEnabled: false,
  appleEnabled: false,
  facebookEnabled: false,
};

export const defaultWebsiteState: WebsiteState = {
  heroContent: demoHeroContent,
  heroSliderSettings: demoHeroSliderSettings,
  heroBanners: demoBanners,
  features: demoFeatures,
  pricing: demoPricing,
  testimonials: demoTestimonials,
  faqs: demoFAQs,
  contact: demoContactConfig,
  contactPage: demoContactPageConfig,
  contactTeam: demoContactTeam,
  aboutPage: demoAboutPageConfig,
  featuresPage: demoFeaturesPageConfig,
  pricingPage: demoPricingPageConfig,
  branchDirectory: demoBranchDirectoryConfig,
  branding: demoBrandingConfig,
  footer: demoFooterConfig,
  seo: demoSEOConfig,
  authSettings: demoAuthSettings
};
