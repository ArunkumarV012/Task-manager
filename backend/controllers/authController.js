

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); 
const Joi = require('joi'); 

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // 
  });
};

const registerUser = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = value;


  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    try {

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, 'user'],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Could not register user' });
          }

          const newUser = { id: this.lastID, username, role: 'user' };
          const token = generateToken(newUser.id, newUser.role);

          res.status(201).json({
            token,
            user: { id: newUser.id, username: newUser.username, role: newUser.role },
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
};

const loginUser = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  const { username, password } = value;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (user && (await bcrypt.compare(password, user.password))) {
    
      const token = generateToken(user.id, user.role);

      res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    } else {
      
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
};

module.exports = {
  registerUser,
  loginUser,
};