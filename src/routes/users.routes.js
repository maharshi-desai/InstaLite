const router = require('express').Router();
const users = require('../controllers/users.controller');

router.post('/', users.create);
router.get('/', users.list);
router.get('/:id/posts', users.posts);
router.get('/:id/liked-posts', users.likedPosts);
router.get('/:id', users.getOne);
router.patch('/:id', users.update);
router.delete('/:id', users.remove);

module.exports = router;
