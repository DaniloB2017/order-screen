const express = require('express');
const app = express();
const port = 3000;

let orders = [123, 124, 125];

app.use(express.static('public'));
app.use(express.json());

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', (req, res) => {
  const orderNumber = parseInt(req.body.orderNumber);
  if (orderNumber && !orders.includes(orderNumber)) {
    orders.push(orderNumber);
    res.json({ success: true, orders });
  } else {
    res.status(400).json({ error: 'Invalid or duplicate order number' });
  }
});

app.delete('/orders/:orderNumber', (req, res) => {
  const orderNumber = parseInt(req.body.orderNumber);
  if (orders.includes(orderNumber)) {
    orders = orders.filter(order => order !== orderNumber);
    res.json({ success: true, orders });
  } else {
    res.status(404).json({ error: 'Order number not found' });
  }
});

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});