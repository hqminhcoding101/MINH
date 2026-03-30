const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sample product data
const products = [
  { id: 1, name: 'Classic T-Shirt', price: 29.99, image: '👕', description: 'Comfortable cotton t-shirt' },
  { id: 2, name: 'Denim Jeans', price: 79.99, image: '👖', description: 'Premium denim jeans' },
  { id: 3, name: 'Leather Jacket', price: 199.99, image: '🧥', description: 'Stylish leather jacket' },
  { id: 4, name: 'Summer Dress', price: 59.99, image: '👗', description: 'Light and breezy dress' },
  { id: 5, name: 'Casual Shorts', price: 39.99, image: '🩳', description: 'Perfect for summer' },
  { id: 6, name: 'Wool Sweater', price: 89.99, image: '🧶', description: 'Cozy wool sweater' }
];

// API endpoint to get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API endpoint to process checkout
app.post('/api/checkout', (req, res) => {
  const { cart, customerInfo } = req.body;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.json({
    success: true,
    message: `Order placed successfully! Total: $${total.toFixed(2)}`,
    orderId: Math.floor(Math.random() * 100000)
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🛒 Clothing E-Commerce Store running on http://localhost:${PORT}`);
});