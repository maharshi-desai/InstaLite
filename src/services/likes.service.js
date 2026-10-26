const prisma = require('../db');

async function likePost(postId, userId) {
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) {
    throw Object.assign(new Error('Post not found'), { status: 404 });
  }
  if (!(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  try {
    return await prisma.like.create({ data: { postId, userId } });
  } catch (error) {
    if (error.code === 'P2002') throw Object.assign(new Error('Already liked'), { status: 409 });
    throw error;
  }
}

async function unlikePost(postId, userId) {
  try {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

module.exports = { likePost, unlikePost };
