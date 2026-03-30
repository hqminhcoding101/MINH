let cart = [];
let products = [];

// Load products when page loads only if product UI exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productList')) {
    loadProducts();
  }

  // Video trimming
  const heroVideo = document.querySelector('.hero-video-player');
  if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', () => {
      if (heroVideo.src.includes('delete_the_first')) {
        heroVideo.currentTime = 15;
      } else {
        heroVideo.currentTime = 2;
      }
    });
  }

  // Fade in page
  document.body.style.opacity = '1';
});

// Fetch products from server
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Display products on page
function displayProducts(itemsToDisplay) {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';

  itemsToDisplay.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">${product.image}</div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-footer">
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
        </div>
      </div>
    `;
    productList.appendChild(productCard);
  });
}

// Add item to cart
function addToCart(id, name, price) {
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  updateCart();
  showNotification(`${name} added to cart!`);
}

// Update cart display
function updateCart() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = total.toFixed(2);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="quantity-control">
        <button onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
    </div>
  `).join('');
}

// Update item quantity
function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      updateCart();
    }
  }
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

// Toggle cart panel
function toggleCart() {
  const cartPanel = document.getElementById('cartPanel');
  cartPanel.classList.toggle('hidden');
}

// Go to checkout
function goToCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  toggleCart();
  openCheckout();
}

// Open checkout modal
function openCheckout() {
  const checkoutModal = document.getElementById('checkoutModal');
  checkoutModal.classList.remove('hidden');

  const orderItems = document.getElementById('orderItems');
  const orderTotal = document.getElementById('orderTotal');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  orderItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
      </div>
      <div>$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  orderTotal.textContent = total.toFixed(2);
}

// Close checkout modal
function closeCheckout() {
  const checkoutModal = document.getElementById('checkoutModal');
  checkoutModal.classList.add('hidden');
}

// Process checkout
async function processCheckout(event) {
  event.preventDefault();

  const customerInfo = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    zip: document.getElementById('zip').value,
    cardName: document.getElementById('cardName').value
  };

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cart, customerInfo })
    });

    const result = await response.json();

    if (result.success) {
      closeCheckout();
      showSuccessMessage(result.message, result.orderId);
    }
  } catch (error) {
    console.error('Error processing checkout:', error);
    alert('Error processing order. Please try again.');
  }
}

// Show success message
function showSuccessMessage(message, orderId) {
  const successModal = document.getElementById('successModal');
  const successMessage = document.getElementById('successMessage');

  successMessage.innerHTML = `
    <p>${message}</p>
    <p>Order ID: <strong>#${orderId}</strong></p>
    <p>Thank you for your purchase! Your items will be shipped soon.</p>
  `;

  successModal.classList.remove('hidden');
}

// Reset store
function resetStore() {
  cart = [];
  updateCart();
  document.getElementById('successModal').classList.add('hidden');
  document.getElementById('checkoutForm').reset();
}

// Search functionality
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );
  displayProducts(filtered);
});

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    z-index: 300;
    animation: slideIn 0.3s ease-in-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Smooth navigation
function navigateTo(url) {
  document.body.style.transition = 'opacity 0.5s ease-out';
  document.body.style.opacity = '0';
  setTimeout(() => {
    window.location.href = url;
  }, 500);
}