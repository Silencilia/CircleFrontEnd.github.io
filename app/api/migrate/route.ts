import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Migration endpoint called - no longer needed as sample data has been removed');
    
    return NextResponse.json({
      success: true,
      message: 'Sample data has been removed. This migration endpoint is no longer needed.',
      summary: {
        message: 'No migration performed - sample data removed from codebase'
      }
    });
    
  } catch (error) {
    console.error('Migration endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}