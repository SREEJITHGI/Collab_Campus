import { query, getClient } from '../config/db.js';

export const userRepository = {
  async findByEmail(email) {
    const text = `
      SELECT u.*, 
        sp.roll_number, sp.department as student_department, sp.semester, sp.batch_year, sp.cgpa, sp.skills, sp.github_url, sp.linkedin_url, sp.resume_url,
        fp.employee_id, fp.department as faculty_department, fp.designation, fp.specialization, fp.cabin_location, fp.office_hours
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const res = await query(text, [email.trim()]);
    return res.rows[0] || null;
  },

  async findById(id) {
    const text = `
      SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.bio, u.phone, u.created_at, u.updated_at,
        sp.roll_number, sp.department as student_department, sp.semester, sp.batch_year, sp.cgpa, sp.skills, sp.github_url, sp.linkedin_url, sp.resume_url,
        fp.employee_id, fp.department as faculty_department, fp.designation, fp.specialization, fp.cabin_location, fp.office_hours
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
      WHERE u.id = $1
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  },

  async createUser(userData, client = null) {
    const { email, passwordHash, fullName, role, avatarUrl = null, bio = null, phone = null } = userData;
    const text = `
      INSERT INTO users (email, password_hash, full_name, role, avatar_url, bio, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, full_name, role, avatar_url, bio, phone, created_at
    `;
    const params = [email.toLowerCase().trim(), passwordHash, fullName.trim(), role, avatarUrl, bio, phone];
    const q = client ? client.query.bind(client) : query;
    const res = await q(text, params);
    return res.rows[0];
  },

  async createStudentProfile(profileData, client = null) {
    const { userId, rollNumber, department, semester, batchYear, cgpa, skills, githubUrl, linkedinUrl, resumeUrl } = profileData;
    const text = `
      INSERT INTO student_profiles (user_id, roll_number, department, semester, batch_year, cgpa, skills, github_url, linkedin_url, resume_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      userId,
      rollNumber || null,
      department,
      semester || 1,
      batchYear || new Date().getFullYear(),
      cgpa || null,
      JSON.stringify(skills || []),
      githubUrl || null,
      linkedinUrl || null,
      resumeUrl || null
    ];
    const q = client ? client.query.bind(client) : query;
    const res = await q(text, params);
    return res.rows[0];
  },

  async createFacultyProfile(profileData, client = null) {
    const { userId, employeeId, department, designation, specialization, cabinLocation, officeHours } = profileData;
    const text = `
      INSERT INTO faculty_profiles (user_id, employee_id, department, designation, specialization, cabin_location, office_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      userId,
      employeeId || null,
      department,
      designation || 'Assistant Professor',
      specialization || null,
      cabinLocation || null,
      officeHours || null
    ];
    const q = client ? client.query.bind(client) : query;
    const res = await q(text, params);
    return res.rows[0];
  },

  async updateUser(userId, data) {
    const { fullName, bio, phone, avatarUrl } = data;
    const text = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          bio = COALESCE($2, bio),
          phone = COALESCE($3, phone),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, full_name, role, avatar_url, bio, phone, updated_at
    `;
    const res = await query(text, [fullName, bio, phone, avatarUrl, userId]);
    return res.rows[0];
  },

  async updateStudentProfile(userId, data) {
    const { department, semester, cgpa, skills, githubUrl, linkedinUrl, resumeUrl } = data;
    const text = `
      UPDATE student_profiles
      SET department = COALESCE($1, department),
          semester = COALESCE($2, semester),
          cgpa = COALESCE($3, cgpa),
          skills = COALESCE($4, skills),
          github_url = COALESCE($5, github_url),
          linkedin_url = COALESCE($6, linkedin_url),
          resume_url = COALESCE($7, resume_url)
      WHERE user_id = $8
      RETURNING *
    `;
    const params = [
      department,
      semester,
      cgpa,
      skills ? JSON.stringify(skills) : null,
      githubUrl,
      linkedinUrl,
      resumeUrl,
      userId
    ];
    const res = await query(text, params);
    return res.rows[0];
  },

  async searchUsers({ role, skill, search, limit = 20, offset = 0 }) {
    let sql = `SELECT id, email, full_name, role, avatar_url, bio, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    const users = res.rows;
    if (!users || users.length === 0) return [];

    // Hydrate each user with their profile details
    const hydrated = await Promise.all(
      users.map(async (u) => {
        if (u.role === 'student') {
          const spRes = await query(
            'SELECT department as student_department, semester, skills, github_url, linkedin_url FROM student_profiles WHERE user_id = $1',
            [u.id]
          );
          return { ...u, ...(spRes.rows[0] || {}) };
        } else if (u.role === 'faculty') {
          const fpRes = await query(
            'SELECT department as faculty_department, designation, specialization FROM faculty_profiles WHERE user_id = $1',
            [u.id]
          );
          return { ...u, ...(fpRes.rows[0] || {}) };
        }
        return u;
      })
    );

    if (skill) {
      return hydrated.filter((u) => {
        const userSkills = u.skills || [];
        return JSON.stringify(userSkills).toLowerCase().includes(skill.toLowerCase());
      });
    }

    return hydrated;
  }
};
