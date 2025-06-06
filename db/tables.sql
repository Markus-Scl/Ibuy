-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "web_user" (
    id BIGSERIAL PRIMARY KEY,
    u_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logged_in BOOLEAN NOT NULL DEFAULT FALSE,
    birthday DATE,
    refresh_token TEXT,
    refresh_token_expiry TIMESTAMP
);