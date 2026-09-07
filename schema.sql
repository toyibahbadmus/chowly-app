DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS complaint CASCADE;
DROP TABLE IF EXISTS order_assignment CASCADE;
DROP TABLE IF EXISTS order_item_modifiers CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS staff_shifts CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS menu CASCADE;
DROP TABLE IF EXISTS dining_session CASCADE;
DROP TABLE IF EXISTS "table" CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS restaurant CASCADE;

CREATE TABLE restaurant (
    restaurant_id VARCHAR(50) PRIMARY KEY,
    restaurant_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    contact_number VARCHAR(50) NOT NULL
);

CREATE TABLE customer (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "table" (
    table_id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) REFERENCES restaurant(restaurant_id),
    table_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    table_status VARCHAR(50) NOT NULL
);

CREATE TABLE dining_session (
    session_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customer(customer_id),
    restaurant_id VARCHAR(50) REFERENCES restaurant(restaurant_id),
    table_id VARCHAR(50) REFERENCES "table"(table_id),
    check_in_time VARCHAR(20) NOT NULL,
    check_out_time VARCHAR(20)
);

CREATE TABLE menu (
    menu_id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) REFERENCES restaurant(restaurant_id),
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    estimated_prep_time INT NOT NULL,
    is_available BOOLEAN NOT NULL
);

CREATE TABLE staff (
    staff_id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) REFERENCES restaurant(restaurant_id),
    staff_name VARCHAR(100) NOT NULL,
    staff_role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE staff_shifts (
    shift_id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) REFERENCES restaurant(restaurant_id),
    staff_id VARCHAR(50) REFERENCES staff(staff_id),
    clock_in_time VARCHAR(20) NOT NULL,
    clock_out_time VARCHAR(20)
);

CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES dining_session(session_id),
    staff_id VARCHAR(50) REFERENCES staff(staff_id),
    order_time VARCHAR(20) NOT NULL,
    total_expected_wait INT NOT NULL,
    overall_status VARCHAR(50) NOT NULL
);

CREATE TABLE order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    menu_id VARCHAR(50) REFERENCES menu(menu_id),
    quantity INT NOT NULL,
    unit_price_at_order NUMERIC(10, 2) NOT NULL,
    item_preparation_status VARCHAR(50) NOT NULL,
    max_prep_time INT NOT NULL
);

CREATE TABLE order_item_modifiers (
    modifier_id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) REFERENCES order_items(order_item_id),
    modifier_name VARCHAR(100) NOT NULL,
    extra_charge NUMERIC(10, 2) NOT NULL,
    special_instruction_text TEXT NOT NULL
);

CREATE TABLE order_assignment (
    assignment_id VARCHAR(50) PRIMARY KEY,
    order_item_id VARCHAR(50) REFERENCES order_items(order_item_id),
    chef_shift_id VARCHAR(50) REFERENCES staff_shifts(shift_id),
    bartender_shift_id VARCHAR(50) REFERENCES staff_shifts(shift_id),
    update_time VARCHAR(20) NOT NULL
);

CREATE TABLE complaint (
    complaint_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    complaint_details TEXT NOT NULL,
    customer_rating INT NOT NULL,
    submission_time VARCHAR(20) NOT NULL
);

CREATE TABLE payment (
    payment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    total_amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_time VARCHAR(20) NOT NULL,
    payment_status VARCHAR(50) NOT NULL
);