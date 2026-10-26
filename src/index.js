require('dotenv/config');
const express = require('express');
const prisma = require('./db');
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');

const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.status(200).json({ status: 'OK' }));
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => console.log(`Server started on port ${port}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
