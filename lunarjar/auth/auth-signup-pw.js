import { createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from '../firebase.js';

export class AuthSignupPassword {
    static async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Send email verification
            await sendEmailVerification(userCredential.user);
            
            return {
                success: true,
                user: userCredential.user,
                message: 'Account created successfully! Please check your email to verify your account.'
            };
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
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
            'auth/weak-password': 'Password should be at least 6 characters long.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };
        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    static validatePasswords(password, confirmPassword) {
        if (password !== confirmPassword) {
            return {
                valid: false,
                message: 'Passwords do not match.'
            };
        }
        if (password.length < 6) {
            return {
                valid: false,
                message: 'Password must be at least 6 characters long.'
            };
        }
        return { valid: true };
    }
}