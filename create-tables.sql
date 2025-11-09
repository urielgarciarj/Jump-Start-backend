-- Script para crear todas las tablas manualmente en Supabase PostgreSQL
-- Ejecutar este script en el SQL Editor de Supabase

-- Limpiar base de datos primero
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 1. Tabla users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    role VARCHAR NOT NULL
);

-- 2. Tabla profiles
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    "aboutMe" TEXT,
    location VARCHAR,
    phone VARCHAR,
    skills TEXT,
    "secundaryEmail" VARCHAR,
    university VARCHAR,
    "jobCompany" VARCHAR,
    picture VARCHAR,
    cv VARCHAR,
    facebook VARCHAR,
    twitter VARCHAR,
    linkedin VARCHAR,
    instagram VARCHAR
);

-- 3. Tabla universities
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    status VARCHAR DEFAULT 'active',
    name VARCHAR NOT NULL,
    resumen VARCHAR NOT NULL,
    "sitioWeb" VARCHAR NOT NULL,
    sector VARCHAR NOT NULL,
    size VARCHAR NOT NULL,
    sede VARCHAR NOT NULL,
    specialties VARCHAR,
    "logoUrl" VARCHAR
);

-- 4. Tabla companies
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    status VARCHAR DEFAULT 'active',
    name VARCHAR NOT NULL,
    resumen VARCHAR NOT NULL,
    "sitioWeb" VARCHAR NOT NULL,
    sector VARCHAR NOT NULL,
    size VARCHAR NOT NULL,
    sede VARCHAR NOT NULL,
    specialties VARCHAR,
    "logoUrl" VARCHAR
);

-- 5. Tabla projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    requirements TEXT NOT NULL,
    status VARCHAR DEFAULT 'pendiente',
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "dateCreated" TIMESTAMP DEFAULT NOW(),
    "professorId" INTEGER REFERENCES users(id)
);

-- 6. Tabla classes
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    university VARCHAR NOT NULL,
    "userId" INTEGER REFERENCES users(id)
);

-- 7. Tabla experiences
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    job VARCHAR NOT NULL,
    company VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    description TEXT NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "userId" INTEGER REFERENCES users(id)
);

-- 8. Tabla events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    university VARCHAR,
    company VARCHAR,
    link VARCHAR NOT NULL,
    "mediaUrl" VARCHAR,
    "userId" INTEGER REFERENCES users(id)
);

-- 9. Tabla vacancies
CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR,
    category VARCHAR NOT NULL,
    modality VARCHAR NOT NULL,
    level VARCHAR NOT NULL,
    company VARCHAR NOT NULL,
    salary INTEGER,
    "salaryPeriod" VARCHAR,
    status VARCHAR DEFAULT 'activo',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "userId" INTEGER REFERENCES users(id)
);

-- 10. Tabla posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    "mediaUrl" VARCHAR,
    "dateCreated" TIMESTAMP DEFAULT NOW(),
    category VARCHAR NOT NULL,
    "userId" INTEGER REFERENCES users(id)
);

-- 11. Tabla comments
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text VARCHAR NOT NULL,
    "dateCreated" TIMESTAMP DEFAULT NOW(),
    "postId" INTEGER REFERENCES posts(id),
    "userId" INTEGER REFERENCES users(id)
);

-- 12. Tabla applications
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    "phoneNumber" VARCHAR,
    interested VARCHAR NOT NULL,
    proficiency VARCHAR,
    "dateCreated" TIMESTAMP DEFAULT NOW(),
    "vacantId" INTEGER REFERENCES vacancies(id),
    "userId" INTEGER REFERENCES users(id)
);

-- 13. Tabla enrolls
CREATE TABLE enrolls (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    comments VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pendiente',
    "dateCreated" TIMESTAMP DEFAULT NOW(),
    "projectId" INTEGER REFERENCES projects(id),
    "userId" INTEGER REFERENCES users(id)
);

-- Crear índices únicos
CREATE UNIQUE INDEX "IDX_UNIQUE_USER_VACANT_APPLICATIONS" ON applications ("userId", "vacantId");
CREATE UNIQUE INDEX "IDX_UNIQUE_USER_VACANT_ENROLLS" ON enrolls ("userId", "projectId");

-- Agregar foreign key para profiles
ALTER TABLE profiles ADD COLUMN "userId" INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX "IDX_UNIQUE_USER_PROFILE" ON profiles ("userId");

-- Agregar foreign key para users -> profiles (relación 1:1)
ALTER TABLE users ADD COLUMN "profileId" INTEGER REFERENCES profiles(id);
CREATE UNIQUE INDEX "IDX_UNIQUE_PROFILE_USER" ON users ("profileId");
