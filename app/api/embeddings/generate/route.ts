import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreEmbedding, EmbeddingParams } from '@/app/api/utils/embeddingSync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, entityId, content, metadata } = body as {
      entityType: string;
      entityId: string;
      content: string;
      metadata?: any;
    };

    if (!entityType || !entityId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, content' },
        { status: 400 }
      );
    }

    // Get user ID from header
    const userId = req.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate and store embedding
    const params: EmbeddingParams = {
      userId: userId,
      entityType: entityType as any,
      entityId,
      content,
      metadata
    };

    await generateAndStoreEmbedding(params);

    return NextResponse.json({ 
      success: true, 
      message: `Embedding generated for ${entityType}:${entityId}` 
    });

  } catch (error: any) {
    console.error('Embedding generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
