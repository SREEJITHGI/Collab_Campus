import { query } from '../config/db.js';

export const internshipRepository = {
  async findAll({ workType, search, status = 'active', userId = null, limit = 50, offset = 0 }) {
    let sql = `
      SELECT i.*, u.full_name as poster_name, u.role as poster_role
      FROM internships i
      JOIN users u ON i.posted_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }

    if (workType) {
      params.push(workType);
      sql += ` AND i.work_type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(i.company_name) LIKE $${params.length} OR LOWER(i.role_title) LIKE $${params.length} OR LOWER(i.location) LIKE $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY i.created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    const internships = res.rows;

    // Attach student bookmark state and application status if userId provided
    if (userId) {
      return await Promise.all(
        internships.map(async (item) => {
          const savedRes = await query(
            'SELECT id FROM saved_opportunities WHERE user_id = $1 AND internship_id = $2',
            [userId, item.id]
          );
          const appRes = await query(
            'SELECT id, status, notes, applied_at FROM applications WHERE user_id = $1 AND internship_id = $2',
            [userId, item.id]
          );

          return {
            ...item,
            is_saved: savedRes.rows.length > 0,
            application: appRes.rows[0] || null,
          };
        })
      );
    }

    return internships;
  },

  async findById(id, userId = null) {
    const sql = `
      SELECT i.*, u.full_name as poster_name, u.role as poster_role
      FROM internships i
      JOIN users u ON i.posted_by = u.id
      WHERE i.id = $1
    `;
    const res = await query(sql, [id]);
    if (!res.rows[0]) return null;
    const item = res.rows[0];

    if (userId) {
      const savedRes = await query(
        'SELECT id FROM saved_opportunities WHERE user_id = $1 AND internship_id = $2',
        [userId, id]
      );
      const appRes = await query(
        'SELECT id, status, notes, applied_at FROM applications WHERE user_id = $1 AND internship_id = $2',
        [userId, id]
      );
      item.is_saved = savedRes.rows.length > 0;
      item.application = appRes.rows[0] || null;
    }

    return item;
  },

  async create(data) {
    const { companyName, roleTitle, location, workType, stipendSalary, eligibility, requiredSkills, applicationLink, deadline, postedBy } = data;
    const sql = `
      INSERT INTO internships (company_name, role_title, location, work_type, stipend_salary, eligibility, required_skills, application_link, deadline, posted_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      companyName.trim(),
      roleTitle.trim(),
      location.trim(),
      workType || 'Hybrid',
      stipendSalary.trim(),
      eligibility.trim(),
      JSON.stringify(requiredSkills || []),
      applicationLink.trim(),
      deadline || null,
      postedBy,
    ];
    const res = await query(sql, params);
    return await this.findById(res.rows[0].id);
  },

  async toggleSave(userId, internshipId) {
    const existing = await query(
      'SELECT id FROM saved_opportunities WHERE user_id = $1 AND internship_id = $2',
      [userId, internshipId]
    );

    if (existing.rows.length > 0) {
      await query(
        'DELETE FROM saved_opportunities WHERE user_id = $1 AND internship_id = $2',
        [userId, internshipId]
      );
      return { is_saved: false };
    } else {
      await query(
        'INSERT INTO saved_opportunities (user_id, internship_id) VALUES ($1, $2)',
        [userId, internshipId]
      );
      return { is_saved: true };
    }
  },

  async getSavedOpportunities(userId) {
    const sql = `
      SELECT i.*, so.saved_at, u.full_name as poster_name
      FROM saved_opportunities so
      JOIN internships i ON so.internship_id = i.id
      JOIN users u ON i.posted_by = u.id
      WHERE so.user_id = $1
      ORDER BY so.saved_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async setApplicationStatus(userId, internshipId, status, notes = '') {
    const sql = `
      INSERT INTO applications (user_id, internship_id, status, notes, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, internship_id)
      DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const res = await query(sql, [userId, internshipId, status, notes]);
    return res.rows[0];
  },

  async getUserApplications(userId) {
    const sql = `
      SELECT a.*, i.company_name, i.role_title, i.location, i.work_type, i.stipend_salary, i.application_link
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.user_id = $1
      ORDER BY a.updated_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }
};
