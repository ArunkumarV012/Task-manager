
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');


const db = require('./models');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use('/api', require('./routes/auth')); 
app.use('/api/tasks', require('./routes/tasks')); 

app.get('/', (req, res) => {
  res.send('Task Manager API Running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));