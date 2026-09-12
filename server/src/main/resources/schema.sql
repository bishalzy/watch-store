CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    security_code VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS product_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DOUBLE NOT NULL,
    category_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    image VARCHAR(500) NOT NULL,
    CONSTRAINT fk_products_category 
      FOREIGN KEY (category_id) 
      REFERENCES product_category(id) 
      ON DELETE RESTRICT 
      ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quantity INT NOT NULL,
    date_added DATE NOT NULL,
    date_updated DATE NOT NULL,
    product_id BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_inventory_product 
      FOREIGN KEY (product_id) 
      REFERENCES products(id) 
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  drop_location TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
);
