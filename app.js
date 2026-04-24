if (location.protocol === 'file:') {
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#e2e2e2;background:#1a1a1a;text-align:center;padding:24px"><div><p style="font-size:18px;font-weight:700;margin-bottom:12px">⚠ Open via localhost</p><p style="color:#888;font-size:14px">Run <code style="background:#2a2a2a;padding:4px 10px;border-radius:6px;color:#52b788">node server.js</code> then open <a href="http://localhost:3000" style="color:#52b788">http://localhost:3000</a></p></div></div>`;
  throw new Error('Must be served over HTTP');
}

const form       = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const nameInput  = document.getElementById('name');
const nameGroup  = document.getElementById('nameGroup');
const errorMsg   = document.getElementById('errorMsg');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const btnLoader  = document.getElementById('btnLoader');
const switchBtn  = document.getElementById('switchBtn');
const switchText = document.getElementById('switchText');
const togglePass = document.getElementById('togglePass');
const authTitle  = document.getElementById('authTitle');
const authSub    = document.getElementById('authSub');

let isLogin = new URLSearchParams(location.search).get('mode') !== 'register';
applyMode();

function applyMode() {
  nameGroup.style.display  = isLogin ? 'none' : 'flex';
  btnText.textContent      = isLogin ? 'Sign In' : 'Create Account';
  switchText.textContent   = isLogin ? "Don't have an account?" : 'Already have an account?';
  switchBtn.textContent    = isLogin ? 'Register' : 'Sign In';
  authTitle.textContent    = isLogin ? 'Welcome back' : 'Create your account';
  authSub.textContent      = isLogin ? 'Sign in to your account' : 'Register for free';
}

togglePass.addEventListener('click', () => {
  const show = passInput.type === 'password';
  passInput.type = show ? 'text' : 'password';
  togglePass.textContent = show ? 'Hide' : 'Show';
});

switchBtn.addEventListener('click', () => {
  isLogin = !isLogin;
  hideError();
  applyMode();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  setLoading(true);

  const email    = emailInput.value.trim().toLowerCase();
  const password = passInput.value;
  const name     = nameInput.value.trim();

  try {
    const endpoint = isLogin ? '/login' : '/register';
    const body     = isLogin ? { email, password } : { name, email, password };
    const res      = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();

    if (data.ok) {
      sessionStorage.setItem('userName', data.name);
      location.href = 'dashboard.html';
    } else {
      showError(data.error);
    }
  } catch {
    showError('Could not connect to the server.');
  }

  setLoading(false);
});

function showError(msg) {
  errorMsg.textContent   = msg;
  errorMsg.style.display = 'block';
  errorMsg.animate(
    [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 200 }
  );
}

function hideError() { errorMsg.style.display = 'none'; }

function setLoading(on) {
  submitBtn.disabled      = on;
  btnText.style.display   = on ? 'none' : 'inline';
  btnLoader.style.display = on ? 'inline-block' : 'none';
}
