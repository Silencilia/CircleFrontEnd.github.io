import { NextRequest, NextResponse } from 'next/server';
import { syncUserEmbeddings } from '@/app/api/utils/embeddingSync';

export async function POST(req: NextRequest) {
  try {
    // Get user ID from header
    const userId = req.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sync embeddings for the user
    const result = await syncUserEmbeddings(userId);

    return NextResponse.json({ 
      success: true, 
      result,
      message: `Embedding sync complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`
    });

  } catch (error: any) {
    console.error('Embedding sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync embeddings' },
      { status: 500 }
    );
  }
}
