import bcrypt from 'bcryptjs';
import db, { query, exec } from './db.js';
import { runMigrations } from './migrate.js';

export async function seedDatabase() {
  console.log('[Seed] Starting database seeding...');
  await runMigrations();

  // Check if already seeded
  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  if (parseInt(existingUsers.rows[0]?.count || 0, 10) >= 3) {
    console.log('[Seed] Database already seeded with users. Skipping.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const studentHash = await bcrypt.hash('Password123!', salt);
  const facultyHash = await bcrypt.hash('Password123!', salt);
  const adminHash = await bcrypt.hash('AdminPassword123!', salt);

  // 1. Seed Users
  const studentRes = await query(
    `INSERT INTO users (email, password_hash, full_name, role, bio)
     VALUES ($1, $2, $3, 'student', $4)
     RETURNING id`,
    ['student@campus.edu', studentHash, 'Aarav Sharma', 'Full-stack software enthusiast passionate about campus innovation and distributed systems.']
  );
  const studentId = studentRes.rows[0].id;

  const facultyRes = await query(
    `INSERT INTO users (email, password_hash, full_name, role, bio)
     VALUES ($1, $2, $3, 'faculty', $4)
     RETURNING id`,
    ['faculty@campus.edu', facultyHash, 'Dr. Rajesh Menon', 'Associate Professor, Department of Computer Science. Research: Distributed Cloud and Edge AI.']
  );
  const facultyId = facultyRes.rows[0].id;

  const adminRes = await query(
    `INSERT INTO users (email, password_hash, full_name, role, bio)
     VALUES ($1, $2, $3, 'admin', $4)
     RETURNING id`,
    ['admin@campus.edu', adminHash, 'University System Administrator', 'Superintendent of campus IT infrastructure, facilities, and academic portals.']
  );
  const adminId = adminRes.rows[0].id;

  // 2. Profiles
  await query(
    `INSERT INTO student_profiles (user_id, roll_number, department, semester, batch_year, cgpa, skills, github_url, linkedin_url)
     VALUES ($1, '21CS042', 'Computer Science & Engineering', 6, 2026, 8.85, $2, 'https://github.com/aarav-sharma', 'https://linkedin.com/in/aarav-sharma')`,
    [studentId, JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Python'])]
  );

  await query(
    `INSERT INTO faculty_profiles (user_id, employee_id, department, designation, specialization, cabin_location, office_hours)
     VALUES ($1, 'FAC-CS-108', 'Computer Science & Engineering', 'Associate Professor', 'Distributed Systems & AI', 'Block B, Cabin 204', 'Mon-Thu 2:00 PM - 4:00 PM')`,
    [facultyId]
  );

  // 3. Seed Projects
  const projRes1 = await query(
    `INSERT INTO projects (title, description, category, technologies, owner_id, status, max_members)
     VALUES ($1, $2, $3, $4, $5, 'in_progress', 4)
     RETURNING id`,
    [
      'Smart Campus BLE Indoor Navigation',
      'Indoor beacon mesh network routing students through university complexes and library stacks.',
      'Internet of Things',
      JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'MQTT', 'BLE']),
      studentId
    ]
  );
  const proj1Id = projRes1.rows[0].id;

  await query(
    `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'leader')`,
    [proj1Id, studentId]
  );

  // 4. Tasks for Project
  await query(
    `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by)
     VALUES ($1, 'Mount Corridors Beacon Hardware', 'Install BLE beacons along CS building hallways', 'completed', 'high', $2, $2)`,
    [proj1Id, studentId]
  );
  await query(
    `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by)
     VALUES ($1, 'Connect MQTT broker to backend API', 'Ingest sensor telemetry into PostgreSQL', 'in_progress', 'urgent', $2, $2)`,
    [proj1Id, studentId]
  );
  await query(
    `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by)
     VALUES ($1, 'Design Mobile Map Interface', 'Render SVG pathfinding maps with interactive pinch-zoom', 'todo', 'medium', $2, $2)`,
    [proj1Id, studentId]
  );

  // 5. Seed Notes
  await query(
    `INSERT INTO notes (title, subject, department, semester, file_url, file_name, file_size_bytes, uploaded_by, download_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      'Database Management Systems - Query Optimization & B+ Trees',
      'Database Management Systems',
      'Computer Science & Engineering',
      5,
      '/uploads/dbms_optimization.pdf',
      'dbms_optimization.pdf',
      3145728,
      facultyId,
      42
    ]
  );
  await query(
    `INSERT INTO notes (title, subject, department, semester, file_url, file_name, file_size_bytes, uploaded_by, download_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      'Operating Systems - Synchronization & Semaphore Solutions',
      'Operating Systems',
      'Computer Science & Engineering',
      4,
      '/uploads/os_semaphores.pdf',
      'os_semaphores.pdf',
      2097152,
      studentId,
      28
    ]
  );

  // 6. Seed Internships
  const internRes = await query(
    `INSERT INTO internships (company_name, role_title, location, work_type, stipend_salary, eligibility, required_skills, application_link, posted_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      'Google Cloud India',
      'Cloud Engineering Intern 2026',
      'Bengaluru / Hyderabad',
      'Hybrid',
      '₹60,000 / month',
      'Pre-final year B.Tech CS/IT students, CGPA >= 8.0, sound DSA & system foundations.',
      JSON.stringify(['Go', 'Python', 'Kubernetes', 'Docker', 'GCP']),
      'https://careers.google.com/jobs',
      adminId
    ]
  );
  const internId = internRes.rows[0].id;

  // Student application tracking entry
  await query(
    `INSERT INTO applications (user_id, internship_id, status, notes)
     VALUES ($1, $2, 'Interview', 'Technical screen round scheduled for upcoming week')`,
    [studentId, internId]
  );

  // 7. Seed Campus Service Ticket
  const ticketRes = await query(
    `INSERT INTO service_tickets (ticket_code, category, description, location, priority, status, created_by, assigned_to)
     VALUES ('TICK-902144', 'Wi-Fi & Network', 'Library 2nd Floor AP-4 dropouts during afternoon study hours.', 'Central University Library, 2nd Floor', 'High', 'In Progress', $1, $2)
     RETURNING id`,
    [studentId, adminId]
  );
  const ticketId = ticketRes.rows[0].id;

  await query(
    `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by, note)
     VALUES ($1, 'Open', 'In Progress', $2, 'IT network technician dispatched to replace PoE switch')`,
    [ticketId, adminId]
  );

  await query(
    `INSERT INTO ticket_comments (ticket_id, user_id, comment)
     VALUES ($1, $2, 'Technician on-site testing throughput on 5GHz spectrum.')`,
    [ticketId, adminId]
  );

  // 8. Seed Events
  await query(
    `INSERT INTO events (title, description, category, event_date, location, max_capacity, organizer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'Campus Annual Hackathon 2026',
      '36-hour hackathon bringing together 300+ students across software, robotics, and design to build university-grade solutions.',
      'Hackathon',
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      'Campus Innovation Hub & Auditorium',
      300,
      facultyId
    ]
  );

  // 9. Seed Announcements
  await query(
    `INSERT INTO announcements (title, content, category, priority, author_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      'Mid-Semester Project Review Submissions Due Friday',
      'All final and pre-final year squads must upload repository links and task milestones before Friday 5:00 PM.',
      'Academic Notice',
      'high',
      facultyId
    ]
  );

  // 10. Seed Marketplace
  await query(
    `INSERT INTO marketplace_listings (title, description, category, price, is_free_or_lost, contact_info, seller_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'Casio FX-991EX Scientific Calculator (Mint Condition)',
      'Classwiz scientific calculator ideal for engineering math and electronics courses. Includes original case.',
      'Electronics',
      450.00,
      false,
      'Email: student@campus.edu or Hostel Block 3, Room 204',
      studentId
    ]
  );

  console.log('[Seed] Seeding completed successfully!');
  console.log('[Seed] Demo Accounts Ready:');
  console.log('       🎓 Student: student@campus.edu / Password123!');
  console.log('       👨‍🏫 Faculty: faculty@campus.edu / Password123!');
  console.log('       🛡️ Admin:   admin@campus.edu   / AdminPassword123!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
