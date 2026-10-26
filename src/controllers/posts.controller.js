const posts = require('../services/posts.service');
const likes = require('../services/likes.service');
const { parsePagination, paginated } = require('../utils/pagination');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const missingPost = (res) => res.status(404).json({ error: 'Post not found' });

const create = asyncHandler(async (req, res) => {
  const { imageUrl, caption, location, authorId } = req.body || {};
  if (!imageUrl || authorId === undefined || authorId === null || authorId === '') {
    return res.status(400).json({ error: 'imageUrl and authorId are required' });
  }
  if (!Number.isSafeInteger(Number(authorId)) || Number(authorId) < 1) return res.status(404).json({ error: 'User not found' });
  try {
    res.status(201).json(await posts.createPost({ imageUrl, caption, location, authorId: Number(authorId) }));
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.message });
    throw error;
  }
});

const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ error: pagination.error });
  const { sortBy = 'createdAt', order = 'desc', location, search, from, to } = req.query;
  if (!['createdAt', 'updatedAt', 'likes'].includes(sortBy)) return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
  if (!['asc', 'desc'].includes(order)) return res.status(400).json({ error: 'order must be asc or desc' });
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || Number.isNaN(Date.parse(value))) return false;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value).toISOString().slice(0, 10) === value;
    return true;
  };
  if ((from !== undefined && !validDate(from)) || (to !== undefined && !validDate(to))) {
    return res.status(400).json({ error: 'from and to must be valid dates' });
  }
  const where = {};
  if (location !== undefined) where.location = { equals: location, mode: 'insensitive' };
  if (search) where.caption = { contains: search, mode: 'insensitive' };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }
  const result = await posts.listPosts({ ...pagination, sortBy, order, where });
  res.json(paginated(result.data, result.total, pagination.page, pagination.limit));
});

const getOne = asyncHandler(async (req, res) => {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) return missingPost(res);
  const post = await posts.getPostById(req.params.id);
  return post ? res.json(post) : missingPost(res);
});

const update = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data = {};
  for (const field of ['caption', 'location']) if (Object.hasOwn(body, field)) data[field] = body[field];
  const post = await posts.updatePost(req.params.id, data);
  return post ? res.json(post) : missingPost(res);
});

const remove = asyncHandler(async (req, res) => {
  return await posts.deletePost(req.params.id) ? res.status(204).end() : missingPost(res);
});

const listLikes = asyncHandler(async (req, res) => {
  const result = await posts.listPostLikes(req.params.id);
  return result === null ? missingPost(res) : res.json(result);
});

const like = asyncHandler(async (req, res) => {
  const userId = req.body?.userId;
  if (userId === undefined || userId === null || userId === '') return res.status(400).json({ error: 'userId is required' });
  const postId = Number(req.params.id);
  const numericUserId = Number(userId);
  if (!Number.isSafeInteger(postId) || postId < 1) return missingPost(res);
  if (!Number.isSafeInteger(numericUserId) || numericUserId < 1) return res.status(404).json({ error: 'User not found' });
  try {
    res.status(201).json(await likes.likePost(postId, numericUserId));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    throw error;
  }
});

const unlike = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);
  const deleted = Number.isSafeInteger(postId) && Number.isSafeInteger(userId)
    ? await likes.unlikePost(postId, userId)
    : false;
  return deleted ? res.status(204).end() : res.status(404).json({ error: 'Like not found' });
});

module.exports = { create, list, getOne, update, remove, listLikes, like, unlike };
