const express = require('express');
const mongoose = require('mongoose');
const app = express();
const mongoURI = 'mongodb+srv://eniiwinner:<8KE076mhgYc0t8cS>@cluster0.ds4fi1q.mongodb.net/devops?retryWrites=true&w=majority'
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/devops', { useNewUrlParser: true, useUnifiedTopology: true });

const Dev = mongoose.model('Dev', { name: String });

app.get('/', async (req, res) => {
  const devs = await Dev.find();
  const names = devs.map(d => `<li>${d.name}</li>`).join('');
  res.send(`<h1>I’m building pipelines like a pro!</h1><ul>${names}</ul>`);
});

app.listen(3000, () => console.log('App running on port 3000'));



