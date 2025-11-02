export interface ExtractedCommitment {
  text: string;
  due_date: string; // Format: "Dec 20, 2024"
  due_time: string; // Format: "16:00"
}

export interface ExtractCommitmentsResponse {
  ok: boolean;
  result?: {
    commitments: ExtractedCommitment[];
  };
  error?: string;
}

export async function extractCommitments(text: string): Promise<ExtractCommitmentsResponse> {
  try {
    console.log('[extractCommitments] Calling API', { textLen: text.length });
    const response = await fetch('/api/extract-commitment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    });

    console.log('[extractCommitments] Response received', { ok: response.ok, status: response.status, contentType: response.headers.get('content-type') });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[extractCommitments] Response error', { status: response.status, errorText });
      return {
        ok: false,
        error: `API error: ${response.status} ${errorText}`,
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[extractCommitments] Non-JSON response', { contentType, text: text.substring(0, 200) });
      return {
        ok: false,
        error: 'Invalid response format',
      };
    }

    const data = await response.json();
    console.log('[extractCommitments] Success', { ok: data.ok, commitmentsCount: data.result?.commitments?.length || 0 });
    return data;
  } catch (error: any) {
    console.error('[extractCommitments] Error:', error);
    return {
      ok: false,
      error: error?.message || 'Failed to extract commitments',
    };
  }
}

