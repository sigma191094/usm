const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/news',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS NEWS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Error News:', error);
});

req.end();

const optionsComments = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/news/1/comments',
  method: 'GET'
};

const req2 = http.request(optionsComments, (res) => {
  console.log(`\n\nSTATUS COMMENTS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req2.end();

const optionsPost = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/news/1/comments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req3 = http.request(optionsPost, (res) => {
  console.log(`\n\nSTATUS POST COMMENTS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req3.on('error', (e) => console.error(e));
req3.write(JSON.stringify({ content: 'test' }));
req3.end();

