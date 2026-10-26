const router = require('express').Router();
const posts = require('../controllers/posts.controller');

router.post('/', posts.create);
router.get('/', posts.list);
router.get('/:id/likes', posts.listLikes);
router.post('/:id/likes', posts.like);
router.delete('/:id/likes/:userId', posts.unlike);
router.get('/:id', posts.getOne);
router.patch('/:id', posts.update);
router.delete('/:id', posts.remove);

module.exports = router;
