-- Supabase Migration: Create Database Functions
-- Created: 2026-02-20
-- Description: Creates utility functions for database operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to get submission statistics
CREATE OR REPLACE FUNCTION get_submission_stats(
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '30 days'
)
RETURNS TABLE (
  submission_type VARCHAR,
  total_submissions INT,
  pending_count INT,
  completed_count INT,
  avg_response_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'franchise'::VARCHAR as submission_type,
    COUNT(*)::INT as total_submissions,
    COUNT(CASE WHEN status = 'new' THEN 1 END)::INT as pending_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT as completed_count,
    AVG(CURRENT_TIMESTAMP - submitted_at)::INTERVAL as avg_response_time
  FROM franchise_submissions
  WHERE submitted_at >= start_date

  UNION ALL

  SELECT
    'course'::VARCHAR as submission_type,
    COUNT(*)::INT as total_submissions,
    COUNT(CASE WHEN status = 'new' THEN 1 END)::INT as pending_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT as completed_count,
    AVG(CURRENT_TIMESTAMP - submitted_at)::INTERVAL as avg_response_time
  FROM course_submissions
  WHERE submitted_at >= start_date

  UNION ALL

  SELECT
    'contact'::VARCHAR as submission_type,
    COUNT(*)::INT as total_submissions,
    COUNT(CASE WHEN status = 'new' THEN 1 END)::INT as pending_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INT as completed_count,
    AVG(CURRENT_TIMESTAMP - submitted_at)::INTERVAL as avg_response_time
  FROM contact_submissions
  WHERE submitted_at >= start_date;
END;
$$ LANGUAGE plpgsql;

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email(email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Function to get recent submissions
CREATE OR REPLACE FUNCTION get_recent_submissions(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  submission_type VARCHAR,
  name VARCHAR,
  email VARCHAR,
  submitted_at TIMESTAMP,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    'franchise'::VARCHAR,
    fs.name,
    fs.email,
    fs.submitted_at,
    fs.status
  FROM franchise_submissions fs
  WHERE fs.status = 'new'
  ORDER BY fs.submitted_at DESC
  LIMIT limit_count

  UNION ALL

  SELECT
    cs.id,
    'course'::VARCHAR,
    cs.name,
    cs.email,
    cs.submitted_at,
    cs.status
  FROM course_submissions cs
  WHERE cs.status = 'new'
  ORDER BY cs.submitted_at DESC
  LIMIT limit_count

  UNION ALL

  SELECT
    cos.id,
    'contact'::VARCHAR,
    cos.name,
    cos.email,
    cos.submitted_at,
    cos.status
  FROM contact_submissions cos
  WHERE cos.status = 'new'
  ORDER BY cos.submitted_at DESC
  LIMIT limit_count

  ORDER BY submitted_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
