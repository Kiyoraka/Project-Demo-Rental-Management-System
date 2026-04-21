// seed.js — initial hardcoded data for first-run populate

const now = Date.now();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

export const SEED = {
  users: [
    { id: 'admin-1',  email: 'admin@gmail.com',  password: 'admin123', role: 'admin',  name: 'Admin User',   avatarUrl: '', createdAt: daysAgo(180) },
    { id: 'tenant-1', email: 'tenant@gmail.com', password: 'admin123', role: 'tenant', name: 'Demo Tenant',  avatarUrl: '', createdAt: daysAgo(120) },
    { id: 'tenant-2', email: 'aina@gmail.com',   password: 'pass123',  role: 'tenant', name: 'Aina Binti',   avatarUrl: '', createdAt: daysAgo(90)  },
    { id: 'tenant-3', email: 'zul@gmail.com',    password: 'pass123',  role: 'tenant', name: 'Zul Hakim',    avatarUrl: '', createdAt: daysAgo(60)  },
    { id: 'tenant-4', email: 'maria@gmail.com',  password: 'pass123',  role: 'tenant', name: 'Maria Lim',    avatarUrl: '', createdAt: daysAgo(45)  },
  ],

  rentals: [
    {
      id: 'rental-1', title: 'Mont Kiara Suite',
      description: 'Fully furnished 2-bedroom suite with pool view, gym access, and smart-home controls. Walking distance to Plaza Mont Kiara.',
      pricePerMonth: 2800, bedrooms: 2, bathrooms: 1, sqft: 780,
      location: 'Mont Kiara, KL',
      images: ['assets/img/rentals/01.jpg'],
      amenities: ['Pool', 'Gym', 'Parking', '24h Security', 'Wi-Fi'],
      status: 'occupied', createdAt: daysAgo(200),
    },
    {
      id: 'rental-2', title: 'Bangsar Loft',
      description: 'Stylish 3-bedroom loft with double-height ceilings in the heart of Bangsar. Open plan kitchen and private balcony.',
      pricePerMonth: 3400, bedrooms: 3, bathrooms: 2, sqft: 1120,
      location: 'Bangsar, KL',
      images: ['assets/img/rentals/02.jpg'],
      amenities: ['Pool', 'Gym', 'Parking', 'Concierge', 'Wi-Fi'],
      status: 'occupied', createdAt: daysAgo(190),
    },
    {
      id: 'rental-3', title: 'KLCC Studio',
      description: 'Premium studio with unobstructed Twin Towers view. Perfect for professionals seeking a prime address.',
      pricePerMonth: 4500, bedrooms: 1, bathrooms: 1, sqft: 560,
      location: 'KLCC, KL',
      images: ['assets/img/rentals/03.jpg'],
      amenities: ['Pool', 'Gym', 'Parking', 'Concierge', '24h Security', 'Wi-Fi'],
      status: 'occupied', createdAt: daysAgo(160),
    },
    {
      id: 'rental-4', title: 'Cheras Park Residence',
      description: 'Family-friendly 2-bedroom apartment near MRT Cheras. Large living room and storage room.',
      pricePerMonth: 1600, bedrooms: 2, bathrooms: 1, sqft: 820,
      location: 'Cheras, KL',
      images: ['assets/img/rentals/04.jpg'],
      amenities: ['Parking', '24h Security', 'Playground', 'Wi-Fi'],
      status: 'available', createdAt: daysAgo(120),
    },
    {
      id: 'rental-5', title: 'Damansara Heights Condo',
      description: 'Spacious 3-bedroom condominium with private garden. Quiet neighborhood with top schools nearby.',
      pricePerMonth: 3800, bedrooms: 3, bathrooms: 2, sqft: 1400,
      location: 'Damansara Heights, KL',
      images: ['assets/img/rentals/05.jpg'],
      amenities: ['Pool', 'Gym', 'Parking', 'Garden', 'Concierge'],
      status: 'occupied', createdAt: daysAgo(100),
    },
    {
      id: 'rental-6', title: 'Subang Heights Apartment',
      description: 'Affordable 2-bedroom apartment with unit renovations. Walking distance to Sunway Pyramid.',
      pricePerMonth: 1200, bedrooms: 2, bathrooms: 1, sqft: 740,
      location: 'Subang Jaya, Selangor',
      images: ['assets/img/rentals/06.jpg'],
      amenities: ['Parking', 'Wi-Fi', 'Playground'],
      status: 'available', createdAt: daysAgo(80),
    },
    {
      id: 'rental-7', title: 'Sentul Modern Studio',
      description: 'Brand-new studio near Sentul MRT. Minimalist interior with built-in wardrobes.',
      pricePerMonth: 1450, bedrooms: 1, bathrooms: 1, sqft: 500,
      location: 'Sentul, KL',
      images: ['assets/img/rentals/07.jpg'],
      amenities: ['Pool', 'Gym', 'Parking', 'Wi-Fi'],
      status: 'available', createdAt: daysAgo(40),
    },
    {
      id: 'rental-8', title: 'Petaling Jaya Family Home',
      description: 'Landed 4-bedroom family home with large garden. Great for families with young children.',
      pricePerMonth: 4200, bedrooms: 4, bathrooms: 3, sqft: 2200,
      location: 'PJ Section 17, Selangor',
      images: ['assets/img/rentals/08.jpg'],
      amenities: ['Garden', 'Parking', 'Wi-Fi'],
      status: 'available', createdAt: daysAgo(20),
    },
  ],

  tenants: [
    { id: 't-1', userId: 'tenant-1', rentalId: 'rental-1', name: 'Demo Tenant', phone: '+60 12-345 6789', moveInDate: daysAgo(30),  status: 'active' },
    { id: 't-2', userId: 'tenant-2', rentalId: 'rental-2', name: 'Aina Binti',  phone: '+60 13-222 3456', moveInDate: daysAgo(120), status: 'active' },
    { id: 't-3', userId: 'tenant-3', rentalId: 'rental-3', name: 'Zul Hakim',   phone: '+60 14-555 7788', moveInDate: daysAgo(90),  status: 'active' },
    { id: 't-4', userId: 'tenant-4', rentalId: 'rental-5', name: 'Maria Lim',   phone: '+60 17-888 1122', moveInDate: daysAgo(60),  status: 'active' },
  ],

  payments: [
    { id: 'p-1',  tenantId: 't-1', rentalId: 'rental-1', amount: 2800, method: 'Card ••4242', date: daysAgo(1),   status: 'paid', receiptNo: 'R014' },
    { id: 'p-2',  tenantId: 't-1', rentalId: 'rental-1', amount: 2800, method: 'Card ••4242', date: daysAgo(32),  status: 'paid', receiptNo: 'R010' },
    { id: 'p-3',  tenantId: 't-1', rentalId: 'rental-1', amount: 2800, method: 'Card ••4242', date: daysAgo(60),  status: 'paid', receiptNo: 'R005' },
    { id: 'p-4',  tenantId: 't-1', rentalId: 'rental-1', amount: 2800, method: 'FPX',         date: daysAgo(92),  status: 'paid', receiptNo: 'R001' },
    { id: 'p-5',  tenantId: 't-2', rentalId: 'rental-2', amount: 3400, method: 'Card ••4242', date: daysAgo(2),   status: 'paid', receiptNo: 'R013' },
    { id: 'p-6',  tenantId: 't-2', rentalId: 'rental-2', amount: 3400, method: 'Card ••4242', date: daysAgo(33),  status: 'paid', receiptNo: 'R009' },
    { id: 'p-7',  tenantId: 't-2', rentalId: 'rental-2', amount: 3400, method: 'FPX',         date: daysAgo(63),  status: 'paid', receiptNo: 'R004' },
    { id: 'p-8',  tenantId: 't-3', rentalId: 'rental-3', amount: 4500, method: 'Card ••1111', date: daysAgo(3),   status: 'paid', receiptNo: 'R012' },
    { id: 'p-9',  tenantId: 't-3', rentalId: 'rental-3', amount: 4500, method: 'Card ••1111', date: daysAgo(34),  status: 'paid', receiptNo: 'R008' },
    { id: 'p-10', tenantId: 't-3', rentalId: 'rental-3', amount: 4500, method: 'Card ••1111', date: daysAgo(65),  status: 'paid', receiptNo: 'R003' },
    { id: 'p-11', tenantId: 't-4', rentalId: 'rental-5', amount: 3800, method: 'Card ••9999', date: daysAgo(4),   status: 'paid', receiptNo: 'R011' },
    { id: 'p-12', tenantId: 't-4', rentalId: 'rental-5', amount: 3800, method: 'FPX',         date: daysAgo(35),  status: 'paid', receiptNo: 'R007' },
  ],

  notifications: [
    { id: 'n-1', type: 'system',       title: 'Welcome to RentHub Admin', message: 'Your admin console is ready. Explore tenants, rentals, and reports.', targetRole: 'admin',  read: true,  createdAt: daysAgo(30) },
    { id: 'n-2', type: 'payment',      title: 'Payment received RM 3,800', message: 'Maria Lim paid for Damansara Heights (R011).', targetRole: 'admin', read: true,  createdAt: daysAgo(4) },
    { id: 'n-3', type: 'registration', title: 'New tenant onboarded',      message: 'Maria Lim registered for Damansara Heights Condo.', targetRole: 'admin', read: true, createdAt: daysAgo(60) },
    { id: 'n-4', type: 'system',       title: 'Monthly summary',            message: '12 payments totalling RM 39,700 this month.', targetRole: 'admin', read: false, createdAt: daysAgo(2) },
    { id: 'n-5', type: 'system',       title: 'Welcome back',               message: 'Your next rent is due soon.', targetRole: 'tenant', read: false, createdAt: daysAgo(1) },
  ],

  settings: {
    companyName: 'RentHub Sdn Bhd',
    logoUrl: '',
    currency: 'RM',
    paymentGateway: {
      provider: 'Stripe',
      publicKey: 'pk_test_demo_key_1234567890',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://renthub.my/webhook',
      enabled: true,
      testMode: true,
    },
  },

  session: null,
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED));
}
