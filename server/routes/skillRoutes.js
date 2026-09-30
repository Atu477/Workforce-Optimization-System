const express = require('express');
const router = express.Router();
const { getAllSkills, createSkill, getSkillMatrix } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/catalog', getAllSkills);
router.post('/catalog', authorize('Admin'), createSkill);
router.get('/matrix', getSkillMatrix);

module.exports = router;
