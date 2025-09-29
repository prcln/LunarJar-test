import { AuthStateListener } from "./auth-state-listener.js";
import { AuthSigninPassword } from "./auth-signin-pw.js";
import { AuthSignupPassword } from "./auth-signup-pw.js";
import { AuthGoogleSignin } from "./auth-google-signin.js";

/**
 * Show error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * Show success message
 */
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
}

/**
 * Clear all error and success messages
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message, .success-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

/**
 * Set button loading state
 */
function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.innerHTML = '<span class="loading"></span>';
        button.disabled = true;
    } else {
        // Reset button text based on button ID
        const buttonTexts = {
            'loginBtn': 'Sign In',
            'signupBtn': 'Create Account'
        };
        button.textContent = buttonTexts[buttonId] || 'Submit';
        button.disabled = false;
    }
}

/**
 * Show login form
 */
window.showLogin = function() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    clearErrors();
}

/**
 * Show signup form
 */
window.showSignup = function() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    clearErrors();
}

/**
 * Handle login form submission
 */
window.handleLogin = async function(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    setButtonLoading('loginBtn', true);
    
    const result = await AuthSigninPassword.signIn(email, password);
    
    if (!result.success) {
        showError('loginError', result.message);
    }
    
    setButtonLoading('loginBtn', false);
}

/**
 * Handle signup form submission
 */
window.handleSignup = async function(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    const validation = AuthSignupPassword.validatePasswords(password, confirmPassword);
    if (!validation.valid) {
        showError('signupError', validation.message);
        return;
    }
    
    setButtonLoading('signupBtn', true);
    
    const result = await AuthSignupPassword.signUp(email, password);
    
    if (result.success) {
        showSuccess('signupSuccess', result.message);
        document.getElementById('signupFormElement').reset();
    } else {
        showError('signupError', result.message);
    }
    
    setButtonLoading('signupBtn', false);
}

/**
 * Handle Google Sign-In
 */
window.handleGoogleSignIn = async function() {
    clearErrors();
    
    // Show loading state on Google button
    const googleBtn = document.getElementById('googleSignInBtn');
    const originalText = googleBtn.innerHTML;
    googleBtn.innerHTML = '<span class="loading"></span> Signing in...';
    googleBtn.disabled = true;
    
    const result = await AuthGoogleSignin.signInWithPopup();
    
    if (!result.success) {
        showError('loginError', result.message);
        // Also show error in signup form if visible
        const signupForm = document.getElementById('signupForm');
        if (signupForm.classList.contains('active')) {
            showError('signupError', result.message);
        }
    }
    
    // Reset button state
    googleBtn.innerHTML = originalText;
    googleBtn.disabled = false;
}

/**
 * Handle user sign out
 */
window.authSignout = async function() {
    const result = await AuthStateListener.signOut();
    if (!result.success) {
        alert(result.message);
    }
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize auth state listener
    AuthStateListener.initialize();
    
    // Handle redirect result on page load (for mobile)
    handleRedirectResult();
    
    // Add form event listeners
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
}

/**
 * Handle redirect result for mobile Google Sign-In
 */
async function handleRedirectResult() {
    const result = await AuthGoogleSignin.handleRedirectResult();
    if (result && !result.success) {
        showError('loginError', result.message);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);