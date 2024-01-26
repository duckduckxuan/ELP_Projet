const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Si l'URL est la racine ou index.html, renvoyez la page HTML
    const html = fs.readFileSync('index.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/app.js') {
    // Si l'URL est app.js, renvoyez le script client
    const script = fs.readFileSync('app.js', 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(script);
  }
});

const port = 3000;
server.listen(port, () => { 
  console.log(`Le serveur écoute sur le port ${port}`);
});
