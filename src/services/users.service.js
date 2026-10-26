const prisma = require('../db');

const userSummary = { id: true, username: true, fullname: true };

async function createUser(data) {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    if (error.code === 'P2002') throw Object.assign(new Error('username or email already taken'), { status: 409 });
    throw error;
  }
}

async function listUsers({ page, limit, skip, sortBy, order, where }) {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy: { [sortBy]: order }, skip, take: limit }),
    prisma.user.count({ where }),
  ]);
  return { data, total };
}

const getUserById = (id) => prisma.user.findUnique({ where: { id: Number(id) } });

async function getUserWithCounts(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { posts: true, likes: true } } },
  });
}

async function updateUser(id, data) {
  try {
    return await prisma.user.update({ where: { id: Number(id) }, data });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

async function deleteUser(id) {
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

async function listUserPosts(id, { page, limit, skip }) {
  const where = { authorId: Number(id) };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { _count: { select: { likes: true } } } }),
    prisma.post.count({ where }),
  ]);
  return { data, total };
}

async function listLikedPosts(id, { page, limit, skip }) {
  const where = { likes: { some: { userId: Number(id) } } };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { author: { select: userSummary }, _count: { select: { likes: true } } } }),
    prisma.post.count({ where }),
  ]);
  return { data, total };
}

module.exports = { createUser, listUsers, getUserById, getUserWithCounts, updateUser, deleteUser, listUserPosts, listLikedPosts };
