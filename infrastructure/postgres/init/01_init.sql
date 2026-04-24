-- Création des bases de données
CREATE DATABASE courses_db;
CREATE DATABASE analytics_db;

-- Connexion à courses_db
\c courses_db;

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT true,
    category VARCHAR(100),
    level VARCHAR(50) DEFAULT 'beginner',
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des leçons
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des inscriptions
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress DECIMAL(5, 2) DEFAULT 0.00,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Connexion à analytics_db
\c analytics_db;

-- Table des vues de cours
CREATE TABLE IF NOT EXISTS course_views (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_id VARCHAR(100),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    course_id INTEGER,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données de test
\c courses_db;
INSERT INTO courses (title, description, instructor_id, price, is_free, category, level)
VALUES 
    ('Introduction à Docker', 'Apprenez Docker de zéro', 'instructor_001', 0, true, 'DevOps', 'beginner'),
    ('Kubernetes Avancé', 'Maîtrisez K8s en production', 'instructor_001', 49.99, false, 'DevOps', 'advanced'),
    ('CI/CD avec GitHub Actions', 'Automatisez vos déploiements', 'instructor_002', 29.99, false, 'DevOps', 'intermediate');