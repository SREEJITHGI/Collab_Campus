import { query } from '../config/db.js';

export const communityRepository = {
  // --- EVENTS ---
  async findAllEvents(userId = null) {
    const sql = `
      SELECT e.*, u.full_name as organizer_name,
             (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registered_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      ORDER BY e.event_date ASC
    `;
    const res = await query(sql);
    const events = res.rows;

    if (userId) {
      return await Promise.all(
        events.map(async (ev) => {
          const regRes = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND user_id = $2',
            [ev.id, userId]
          );
          return {
            ...ev,
            is_registered: regRes.rows.length > 0,
          };
        })
      );
    }

    return events;
  },

  async createEvent(data) {
    const { title, description, category, eventDate, location, maxCapacity, organizerId, bannerUrl } = data;
    const sql = `
      INSERT INTO events (title, description, category, event_date, location, max_capacity, organizer_id, banner_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const res = await query(sql, [title, description, category, eventDate, location, maxCapacity || 100, organizerId, bannerUrl || null]);
    return res.rows[0];
  },

  async toggleEventRsvp(eventId, userId) {
    const check = await query(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (check.rows.length > 0) {
      await query(
        'DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2',
        [eventId, userId]
      );
      return { registered: false };
    } else {
      await query(
        'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)',
        [eventId, userId]
      );
      return { registered: true };
    }
  },

  // --- ANNOUNCEMENTS ---
  async findAllAnnouncements() {
    const sql = `
      SELECT a.*, u.full_name as author_name, u.role as author_role
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `;
    const res = await query(sql);
    return res.rows;
  },

  async createAnnouncement(data) {
    const { title, content, category = 'General', priority = 'normal', authorId } = data;
    const sql = `
      INSERT INTO announcements (title, content, category, priority, author_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [title, content, category, priority, authorId]);
    return res.rows[0];
  },

  // --- MARKETPLACE & LOST-AND-FOUND ---
  async findAllMarketplace({ category, search, status = 'available' }) {
    let sql = `
      SELECT m.*, u.full_name as seller_name, u.email as seller_email
      FROM marketplace_listings m
      JOIN users u ON m.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND m.status = $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND m.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(m.title) LIKE $${params.length} OR LOWER(m.description) LIKE $${params.length})`;
    }

    sql += ` ORDER BY m.created_at DESC`;
    const res = await query(sql, params);
    return res.rows;
  },

  async createMarketplaceListing(data) {
    const { title, description, category, price, isFreeOrLost, contactInfo, sellerId, imageUrl } = data;
    const sql = `
      INSERT INTO marketplace_listings (title, description, category, price, is_free_or_lost, contact_info, seller_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [
      title,
      description,
      category,
      price || 0.00,
      isFreeOrLost || false,
      contactInfo,
      sellerId,
      imageUrl || null,
    ];
    const res = await query(sql, params);
    return res.rows[0];
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    const sql = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 30
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  },

  async markNotificationRead(id, userId) {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  },

  async createNotification({ userId, title, message, type = 'system', link = null }) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(sql, [userId, title, message, type, link]);
    return res.rows[0];
  },

  // --- ANALYTICS DASHBOARD ---
  async getPlatformAnalytics() {
    const usersCountRes = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'student') as total_students,
        COUNT(*) FILTER (WHERE role = 'faculty') as total_faculty,
        COUNT(*) FILTER (WHERE role = 'admin') as total_admins
      FROM users
    `);

    const projectsRes = await query(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'in_progress') as active_projects,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_projects
      FROM projects
    `);

    const tasksRes = await query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks
      FROM tasks
    `);

    const notesRes = await query('SELECT COUNT(*) as count, COALESCE(SUM(download_count), 0) as total_downloads FROM notes');
    const jobsRes = await query('SELECT COUNT(*) as count FROM internships WHERE status = \'active\'');
    const ticketsRes = await query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'Open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_tickets,
        COUNT(*) FILTER (WHERE status = 'Resolved' OR status = 'Closed') as resolved_tickets
      FROM service_tickets
    `);

    const recentProjects = await query('SELECT id, title, category, status, created_at FROM projects ORDER BY created_at DESC LIMIT 5');
    const recentTickets = await query('SELECT id, ticket_code, category, priority, status, created_at FROM service_tickets ORDER BY created_at DESC LIMIT 5');

    return {
      users: usersCountRes.rows[0],
      projects: {
        ...projectsRes.rows[0],
        recent: recentProjects.rows,
      },
      tasks: tasksRes.rows[0],
      notes: notesRes.rows[0],
      internships: jobsRes.rows[0],
      tickets: {
        ...ticketsRes.rows[0],
        recent: recentTickets.rows,
      },
    };
  }
};
