import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Test server working', url: req.url }));
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
