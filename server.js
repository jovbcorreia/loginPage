const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT       = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
};

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

let users = loadUsers();

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(res, status, body) {
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // POST /login
  if (req.method === 'POST' && req.url === '/login') {
    try {
      const { email, password } = await readBody(req);
      const user = users.find(u => u.email === (email || '').toLowerCase() && u.password === password);
      return user
        ? json(res, 200, { ok: true, name: user.name })
        : json(res, 401, { ok: false, error: 'Incorrect email or password.' });
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid request.' });
    }
  }

  // POST /register
  if (req.method === 'POST' && req.url === '/register') {
    try {
      const { name, email, password } = await readBody(req);
      const cleanEmail = (email || '').toLowerCase().trim();
      const cleanName  = (name  || '').trim();

      if (!cleanName || !cleanEmail || !password)
        return json(res, 400, { ok: false, error: 'Please fill in all fields.' });
      if (users.find(u => u.email === cleanEmail))
        return json(res, 409, { ok: false, error: 'This email is already registered.' });

      const newUser = { id: Date.now(), name: cleanName, email: cleanEmail, password };
      users.push(newUser);
      saveUsers(users);
      return json(res, 201, { ok: true, name: cleanName });
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid request.' });
    }
  }

  // Serve static files — strip query string before resolving path
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, CORS);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { ...CORS, 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Jozzy Login Page → http://localhost:${PORT}\n`);
});
