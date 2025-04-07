const express = require('express');
const mongoose = require('mongoose');
const app = express();
const mongoURI = `mongodb+srv://eniiwinner:${process.env.MONGO_PASSWORD}@cluster0.ds4fi1q.mongodb.net/devops?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 3000;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Dev = mongoose.model('Dev', { name: String });

app.get('/', async (req, res) => {
  try {
    const devs = await Dev.find();
    const names = devs.map(d => `<li>${d.name}</li>`).join('');
    res.send(`<h1>I’m building pipelines like a pro!</h1><ul>${names}</ul>`);
  } catch (err) {
    res.status(500).send('Error retrieving developers
