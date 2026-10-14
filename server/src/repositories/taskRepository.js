import { query } from '../config/db.js';

export const taskRepository = {
  async findByProject(projectId, { status, priority, assignedTo } = {}) {
    let sql = `
      SELECT t.*, 
             u.full_name as assigned_name, u.email as assigned_email, u.avatar_url as assigned_avatar,
             c.full_name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.project_id = $1
    `;
    const params = [projectId];

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      sql += ` AND t.priority = $${params.length}`;
    }

    if (assignedTo) {
      params.push(assignedTo);
      sql += ` AND t.assigned_to = $${params.length}`;
    }

    sql += ` ORDER BY t.created_at ASC`;

    const res = await query(sql, params);
    return res.rows;
  },

  async findById(taskId) {
    const sql = `
      SELECT t.*, 
             u.full_name as assigned_name, u.email as assigned_email, u.avatar_url as assigned_avatar,
             c.full_name as creator_name,
             p.owner_id as project_owner_id, p.title as project_title
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.id = $1
    `;
    const res = await query(sql, [taskId]);
    return res.rows[0] || null;
  },

  async create(data) {
    const { projectId, title, description, status = 'todo', priority = 'medium', assignedTo = null, createdBy, dueDate = null } = data;

    const sql = `
      INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [
      projectId,
      title.trim(),
      description || null,
      status,
      priority,
      assignedTo || null,
      createdBy,
      dueDate || null,
    ];

    const res = await query(sql, params);
    return await this.findById(res.rows[0].id);
  },

  async update(taskId, data) {
    const { title, description, status, priority, assignedTo, dueDate } = data;

    const sql = `
      UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          assigned_to = CASE WHEN $5::text = '__UNASSIGN__' THEN NULL WHEN $5 IS NOT NULL THEN $5::integer ELSE assigned_to END,
          due_date = COALESCE($6, due_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const params = [
      title,
      description,
      status,
      priority,
      assignedTo !== undefined ? assignedTo : null,
      dueDate,
      taskId,
    ];

    await query(sql, params);
    return await this.findById(taskId);
  },

  async delete(taskId) {
    const res = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);
    return res.rowCount > 0;
  }
};
