import { query } from '../config/db.js';

export const notesRepository = {
  async findAll({ department, semester, subject, search, uploadedBy, limit = 50, offset = 0 }) {
    let sql = `
      SELECT n.*, u.full_name as uploader_name, u.email as uploader_email, u.role as uploader_role
      FROM notes n
      JOIN users u ON n.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      params.push(department);
      sql += ` AND n.department = $${params.length}`;
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      sql += ` AND n.semester = $${params.length}`;
    }

    if (subject) {
      params.push(`%${subject.toLowerCase()}%`);
      sql += ` AND LOWER(n.subject) LIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(n.title) LIKE $${params.length} OR LOWER(n.subject) LIKE $${params.length})`;
    }

    if (uploadedBy) {
      params.push(uploadedBy);
      sql += ` AND n.uploaded_by = $${params.length}`;
    }

    params.push(limit);
    sql += ` ORDER BY n.created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id) {
    const sql = `
      SELECT n.*, u.full_name as uploader_name, u.email as uploader_email, u.role as uploader_role
      FROM notes n
      JOIN users u ON n.uploaded_by = u.id
      WHERE n.id = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async create(data) {
    const { title, subject, department, semester, fileUrl, fileName, fileSizeBytes, fileType, uploadedBy } = data;
    const sql = `
      INSERT INTO notes (title, subject, department, semester, file_url, file_name, file_size_bytes, file_type, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      title.trim(),
      subject.trim(),
      department,
      semester,
      fileUrl,
      fileName,
      fileSizeBytes || 1024 * 1024,
      fileType || 'application/pdf',
      uploadedBy,
    ];
    const res = await query(sql, params);
    return await this.findById(res.rows[0].id);
  },

  async incrementDownload(id) {
    const res = await query(
      'UPDATE notes SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count',
      [id]
    );
    return res.rows[0]?.download_count;
  },

  async delete(id) {
    const res = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }
};
