import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

const port = 5001;
app.listen(port, '127.0.0.1', () => {
  console.log(`Test server running on port ${port} at 127.0.0.1`);
  
  // Also test port binding
  import('net').then(net => {
    const server = net.createServer();
    server.listen(5002, () => {
      console.log('Raw net server also working on 5002');
      server.close();
    });
  });
});
