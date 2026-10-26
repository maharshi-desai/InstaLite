const users = require('../services/users.service');
const { parsePagination, paginated } = require('../utils/pagination');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const missing = (res) => res.status(404).json({ error: 'User not found' });

const create = asyncHandler(async (req, res) => {
  const { username, email, fullname, bio } = req.body || {};
  if (!username || !email || !fullname) return res.status(400).json({ error: 'username, email and fullname are required' });
  try {
    res.status(201).json(await users.createUser({ username, email, fullname, bio }));
  } catch (error) {
    if (error.status === 409) return res.status(409).json({ error: error.message });
    throw error;
  }
});

const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ error: pagination.error });
  const { sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = req.query;
  if (!['createdAt', 'username', 'fullname'].includes(sortBy)) return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
  if (!['asc', 'desc'].includes(order)) return res.status(400).json({ error: 'order must be asc or desc' });
  if (isPrivate !== undefined && !['true', 'false'].includes(isPrivate)) return res.status(400).json({ error: 'isPrivate must be true or false' });
  if (hasPosts !== undefined && !['true', 'false'].includes(hasPosts)) return res.status(400).json({ error: 'hasPosts must be true or false' });
  const where = {};
  if (isPrivate !== undefined) where.isPrivate = isPrivate === 'true';
  if (search) where.OR = [
    { username: { contains: search, mode: 'insensitive' } },
    { fullname: { contains: search, mode: 'insensitive' } },
  ];
  if (hasPosts !== undefined) where.posts = hasPosts === 'true' ? { some: {} } : { none: {} };
  const result = await users.listUsers({ ...pagination, sortBy, order, where });
  res.json(paginated(result.data, result.total, pagination.page, pagination.limit));
});

const getOne = asyncHandler(async (req, res) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) return missing(res);
  const user = await users.getUserWithCounts(req.params.id);
  return user ? res.json(user) : missing(res);
});

const update = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data = {};
  for (const field of ['fullname', 'bio', 'isPrivate']) if (Object.hasOwn(body, field)) data[field] = body[field];
  const user = await users.updateUser(req.params.id, data);
  return user ? res.json(user) : missing(res);
});

const remove = asyncHandler(async (req, res) => {
  return await users.deleteUser(req.params.id) ? res.status(204).end() : missing(res);
});

const posts = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ error: pagination.error });
  const user = await users.getUserById(req.params.id);
  if (!user) return missing(res);
  const result = await users.listUserPosts(req.params.id, pagination);
  res.json(paginated(result.data, result.total, pagination.page, pagination.limit));
});

const likedPosts = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ error: pagination.error });
  const user = await users.getUserById(req.params.id);
  if (!user) return missing(res);
  const result = await users.listLikedPosts(req.params.id, pagination);
  res.json(paginated(result.data, result.total, pagination.page, pagination.limit));
});

module.exports = { create, list, getOne, update, remove, posts, likedPosts };
