/**
 * API helper functions for embedding generation
 */

/**
 * Trigger embedding generation (fire-and-forget)
 * @param entityType - The type of entity (contact, note, commitment, etc.)
 * @param entityId - The ID of the entity
 * @param content - The content to generate embeddings for
 * @param metadata - Optional metadata for the embedding
 */
export async function triggerEmbeddingGeneration(entityType: string, entityId: string, content: string, metadata?: any) {
  try {
    // Get cached user ID from sessionStorage
    const userId = sessionStorage.getItem('userId');

    const headers: any = { 'Content-Type': 'application/json' };
    if (userId) {
      headers['X-User-ID'] = userId;
    }

    await fetch('/api/embeddings/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        entityType,
        entityId,
        content,
        metadata
      })
    });
  } catch (error) {
    console.error(`Failed to generate embedding for ${entityType}:${entityId}:`, error);
  }
}
