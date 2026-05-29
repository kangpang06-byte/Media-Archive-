-- Database Schema for Media Archive System

-- Users Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Items Table
CREATE TABLE media_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) REFERENCES users(id)
);

-- Tags Table (Many-to-Many relationship)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Junction table for Media Items and Tags
CREATE TABLE media_item_tags (
    media_item_id INTEGER REFERENCES media_items(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (media_item_id, tag_id)
);

-- Sample Data (Optional)
-- INSERT INTO users (id, name, email, role) VALUES ('admin_uid', 'Admin User', 'kangpang06@gmail.com', 'admin');
-- INSERT INTO media_items (title, link, year, category, created_by) VALUES ('Sample Project', 'https://drive.google.com/...', 2024, 'Photo', 'admin_uid');
