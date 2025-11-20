
const db = require('../models');
const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(''), 
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
});

const createTask = async (req, res) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, description, status } = value;
  const createdBy = req.user.id;

  db.run(
    `INSERT INTO tasks (title, description, status, createdBy) VALUES (?, ?, ?, ?)`,
    [title, description, status, createdBy],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creating task' });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description,
        status,
        createdBy,
        createdAt: new Date().toISOString(),
      });
    }
  );
};

const getTasks = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let sql = 'SELECT * FROM tasks';
  const params = [];

  const { status, title, limit = 10, offset = 0 } = req.query;

  const conditions = [];

  if (userRole !== 'admin') {
    conditions.push('createdBy = ?');
    params.push(userId);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (title) {
    conditions.push('title LIKE ?');
    params.push(`%${title}%`); 
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching tasks' });
    }

    res.json(rows);
  });
};

const getTaskById = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  let sql = 'SELECT * FROM tasks WHERE id = ?';
  const params = [taskId];

  if (userRole !== 'admin') {
    sql += ' AND createdBy = ?';
    params.push(userId);
  }

  db.get(sql, params, (err, task) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!task) return res.status(404).json({ message: 'Task not found or unauthorized' });

    res.json(task);
  });
};

const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { title, description, status } = value;

  db.get(`SELECT * FROM tasks WHERE id = ? AND createdBy = ?`, [taskId, userId], (err, task) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!task) return res.status(404).json({ message: 'Task not found or unauthorized' });

    db.run(
      `UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`,
      [title, description, status, taskId],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error updating task' });
        }
      
        res.json({ message: 'Task updated successfully', id: taskId, title, description, status });
      }
    );
  });
};

const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  let sql = 'DELETE FROM tasks WHERE id = ?';
  const params = [taskId];

  if (userRole !== 'admin') {
    sql += ' AND createdBy = ?';
    params.push(userId);
  }

  db.run(sql, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting task' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized for deletion' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};