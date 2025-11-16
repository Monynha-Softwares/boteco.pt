export const hasClerkAuth = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

/**
 * Heuristic check to decide whether a user is likely authenticated.
 * This is intentionally conservative and provisional: it looks for
 * common Clerk/session indicators in cookies and localStorage keys.
 */
export function isLikelyAuthenticated(): boolean {
	if (!hasClerkAuth) return false;
	if (typeof window === "undefined") return false;

	try {
		const cookie = document.cookie || "";
		const cookieIndicators = ["__session", "__clerk", "clerk", "session", "sb-"];
		if (cookieIndicators.some((i) => cookie.includes(i))) return true;

		// localStorage keys may contain clerk/session hints
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i) || "";
			if (/clerk|session|sb-/.test(key)) return true;
		}
	} catch (e) {
		// Access to storage/cookies may be blocked; treat as unauthenticated
		return false;
	}

	return false;
}
