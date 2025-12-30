/**
 * API Key Service for BYOK (Bring Your Own Key) functionality
 * Manages Gemini API key storage in localStorage
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Retrieves the stored API key from localStorage
 * @returns The API key or null if not set
 */
export function getApiKey(): string | null {
    try {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch {
        // Handle cases where localStorage is not available
        console.warn('localStorage is not available');
        return null;
    }
}

/**
 * Saves the API key to localStorage
 * @param key - The Gemini API key to store
 */
export function setApiKey(key: string): void {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch {
        console.warn('Failed to save API key to localStorage');
    }
}

/**
 * Removes the API key from localStorage
 */
export function clearApiKey(): void {
    try {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {
        console.warn('Failed to clear API key from localStorage');
    }
}

/**
 * Validates an API key by making a minimal test request to the Gemini API
 * @param key - The API key to validate
 * @returns True if the API key is valid
 */
export async function validateApiKey(key: string): Promise<boolean> {
    if (!key || key.trim().length === 0) {
        return false;
    }

    try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: key });

        // Make a minimal request to test the API key
        await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: 'Say "ok"',
            config: {
                maxOutputTokens: 5,
            },
        });

        return true;
    } catch (error) {
        console.error('API key validation failed:', error);
        return false;
    }
}
