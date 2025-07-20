-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "web_user" (
    id BIGSERIAL PRIMARY KEY,
    u_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logged_in BOOLEAN NOT NULL DEFAULT FALSE,
    refresh_token TEXT,
    refresh_token_expiry TIMESTAMP
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO category (name) VALUES
    ('Electronics'),
    ('Fashion'),
    ('Home & Garden'),
    ('Sports & Outdoors'),
    ('Toys & Games'),
    ('Automotive'),
    ('Books & Media'),
    ('Collectibles & Art'),
    ('Health & Beauty'),
    ('Musical Instruments'),
    ('Baby & Kids'),
    ('Pet Supplies'),
    ('Business & Industrial'),
    ('Food & Beverages'),
    ('Other');

CREATE TABLE product_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


INSERT INTO product_status (name) VALUES ('active'), ('sold'), ('reserved');

CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    p_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    u_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL DEFAULT 1, 
    condition VARCHAR(50),
    location VARCHAR(255),
    FOREIGN KEY (u_id) REFERENCES web_user(u_id),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (status_id) REFERENCES product_status(id)
);

CREATE TABLE product_image (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL,
    image_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(p_id) ON DELETE CASCADE
);