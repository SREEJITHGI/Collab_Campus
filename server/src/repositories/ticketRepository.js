import { query } from '../config/db.js';

export const ticketRepository = {
  async findAll({ category, status, priority, createdBy, assignedTo, limit = 50, offset = 0 }) {
    let sql = `
      SELECT t.*,
             u.full_name as creator_name, u.email as creator_email, u.role as creator_role,
             a.full_name as assigned_name, a.email as assigned_email
      FROM service_tickets t
      JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND t.category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      sql += ` AND t.priority = $${params.length}`;
    }

    if (createdBy) {
      params.push(createdBy);
      sql += ` AND t.created_by = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      sql += ` AND t.assigned_to = $${params.length}`;
    }

    params.push(limit);
    sql += ` ORDER BY t.created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id) {
    const sql = `
      SELECT t.*,
             u.full_name as creator_name, u.email as creator_email, u.role as creator_role,
             a.full_name as assigned_name, a.email as assigned_email
      FROM service_tickets t
      JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = $1
    `;
    const res = await query(sql, [id]);
    if (!res.rows[0]) return null;
    const ticket = res.rows[0];

    // Hydrate comments
    const commentsRes = await query(
      `SELECT c.*, u.full_name as commenter_name, u.role as commenter_role, u.avatar_url
       FROM ticket_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Hydrate status history
    const historyRes = await query(
      `SELECT h.*, u.full_name as changer_name, u.role as changer_role
       FROM ticket_status_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.ticket_id = $1
       ORDER BY h.changed_at ASC`,
      [id]
    );

    return {
      ...ticket,
      comments: commentsRes.rows,
      history: historyRes.rows,
    };
  },

  async create(data) {
    const { category, description, location, priority = 'Medium', createdBy } = data;
    const ticketCode = `TICK-${Date.now().toString().slice(-6)}`;

    const sql = `
      INSERT INTO service_tickets (ticket_code, category, description, location, priority, status, created_by)
      VALUES ($1, $2, $3, $4, $5, 'Open', $6)
      RETURNING *
    `;
    const params = [ticketCode, category, description.trim(), location.trim(), priority, createdBy];
    const res = await query(sql, params);
    const created = res.rows[0];

    // Initial audit entry in ticket_status_history
    await query(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by, note)
       VALUES ($1, NULL, 'Open', $2, 'Service ticket initially opened by student')`,
      [created.id, createdBy]
    );

    return await this.findById(created.id);
  },

  async updateStatus(ticketId, newStatus, changedBy, note = '') {
    const currentRes = await query('SELECT status FROM service_tickets WHERE id = $1', [ticketId]);
    const oldStatus = currentRes.rows[0]?.status || 'Open';

    await query(
      `UPDATE service_tickets
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newStatus, ticketId]
    );

    // Audit status change
    await query(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, oldStatus, newStatus, changedBy, note || `Status transitioned to ${newStatus}`]
    );

    return await this.findById(ticketId);
  },

  async assignStaff(ticketId, assignedToStaffId, changedBy) {
    await query(
      `UPDATE service_tickets
       SET assigned_to = $1, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [assignedToStaffId, ticketId]
    );

    await query(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by, note)
       VALUES ($1, 'Open', 'Assigned', $2, 'Ticket dispatched to maintenance staff')`,
      [ticketId, changedBy]
    );

    return await this.findById(ticketId);
  },

  async addComment(ticketId, userId, comment) {
    const sql = `
      INSERT INTO ticket_comments (ticket_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(sql, [ticketId, userId, comment.trim()]);
    return res.rows[0];
  }
};
