-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    city VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'meter',
    quantity_available INTEGER DEFAULT 0,
    minimum_order INTEGER DEFAULT 1,
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_verified) 
VALUES ('admin@texlink.com', '$2a$10$rQvqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'Admin User', 'admin', TRUE);

-- Insert sample products
INSERT INTO products (seller_id, title, category, description, price, unit, quantity_available, city) VALUES
(1, 'Premium Cotton Fabric', 'Fabric', 'High quality 100% cotton fabric, perfect for garments', 850, 'meter', 5000, 'Karachi'),
(1, 'Raw Denim Rolls', 'Denim', 'Authentic raw denim, ideal for jeans manufacturing', 1200, 'yard', 3000, 'Lahore'),
(1, 'Polyester Yarn', 'Yarn', 'High strength polyester yarn for industrial use', 450, 'kg', 10000, 'Faisalabad'),
(1, 'Silk Fabric', 'Fabric', 'Luxury silk fabric for premium garments', 2500, 'meter', 1000, 'Karachi');

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1585937421613-70a008356fbe?w=400', TRUE),
(2, 'https://images.unsplash.com/photo-1546172962-c70416e5a7f0?w=400', TRUE),
(3, 'https://images.unsplash.com/photo-1583244685027-4b2dc3314fcf?w=400', TRUE),
(4, 'https://images.unsplash.com/photo-1585937421613-70a008356fbe?w=400', TRUE);