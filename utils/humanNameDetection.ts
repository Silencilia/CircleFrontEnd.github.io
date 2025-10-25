
export interface DetectedNameOccurrence {
	start: number;
	end: number;
	snippet: string;
}

export interface DetectedHumanName {
	name: string;
	occurrences: DetectedNameOccurrence[];
}

/**
 * Detect likely human names using the existing /api/detect-names endpoint
 * and augment with position-agnostic context snippets for UI display.
 */
export async function detectHumanNamesWithContext(text: string): Promise<DetectedHumanName[]> {
	if (!text || !text.trim()) return [];

	const res = await fetch('/api/detect-names', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text })
	});

	if (!res.ok) {
		return [];
	}

	const data = await res.json().catch(() => ({ names: [] as string[] }));
	const names: string[] = Array.isArray(data?.names) ? data.names : [];

	// For each unique detected name, find all occurrences in the text and build snippets
	const seen = new Set<string>();
	const result: DetectedHumanName[] = [];

	for (const raw of names) {
		const n = String(raw || '').trim();
		if (!n) continue;
		const key = n.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);

		const occurrences: DetectedNameOccurrence[] = [];
		// Escape regex meta
		const pattern = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const re = new RegExp(pattern, 'gi');
		let m: RegExpExecArray | null;
		while ((m = re.exec(text)) !== null) {
			const start = m.index;
			const end = m.index + m[0].length;
			const left = Math.max(0, start - 24);
			const right = Math.min(text.length, end + 24);
			const before = text.slice(left, start);
			const after = text.slice(end, right);
			const snippet = `${left > 0 ? '...' : ''}${before}${m[0]}${after}${right < text.length ? '...' : ''}`;
			occurrences.push({ start, end, snippet });
		}

		if (occurrences.length === 0) {
			// If the model returned a transformed form (e.g., case), still include one nominal snippet
			const idx = text.toLowerCase().indexOf(n.toLowerCase());
			if (idx >= 0) {
				const start = idx;
				const end = idx + n.length;
				const left = Math.max(0, start - 24);
				const right = Math.min(text.length, end + 24);
				const before = text.slice(left, start);
				const after = text.slice(end, right);
				const snippet = `${left > 0 ? '...' : ''}${before}${text.slice(start, end)}${after}${right < text.length ? '...' : ''}`;
				occurrences.push({ start, end, snippet });
			}
		}

		result.push({ name: n, occurrences });
	}

	return result;
}


