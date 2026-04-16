-- SQL untuk membuat tabel categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Masukkan kategori awal
INSERT INTO categories (name) VALUES 
('U-13'), ('U-15'), ('U-17'), ('U-19'), ('Senior'), 
('Men''s Singles'), ('Women''s Singles'), ('Men''s Doubles'), ('Women''s Doubles'), ('Mixed Doubles')
ON CONFLICT (name) DO NOTHING;
