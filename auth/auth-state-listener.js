import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from '../firebase.js';


export class AuthStateListener {
    static initialize() {
        onAuthStateChanged(auth, (user) => {
            this.handleAuthStateChange(user);
        });
    }

    static handleAuthStateChange(user) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const userDashboard = document.getElementById('userDashboard');
        const userInfo = document.getElementById('userInfo');

        if (user) {
            // User is signed in
            this.showUserDashboard(user);
            loginForm.classList.remove('active');
            signupForm.classList.remove('active');
            userDashboard.classList.add('active');
            userInfo.classList.add('show');
        } else {
            // User is signed out
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            userDashboard.classList.remove('active');
            userInfo.classList.remove('show');
        }
    }

    static showUserDashboard(user) {
        const userEmail = document.getElementById('userEmail');
        const emailVerified = document.getElementById('emailVerified');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        // Set user email
        userEmail.textContent = user.email;
        
        // Set email verification status
        emailVerified.textContent = user.emailVerified ? 'Verified ✓' : 'Not Verified (Check your email)';
        emailVerified.style.color = user.emailVerified ? '#27ae60' : '#e74c3c';
        
        // Set display name (available from Google Sign-In)
        if (user.displayName) {
            userName.textContent = `Welcome, ${user.displayName}!`;
        } else {
            userName.textContent = 'Welcome!';
        }
        
        // Set profile picture (available from Google Sign-In)
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        } else {
            userAvatar.style.display = 'none';
        }
    }

    static getCurrentUser() {
        return auth.currentUser;
    }

    static async signOut() {
        try {
            await signOut(auth);
            return { success: true, message: 'Successfully signed out!' };
        } catch (error) {
            return { 
                success: false, 
                message: 'Error signing out. Please try again.' 
            };
        }
    }
}