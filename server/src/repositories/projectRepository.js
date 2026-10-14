import { query, getClient } from '../config/db.js';

export const projectRepository = {
  async findAll({ category, status, search, ownerId, memberUserId, limit = 50, offset = 0 }) {
    let sql = `
      SELECT p.id, p.title, p.description, p.category, p.technologies, p.owner_id, p.status,
             p.github_repo, p.live_demo, p.max_members, p.created_at, p.updated_at,
             u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    if (ownerId) {
      params.push(ownerId);
      sql += ` AND p.owner_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(p.title) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
    }

    if (memberUserId) {
      params.push(memberUserId);
      sql += ` AND p.id IN (SELECT project_id FROM project_members WHERE user_id = $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    const projects = res.rows;

    // Attach member count and task progress for each project
    const enriched = await Promise.all(
      projects.map(async (proj) => {
        const memberCountRes = await query(
          'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1',
          [proj.id]
        );
        const taskStatsRes = await query(
          `SELECT 
             COUNT(*) as total_tasks,
             COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
           FROM tasks WHERE project_id = $1`,
          [proj.id]
        );

        const totalTasks = parseInt(taskStatsRes.rows[0]?.total_tasks || 0, 10);
        const completedTasks = parseInt(taskStatsRes.rows[0]?.completed_tasks || 0, 10);
        const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...proj,
          member_count: parseInt(memberCountRes.rows[0]?.count || 0, 10),
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          progress_percent: progressPct,
        };
      })
    );

    return enriched;
  },

  async findById(id) {
    const projRes = await query(
      `SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (!projRes.rows[0]) return null;
    const project = projRes.rows[0];

    // Get members
    const membersRes = await query(
      `SELECT pm.id as membership_id, pm.role as project_role, pm.joined_at,
              u.id as user_id, u.full_name, u.email, u.avatar_url, u.role as system_role,
              sp.department, sp.skills
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [id]
    );

    // Get task summary
    const taskStatsRes = await query(
      `SELECT 
         COUNT(*) as total_tasks,
         COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
         COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
       FROM tasks WHERE project_id = $1`,
      [id]
    );

    const stats = taskStatsRes.rows[0];
    const total = parseInt(stats?.total_tasks || 0, 10);
    const completed = parseInt(stats?.completed_tasks || 0, 10);

    return {
      ...project,
      members: membersRes.rows,
      task_stats: {
        total,
        todo: parseInt(stats?.todo_tasks || 0, 10),
        in_progress: parseInt(stats?.in_progress_tasks || 0, 10),
        completed,
        progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    };
  },

  async create(projectData) {
    const { title, description, category, technologies, ownerId, status = 'in_progress', githubRepo, liveDemo, maxMembers = 5 } = projectData;

    const sql = `
      INSERT INTO projects (title, description, category, technologies, owner_id, status, github_repo, live_demo, max_members)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      title.trim(),
      description.trim(),
      category,
      JSON.stringify(technologies || []),
      ownerId,
      status,
      githubRepo || null,
      liveDemo || null,
      maxMembers,
    ];

    const res = await query(sql, params);
    const createdProject = res.rows[0];

    // Auto-add owner as project leader
    await query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'leader')`,
      [createdProject.id, ownerId]
    );

    return await this.findById(createdProject.id);
  },

  async update(id, updateData) {
    const { title, description, category, technologies, status, githubRepo, liveDemo, maxMembers } = updateData;

    const sql = `
      UPDATE projects
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          technologies = COALESCE($4, technologies),
          status = COALESCE($5, status),
          github_repo = COALESCE($6, github_repo),
          live_demo = COALESCE($7, live_demo),
          max_members = COALESCE($8, max_members),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const params = [
      title,
      description,
      category,
      technologies ? JSON.stringify(technologies) : null,
      status,
      githubRepo,
      liveDemo,
      maxMembers,
      id,
    ];

    await query(sql, params);
    return await this.findById(id);
  },

  async delete(id) {
    const res = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  },

  async addMember(projectId, userId, role = 'member') {
    const sql = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(sql, [projectId, userId, role]);
    return res.rows[0];
  },

  async removeMember(projectId, userId) {
    const res = await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id',
      [projectId, userId]
    );
    return res.rowCount > 0;
  },

  async isMember(projectId, userId) {
    const res = await query(
      'SELECT id, role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    return res.rows[0] || null;
  }
};
