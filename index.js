require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting
const cors = require('cors'); // CORS support

const app = express();

// Enhanced MongoDB connection URI with additional options
const mongoURI = `mongodb+srv://eniiwinner:${encodeURIComponent(process.env.MONGO_PASSWORD)}@cluster0.ds4fi1q.mongodb.net/devops?retryWrites=true&w=majority&appName=DevOpsApp`;

// Database connection with improved settings
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Connection pool size
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000 // Socket timeout
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process on connection failure
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Mongoose model with validation
const Dev = mongoose.model('Dev', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

// Routes
app.get('/', async (req, res) => {
  try {
    const devs = await Dev.find().sort({ createdAt: -1 }).limit(10);
    const names = devs.map(d => `<li>${d.name} (since ${d.createdAt.toLocaleDateString()})</li>`).join('');
    res.send(`
      <h1>I'm building pipelines like a pro!</h1>
      <ul>${names}</ul>
      <form method="POST" action="/devs">
        <input type="text" name="name" placeholder="Developer name" required>
        <button type="submit">Add Developer</button>
      </form>
    `);
  } catch (err) {
    console.error('Error retrieving developers:', err);
    res.status(500).send('Error retrieving developers');
  }
});

app.post('/devs', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send('Name is required');
    }
    
    const newDev = new Dev({ name });
    await newDev.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error saving developer:', err);
    res.status(500).send('Error saving developer');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  res.json({ 
    status,
    dbState: mongoose.STATES[mongoose.connection.readyState],
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});