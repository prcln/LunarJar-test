import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from '../firebase.js';

export class AuthGoogleSignin {
    static provider = new GoogleAuthProvider();

    static async signInWithPopup() {
        try {
            const result = await signInWithPopup(auth, this.provider);
            return {
                success: true,
                user: result.user,
                message: 'Successfully signed in with Google!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    static async signInWithRedirect() {
        try {
            await signInWithRedirect(auth, this.provider);
            return {
                success: true,
                message: 'Redirecting to Google...'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    static async handleRedirectResult() {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                return {
                    success: true,
                    user: result.user,
                    message: 'Successfully signed in with Google!'
                };
            }
            return null; // No redirect result
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    static getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/popup-blocked': 'Popup was blocked by browser. Please allow popups and try again.',
            'auth/popup-closed-by-user': 'Sign-in was cancelled.',
            'auth/cancelled-popup-request': 'Only one popup request is allowed at one time.',
            'auth/account-exists-with-different-credential': 'An account already exists with the same email but different credentials.',
            'auth/auth-domain-config-required': 'Configuration error. Please contact support.',
            'auth/operation-not-allowed': 'Google sign-in is not enabled.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/internal-error': 'An internal error occurred. Please try again.',
            'auth/invalid-api-key': 'Invalid API key configuration.',
            'auth/app-deleted': 'Firebase app was deleted.',
            'auth/user-disabled': 'This account has been disabled.'
        };
        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    static configureProvider(options = {}) {
        // Add scopes if needed
        if (options.scopes) {
            options.scopes.forEach(scope => {
                this.provider.addScope(scope);
            });
        }

        // Set custom parameters
        if (options.customParameters) {
            this.provider.setCustomParameters(options.customParameters);
        }
    }
}