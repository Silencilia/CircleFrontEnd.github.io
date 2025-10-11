/**
 * Helper functions for TalkToCircle component
 */

/**
 * Detects person names in text using OpenAI API
 * @param text - The text to analyze for names
 * @returns Array of detected names, or empty array on error
 */
export async function detectNamesInText(text: string): Promise<string[]> {
  try {
    const res = await fetch('/api/detect-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    const names: string[] = Array.isArray(data?.names) ? data.names : [];
    return names;
  } catch {
    return [];
  }
}

