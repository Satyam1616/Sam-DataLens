import { mockSalesData, SalesData } from './data';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'metric';

export interface QueryResponse {
  query: string;
  insight: string;
  data: any[];
  chartType: ChartType;
  xAxisKey?: string;
  seriesKeys: string[];
  suggestedQuestions: string[];
}

// The SAM AI Lens Core Engine
export class DataLensEngine {
  private dataset: SalesData[];

  constructor() {
    this.dataset = mockSalesData;
  }

  // Parses natural language and maps to strict data operations
  public processQuery(nlQuery: string): QueryResponse {
    const q = nlQuery.toLowerCase();
    
    // Default fallback
    let chartType: ChartType = 'bar';
    let data: any[] = [];
    let xAxisKey = '';
    let seriesKeys: string[] = [];
    let insight = "Here is the data visualization based on your request.";
    let suggestedQuestions = [
      "Show me revenue by region",
      "What is the profit trend over time?",
      "Show sales by product line"
    ];

    try {
        // --- Intent 1: Time Series / Trend Analysis ---
        if (q.includes('trend') || q.includes('over time') || q.includes('month') || q.includes('year')) {
            chartType = 'line';
            xAxisKey = 'date';
            
            // Check metric
            const isProfit = q.includes('profit');
            const metric = isProfit ? 'profit' : 'revenue';
            seriesKeys = [metric];

            // Aggregate by month (YYYY-MM)
            const aggregated = this.dataset.reduce((acc: any, row) => {
                const month = row.date.substring(0, 7); // '2025-01'
                if (!acc[month]) acc[month] = { date: month, revenue: 0, profit: 0, units: 0 };
                acc[month].revenue += row.revenue;
                acc[month].profit += row.profit;
                acc[month].units += row.unitsSold;
                return acc;
            }, {});

            data = Object.values(aggregated);
            
            // Calculate insight
            const first = data[0];
            const last = data[data.length - 1];
            const growth = ((last[metric] - first[metric]) / first[metric] * 100).toFixed(1);
            const dir = Number(growth) > 0 ? 'increased' : 'decreased';
            
            insight = `Over the analyzed time period, total ${metric} has ${dir} by ${Math.abs(Number(growth))}%. This positive momentum indicates strong market adoption.`;
            suggestedQuestions = [
               `Show me ${metric} by region`,
               `Which product contributed most to this ${metric}?`,
               "Forecast next quarter's performance"
            ];
        } 
        
        // --- Intent 2: Categorical Distribution (Region / Country) ---
        else if (q.includes('region') || q.includes('country') || q.includes('geography')) {
            chartType = 'bar';
            const category = q.includes('country') ? 'country' : 'region';
            xAxisKey = category;
            
            const isProfit = q.includes('profit');
            const isUnits = q.includes('unit') || q.includes('volume');
            const metric = isProfit ? 'profit' : (isUnits ? 'unitsSold' : 'revenue');
            seriesKeys = [metric];

            const aggregated = this.dataset.reduce((acc: any, row) => {
                const key = row[category as keyof SalesData] as string;
                if (!acc[key]) acc[key] = { [category]: key, revenue: 0, profit: 0, unitsSold: 0 };
                acc[key].revenue += row.revenue;
                acc[key].profit += row.profit;
                acc[key].unitsSold += row.unitsSold;
                return acc;
            }, {});

            data = Object.values(aggregated).sort((a: any, b: any) => b[metric] - a[metric]);
            
            // Insight
            const topCategory = data[0];
            insight = `${topCategory[category]} is currently the top performing segment, leading with a total ${metric} of $${topCategory[metric].toLocaleString()}. Consider allocating more marketing budget here to accelerate growth further.`;
            suggestedQuestions = [
               `What are the top products in ${topCategory[category]}?`,
               `Show me the profit margin across all ${category}s`,
               "Compare enterprise vs SMB performance"
            ];
        }

        // --- Intent 3: Product Analysis ---
        else if (q.includes('product') || q.includes('item')) {
            chartType = 'bar'; // could be pie
            if (q.includes('share') || q.includes('percentage')) chartType = 'pie';
            xAxisKey = 'productLine';
            
            const metric = q.includes('profit') ? 'profit' : 'revenue';
            seriesKeys = [metric];

            const aggregated = this.dataset.reduce((acc: any, row) => {
                const key = row.productLine;
                if (!acc[key]) acc[key] = { productLine: key, revenue: 0, profit: 0 };
                acc[key].revenue += row.revenue;
                acc[key].profit += row.profit;
                return acc;
            }, {});

            data = Object.values(aggregated).sort((a: any, b: any) => b[metric] - a[metric]);
            
            const top = data[0];
            insight = `Our flagship offering, ${top.productLine}, dominates the portfolio driving $${top[metric].toLocaleString()} in ${metric}.`;
        }
        
        // --- Intent 4: Customer Segments ---
        else if (q.includes('segment') || q.includes('customer type')) {
            chartType = 'pie';
            xAxisKey = 'segment';
            seriesKeys = ['revenue'];

            const aggregated = this.dataset.reduce((acc: any, row) => {
                const key = row.segment;
                if (!acc[key]) acc[key] = { segment: key, revenue: 0 };
                acc[key].revenue += row.revenue;
                return acc;
            }, {});

            data = Object.values(aggregated);
            insight = `Enterprise customers account for the critical majority of our revenue pipeline. Retaining these accounts should be a top priority.`;
        }

        // --- Fallback Intent ---
        else {
            chartType = 'metric';
            const totalRev = this.dataset.reduce((sum, row) => sum + row.revenue, 0);
            const totalProf = this.dataset.reduce((sum, row) => sum + row.profit, 0);
            
            data = [
                { name: 'Total Revenue', value: totalRev },
                { name: 'Total Profit', value: totalProf },
                { name: 'Margin', value: ((totalProf/totalRev)*100).toFixed(1) + '%' }
            ];
            seriesKeys = ['value'];
            insight = `I've pulled a high-level summary of your main KPIs. If you'd like to drill down, try asking about specific regions, products, or time trends.`;
        }

        return {
            query: nlQuery,
            insight,
            data,
            chartType,
            xAxisKey,
            seriesKeys,
            suggestedQuestions
        };

    } catch (error) {
        console.error("AI Engine processing error", error);
        return {
            query: nlQuery,
            insight: "I'm sorry, I couldn't understand that query. Could you try rephrasing? Try something like 'Show me revenue by region'.",
            data: [],
            chartType: 'metric',
            seriesKeys: [],
            suggestedQuestions: ["Show revenue by region", "What is the profit trend?"]
        };
    }
  }
}
