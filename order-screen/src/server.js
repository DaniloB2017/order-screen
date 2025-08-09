const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

let orders = [];
const PIN = '1234'; // Hardcoded PIN (change as needed)
const SESSION_SECRET = 'your-secret-key'; // Simple secret for session

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.cookies.session === SESSION_SECRET) {
    return next();
  }
  res.redirect('/login.html');
}

// Login route
app.post('/login', (req, res) => {
  const { pin } = req.body;
  if (pin === PIN) {
    res.cookie('session', SESSION_SECRET, { httpOnly: true });
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Incorrect PIN' });
  }
});

// Protect routes
app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/display.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

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
