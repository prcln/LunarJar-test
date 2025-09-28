
// UI Helper Functions
function showLogin() {
		document.getElementById('loginForm').classList.add('active');
		document.getElementById('signupForm').classList.remove('active');
		clearErrors();
}

function showSignup() {
		document.getElementById('signupForm').classList.add('active');
		document.getElementById('loginForm').classList.remove('active');
		clearErrors();
}

function clearErrors() {
		document.getElementById('loginError').style.display = 'none';
		document.getElementById('signupError').style.display = 'none';
		document.getElementById('signupSuccess').style.display = 'none';
}

function showError(elementId, message) {
		const errorElement = document.getElementById(elementId);
		errorElement.textContent = message;
		errorElement.style.display = 'block';
}

function showSuccess(elementId, message) {
		const successElement = document.getElementById(elementId);
		successElement.textContent = message;
		successElement.style.display = 'block';
}

function setButtonLoading(buttonId, loading) {
		const button = document.getElementById(buttonId);
		if (loading) {
				button.innerHTML = '<span class="loading"></span>';
				button.disabled = true;
		} else {
				const buttonTexts = {
						'loginBtn': 'Sign In',
						'signupBtn': 'Create Account'
				};
				button.innerHTML = buttonTexts[buttonId];
				button.disabled = false;
		}
}

// Event Handlers
async function handleLogin(e) {
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

async function handleSignup(e) {
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

async function authSignout() {
		const result = await AuthStateListener.signOut();
		if (!result.success) {
				alert(result.message);
		}
}