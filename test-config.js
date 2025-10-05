# Test Configuration for Shop Functionality
# This file contains test data and configuration for local testing

# Test WooCommerce Store Configuration
# For testing purposes, you can use a demo WooCommerce store or create a test store
TEST_WOOCOMMERCE_STORE_URL="https://demo.woocommerce.com"
TEST_WOOCOMMERCE_CONSUMER_KEY="ck_demo_key"
TEST_WOOCOMMERCE_CONSUMER_SECRET="cs_demo_secret"

# Test Products Data
TEST_PRODUCTS = [
  {
    id: 1,
    name: "Vitamin D3 1000 IU",
    price: "19.99",
    description: "High-quality Vitamin D3 supplement for bone health",
    category: "Vitamins",
    stock_quantity: 50,
    images: ["https://via.placeholder.com/300x300?text=Vitamin+D3"]
  },
  {
    id: 2,
    name: "Omega-3 Fish Oil",
    price: "24.99",
    description: "Premium Omega-3 supplement for heart health",
    category: "Supplements",
    stock_quantity: 30,
    images: ["https://via.placeholder.com/300x300?text=Omega+3"]
  },
  {
    id: 3,
    name: "Multivitamin Complex",
    price: "29.99",
    description: "Complete multivitamin with essential nutrients",
    category: "Vitamins",
    stock_quantity: 25,
    images: ["https://via.placeholder.com/300x300?text=Multivitamin"]
  }
];

# Test Categories
TEST_CATEGORIES = [
  { id: 1, name: "Vitamins", count: 2 },
  { id: 2, name: "Supplements", count: 1 },
  { id: 3, name: "Over-the-Counter", count: 0 },
  { id: 4, name: "Prescription", count: 0 }
];

# Test Payment Methods
TEST_PAYMENT_METHODS = [
  {
    id: "bacs",
    title: "Direct Bank Transfer",
    description: "Make your payment directly into our bank account",
    enabled: true
  },
  {
    id: "stripe",
    title: "Credit Card (Stripe)",
    description: "Pay securely with your credit or debit card",
    enabled: true
  },
  {
    id: "ppcp-gateway",
    title: "PayPal",
    description: "Pay with PayPal, Venmo, or Pay Later options",
    enabled: true
  }
];

# Test Order Data
TEST_ORDER_DATA = {
  billing: {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "555-0123",
    address_1: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    postcode: "11201",
    country: "US"
  },
  shipping: {
    first_name: "John",
    last_name: "Doe",
    address_1: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    postcode: "11201",
    country: "US"
  },
  line_items: [
    {
      product_id: 1,
      quantity: 2
    },
    {
      product_id: 2,
      quantity: 1
    }
  ],
  payment_method: "bacs",
  payment_method_title: "Direct Bank Transfer",
  set_paid: false,
  customer_note: "Test order from automated testing"
};

# Expected Test Results
EXPECTED_RESULTS = {
  products_count: 3,
  categories_count: 4,
  payment_methods_count: 3,
  cart_functionality: true,
  order_creation: true,
  checkout_process: true
};

