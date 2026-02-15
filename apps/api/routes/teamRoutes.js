const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.post('/', protect, teamController.createTeam);
router.get('/', protect, teamController.getMyTeams);
router.post('/:id/members', protect, teamController.addMember);

module.exports = router;
