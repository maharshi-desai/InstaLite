const prisma = require('../db');
const userSummary = { id: true, username: true, fullname: true };

async function createPost(data) {
  if (!(await prisma.user.findUnique({ where: { id: data.authorId }, select: { id: true } }))) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return prisma.post.create({ data });
}

async function listPosts({ page, limit, skip, sortBy, order, where }) {
  const orderBy = sortBy === 'likes'
    ? [{ likes: { _count: order } }, { createdAt: 'desc' }]
    : { [sortBy]: order };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({ where, orderBy, skip, take: limit, include: { author: { select: userSummary }, _count: { select: { likes: true } } } }),
    prisma.post.count({ where }),
  ]);
  return { data, total };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: { select: userSummary }, _count: { select: { likes: true } } },
  });
}

async function updatePost(id, data) {
  try {
    return await prisma.post.update({
      where: { id: Number(id) },
      data,
      include: { author: { select: userSummary }, _count: { select: { likes: true } } },
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

async function deletePost(id) {
  try {
    await prisma.post.delete({ where: { id: Number(id) } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

async function listPostLikes(id) {
  const post = await prisma.post.findUnique({ where: { id: Number(id) }, select: { id: true } });
  if (!post) return null;
  return prisma.like.findMany({
    where: { postId: Number(id) },
    orderBy: { user: { username: 'asc' } },
    select: { user: { select: userSummary } },
  }).then((likes) => likes.map((like) => like.user));
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost, listPostLikes };
