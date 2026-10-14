-- CollabCampus Relational PostgreSQL Database Schema

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  avatar_url VARCHAR(500) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roll_number VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
  batch_year INT,
  cgpa NUMERIC(3,2) DEFAULT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  resume_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  specialization TEXT,
  cabin_location VARCHAR(100),
  office_hours VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  technologies JSONB DEFAULT '[]'::jsonb,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')),
  github_repo VARCHAR(255),
  live_demo VARCHAR(255),
  max_members INT DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'mentor')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, user_id)
);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Notes
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subject VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_type VARCHAR(100) DEFAULT 'application/pdf',
  uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Internships and Opportunities
CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  role_title VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  work_type VARCHAR(50) DEFAULT 'Hybrid' CHECK (work_type IN ('Remote', 'On-site', 'Hybrid')),
  stipend_salary VARCHAR(100) NOT NULL,
  eligibility TEXT NOT NULL,
  required_skills JSONB DEFAULT '[]'::jsonb,
  application_link VARCHAR(500) NOT NULL,
  deadline DATE,
  posted_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Saved Opportunities
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, internship_id)
);

-- 10. Student Job Applications Tracking
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'Interested' CHECK (status IN ('Interested', 'Applied', 'Interview', 'Selected', 'Rejected')),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, internship_id)
);

-- 11. Campus Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(200) NOT NULL,
  max_capacity INT DEFAULT 100,
  organizer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banner_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, user_id)
);

-- 13. Campus Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Student Marketplace and Lost & Found
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Books', 'Electronics', 'Stationery', 'Lost & Found', 'Other')),
  price NUMERIC(10, 2) DEFAULT 0.00,
  is_free_or_lost BOOLEAN DEFAULT FALSE,
  contact_info VARCHAR(200) NOT NULL,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'claimed', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Campus Service Tickets
CREATE TABLE IF NOT EXISTS service_tickets (
  id SERIAL PRIMARY KEY,
  ticket_code VARCHAR(30) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Wi-Fi & Network', 'Classroom Audio/Visual', 'Laboratory Equipment', 'Electrical & Power', 'Hostel & Facility', 'Other')),
  description TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Ticket Comments
CREATE TABLE IF NOT EXISTS ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Ticket Status History
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members ON project_members(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notes_dept_sem ON notes(department, semester);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON service_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON service_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
