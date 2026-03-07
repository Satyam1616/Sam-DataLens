import { NextResponse } from 'next/server';

export async function GET() {
  const schema = {
    tables: [
      {
        name: 'global_sales',
        description: 'Enterprise global sales records',
        columns: [
          { name: 'date', type: 'date', description: 'Date of transaction' },
          { name: 'region', type: 'string', description: 'Geographic region (NAMER, EMEA, APAC, LATAM)' },
          { name: 'country', type: 'string', description: 'Country name' },
          { name: 'productLine', type: 'string', description: 'Product category' },
          { name: 'segment', type: 'string', description: 'Customer segment' },
          { name: 'unitsSold', type: 'number', description: 'Quantity of items sold' },
          { name: 'revenue', type: 'number', description: 'Total revenue in USD' },
          { name: 'profit', type: 'number', description: 'Net profit in USD' },
        ],
        rowCount: 500
      }
    ]
  };

  return NextResponse.json(schema);
}
