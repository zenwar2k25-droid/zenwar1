import { useDatabase } from '../context/DatabaseContext';

export interface Terminology {
  business: string;
  businesses: string;
  staff: string;
  staffs: string;
  customer: string;
  customers: string;
  order: string;
  orders: string;
  workArea: string;
  service: string;
  inventory: string;
}

export const useTerminology = () => {
  const { currentUser } = useDatabase();
  
  const businessType = (currentUser as any)?.businessType || 'Auto Workshop';

  const terminology: Record<string, Terminology> = {
    'Auto Workshop': {
      business: 'Workshop',
      businesses: 'Workshops',
      staff: 'Mechanic',
      staffs: 'Mechanics',
      customer: 'Customer',
      customers: 'Customers',
      order: 'Job Card',
      orders: 'Job Cards',
      workArea: 'Bay',
      service: 'Repair',
      inventory: 'Inventory'
    },
    'Fruit Shop': {
      business: 'Shop',
      businesses: 'Shops',
      staff: 'Staff',
      staffs: 'Staff',
      customer: 'Customer',
      customers: 'Customers',
      order: 'Sales Order',
      orders: 'Sales Orders',
      workArea: 'Counter',
      service: 'Service',
      inventory: 'Inventory'
    },
    'Sweet Stall': {
      business: 'Stall',
      businesses: 'Stalls',
      staff: 'Staff',
      staffs: 'Staff',
      customer: 'Customer',
      customers: 'Customers',
      order: 'Order Ticket',
      orders: 'Order Tickets',
      workArea: 'Counter',
      service: 'Production Batch',
      inventory: 'Inventory'
    },
    'Mobile Store': {
      business: 'Store',
      businesses: 'Stores',
      staff: 'Staff',
      staffs: 'Staff',
      customer: 'Customer',
      customers: 'Customers',
      order: 'Sales Order',
      orders: 'Sales Orders',
      workArea: 'Counter',
      service: 'Warranty Claim',
      inventory: 'Inventory'
    },
    'default': {
      business: 'Business',
      businesses: 'Businesses',
      staff: 'Staff',
      staffs: 'Staff',
      customer: 'Customer',
      customers: 'Customers',
      order: 'Order',
      orders: 'Orders',
      workArea: 'Work Area',
      service: 'Service',
      inventory: 'Inventory'
    }
  };

  return terminology[businessType as string] || terminology['default'];
};
