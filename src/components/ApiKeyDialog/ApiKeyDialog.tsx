import { useState, useCallback, useEffect } from 'react';
import { Key, Eye, EyeOff, X, Loader2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey, validateApiKey } from '../../services/apiKeyService';

interface ApiKeyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (key: string) => void;
}

/**
 * Dialog component for entering and managing Gemini API key
 */
export function ApiKeyDialog({ isOpen, onClose, onSave }: ApiKeyDialogProps) {
    const [keyValue, setKeyValue] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Load existing key when dialog opens
    useEffect(() => {
        if (isOpen) {
            const existingKey = getApiKey();
            if (existingKey) {
                setKeyValue(existingKey);
            }
            setValidationStatus('idle');
            setErrorMessage('');
        }
    }, [isOpen]);

    const handleSave = useCallback(async () => {
        if (!keyValue.trim()) {
            setErrorMessage('Please enter an API key');
            setValidationStatus('error');
            return;
        }

        setIsValidating(true);
        setValidationStatus('idle');
        setErrorMessage('');

        try {
            const isValid = await validateApiKey(keyValue.trim());

            if (isValid) {
                setApiKey(keyValue.trim());
                setValidationStatus('success');
                onSave?.(keyValue.trim());

                // Close dialog after short delay to show success state
                setTimeout(() => {
                    onClose();
                }, 500);
            } else {
                setValidationStatus('error');
                setErrorMessage('Invalid API key. Please check and try again.');
            }
        } catch {
            setValidationStatus('error');
            setErrorMessage('Failed to validate API key. Please try again.');
        } finally {
            setIsValidating(false);
        }
    }, [keyValue, onClose, onSave]);

    const handleSkip = useCallback(() => {
        // Save without validation for offline testing
        if (keyValue.trim()) {
            setApiKey(keyValue.trim());
            onSave?.(keyValue.trim());
        }
        onClose();
    }, [keyValue, onClose, onSave]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Key className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Gemini API Key</h2>
                            <p className="text-xs text-slate-400">Required to generate UML diagrams</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* API Key Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm text-slate-300">API Key</label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={keyValue}
                                onChange={(e) => {
                                    setKeyValue(e.target.value);
                                    setValidationStatus('idle');
                                    setErrorMessage('');
                                }}
                                placeholder="Enter your Gemini API key..."
                                className={`w-full px-3 py-2.5 pr-10 text-sm bg-slate-950/50 text-slate-200 border rounded-lg focus:outline-none transition-all placeholder:text-slate-600 ${validationStatus === 'error'
                                        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50'
                                        : validationStatus === 'success'
                                            ? 'border-green-500/50 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50'
                                            : 'border-slate-700/50 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'
                                    }`}
                                data-testid="api-key-input"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                                type="button"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Error Message */}
                        {validationStatus === 'error' && errorMessage && (
                            <div className="flex items-center gap-1.5 text-red-400 text-xs">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {validationStatus === 'success' && (
                            <div className="flex items-center gap-1.5 text-green-400 text-xs">
                                <Check className="w-3.5 h-3.5" />
                                <span>API key validated successfully!</span>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="flex gap-2 p-3 bg-slate-800/50 border border-slate-700/30 rounded-lg">
                        <div className="shrink-0 mt-0.5">
                            <Key className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                            <p>Your API key is stored locally in your browser and never sent to any external servers.</p>
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Get a free API key from Google AI Studio
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        Skip Validation
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isValidating || !keyValue.trim()}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isValidating || !keyValue.trim()
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                            }`}
                        data-testid="save-api-key-btn"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Validating...</span>
                            </>
                        ) : validationStatus === 'success' ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <span>Save & Validate</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
