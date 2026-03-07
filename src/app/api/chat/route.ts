import { NextResponse } from 'next/server';
import { DataLensEngine } from '@/lib/engine';

const engine = new DataLensEngine();

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Process the natural language query using our SAM AI Lens engine
    const response = engine.processQuery(query);

    // Simulate network/processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
