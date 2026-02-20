-- Supabase Migration: Create Initial Tables
-- Created: 2026-02-20
-- Description: Creates core tables for form submissions, emails, and user data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Franchise Submissions Table
CREATE TABLE IF NOT EXISTS franchise_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  location VARCHAR(255),
  investment_range VARCHAR(100),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  assigned_to UUID,
  CONSTRAINT franchise_submissions_fkey FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Course Submissions Table
CREATE TABLE IF NOT EXISTS course_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  course_id VARCHAR(255),
  course_name VARCHAR(255),
  message TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'new',
  payment_status VARCHAR(50) DEFAULT 'pending',
  CONSTRAINT course_submissions_pkey PRIMARY KEY (id)
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'normal',
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id)
);

-- Emails Table (for tracking sent emails)
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  template_name VARCHAR(100),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  CONSTRAINT emails_pkey PRIMARY KEY (id)
);

-- Create Indexes for better query performance
CREATE INDEX idx_franchise_submissions_email ON franchise_submissions(email);
CREATE INDEX idx_franchise_submissions_status ON franchise_submissions(status);
CREATE INDEX idx_franchise_submissions_submitted_at ON franchise_submissions(submitted_at);

CREATE INDEX idx_course_submissions_email ON course_submissions(email);
CREATE INDEX idx_course_submissions_status ON course_submissions(status);
CREATE INDEX idx_course_submissions_submitted_at ON course_submissions(submitted_at);

CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);

CREATE INDEX idx_emails_recipient ON emails(recipient);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_created_at ON emails(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow public insert (for form submissions)
CREATE POLICY "Allow public inserts" ON franchise_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts" ON course_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts" ON contact_submissions FOR INSERT WITH CHECK (true);

-- Allow authenticated read
CREATE POLICY "Allow authenticated read" ON franchise_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read" ON course_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
