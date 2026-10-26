# InstaLite API

An Express API backed by PostgreSQL and Prisma. It includes user and post CRUD, pagination and filtering, authors, likes, and a deterministic development seed.

## Setup

1. Install Node.js and PostgreSQL.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string.
4. Create the database named in that connection string.
5. Apply the migrations with `npx prisma migrate dev`.
6. Seed the database with `npm run seed`.
7. Start the API with `npm start` (or `npm run dev` for watch mode).

The API listens on port 3000 by default. Set `PORT` to use another port. `GET /health` returns `{ "status": "OK" }`.

## API

### Users

- `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`
- `GET /users` accepts `page`, `limit`, `sortBy`, `order`, `isPrivate`, `search`, and `hasPosts`.
- `GET /users/:id/posts` returns the user's posts.
- `GET /users/:id/liked-posts` returns posts the user liked.

### Posts

- `POST /posts`, `GET /posts`, `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`
- `GET /posts` accepts `page`, `limit`, `sortBy` (`createdAt`, `updatedAt`, or `likes`), `order`, `location`, `search`, `from`, and `to`.
- Creating a post requires `imageUrl` and an existing `authorId`.
- `GET /posts/:id/likes`, `POST /posts/:id/likes`, and `DELETE /posts/:id/likes/:userId` manage likes.

Paginated endpoints return `{ "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }`.

## Database commands

- `npx prisma generate` generates Prisma Client.
- `npx prisma migrate dev --name <migration-name>` creates and applies a development migration.
- `npm run seed` clears and recreates the fixed sample users, posts, and likes.
