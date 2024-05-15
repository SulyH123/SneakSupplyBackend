const app = require('./app.js');
const port = process.env.PORT || 5000;
const http = require('http').Server(app);


app.get('/', (req, res) => {
  res.send('app is working');
});

http.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  http.close(() => {
    process.exit(1);
  });
});

