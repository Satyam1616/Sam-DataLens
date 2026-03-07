export interface SalesData {
  id: number;
  date: string;
  region: string;
  country: string;
  productLine: string;
  segment: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  discount: number;
}

// Generate realistic mock enterprise dataset
const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
const countries = {
  'North America': ['USA', 'Canada'],
  'EMEA': ['Germany', 'UK', 'France'],
  'APAC': ['Japan', 'Australia', 'India'],
  'LATAM': ['Brazil', 'Mexico']
};
const products = ['DataLens Pro', 'EmbedFAST', 'MigrateFAST', 'CloudOptimize', 'SecuritySuite'];
const segments = ['Enterprise', 'Mid-Market', 'SMB'];

export const mockSalesData: SalesData[] = [];

// Seed deterministic pseudo-random data
let seed = 12345;
const random = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

let idCounter = 1;
// Generate 2 years of data (2025-2026)
for (let year = 2025; year <= 2026; year++) {
  for (let month = 1; month <= 12; month++) {
    // Generate ~10-15 records per month
    const recordsThisMonth = Math.floor(random() * 6) + 10;
    
    for (let i = 0; i < recordsThisMonth; i++) {
        const region = regions[Math.floor(random() * regions.length)];
        const countryList = countries[region as keyof typeof countries];
        const country = countryList[Math.floor(random() * countryList.length)];
        const product = products[Math.floor(random() * products.length)];
        const segment = segments[Math.floor(random() * segments.length)];
        
        // Base pricing rules
        let basePrice = 500;
        if (product === 'DataLens Pro') basePrice = 1200;
        if (product === 'SecuritySuite') basePrice = 800;

        // Enterprise buys more
        const maxUnits = segment === 'Enterprise' ? 50 : 15;
        const unitsSold = Math.floor(random() * maxUnits) + 1;
        
        // Random discount 0-20%
        const discountLevel = Math.floor(random() * 5) * 0.05; 
        
        const rawRevenue = unitsSold * basePrice;
        const discount = rawRevenue * discountLevel;
        const revenue = rawRevenue - discount;
        
        // Profit margin is roughly 40-60%
        const margin = 0.4 + (random() * 0.2);
        const profit = revenue * margin;

        const date = `${year}-${String(month).padStart(2, '0')}-${String(Math.floor(random() * 28) + 1).padStart(2, '0')}`;

        mockSalesData.push({
            id: idCounter++,
            date,
            region,
            country,
            productLine: product,
            segment,
            unitsSold: Math.round(unitsSold),
            revenue: Math.round(revenue),
            profit: Math.round(profit),
            discount: Math.round(discount)
        });
    }
  }
}

// Ensure the dataset is sorted by date
mockSalesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
