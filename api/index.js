const http = require('http');

module.exports = (req, res) => {
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathParam = parsedUrl.searchParams.get('__path');

    parsedUrl.searchParams.delete('__path');
    const remainingQuery = parsedUrl.searchParams.toString();

    let targetPath;
    if (pathParam !== null) {
      targetPath = '/api' + pathParam + (remainingQuery ? '?' + remainingQuery : '');
    } else {
      const matched = req.headers['x-matched-path'] || req.url;
      targetPath = matched.startsWith('/api') ? matched : '/api' + matched;
    }

    const headers = { ...req.headers };
    delete headers.host;

    const proxyReq = http.request(
      {
        host: '3.25.190.167',
        port: 3000,
        path: targetPath,
        method: req.method,
        headers: headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Backend unreachable', details: err.message }));
      }
    });

    req.pipe(proxyReq);
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Proxy Error', message: error.message }));
    }
  }
};
