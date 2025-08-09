const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

let orders = [];
const PIN = process.env.PIN || '1234'; // Fallback PIN for testing
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.cookies.session === SESSION_SECRET) {
    return next();
  }
  res.redirect('/login.html');
}

// Apply middleware to all routes except specific ones
app.use((req, res, next) => {
  if (['/login', '/login.html', '/ping', '/display.html'].includes(req.path)) {
    return next();
  }
  isAuthenticated(req, res, next);
});

// Login route
app.post('/login', (req, res) => {
  const { pin } = req.body;
  if (pin === PIN) {
    res.cookie('session', SESSION_SECRET, { httpOnly: true, maxAge: 86400000 });
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Incorrect PIN' });
  }
});

// Protected routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/display.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// API routes
app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', (req, res) => {
  const { orderNumber } = req.body;
  if (typeof orderNumber === 'number' && !orders.includes(orderNumber)) {
    orders.push(orderNumber);
    orders.sort((a, b) => a - b);
    res.json({ success: true, orders });
  } else {
    res.json({ success: false, error: 'Invalid or duplicate order number' });
  }
});

app.delete('/orders/:orderNumber', (req, res) => {
  const orderNumber = parseInt(req.params.orderNumber);
  const index = orders.indexOf(orderNumber);
  if (index !== -1) {
    orders.splice(index, 1);
    res.json({ success: true, orders });
  } else {
    res.json({ success: false, error: 'Order number not found' });
  }
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
