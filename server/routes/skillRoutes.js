const express = require('express');
const router = express.Router();
const { getAllSkills, createSkill, updateSkill, deleteSkill, getSkillMatrix } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/catalog', getAllSkills);
router.post('/catalog', authorize('Admin'), createSkill);
router.put('/catalog/:id', authorize('Admin'), updateSkill);
router.delete('/catalog/:id', authorize('Admin'), deleteSkill);
router.get('/matrix', getSkillMatrix);

module.exports = router;

