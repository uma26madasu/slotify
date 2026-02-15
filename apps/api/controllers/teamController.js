const Team = require('../models/Team');
const User = require('../models/User');

// Create Team
exports.createTeam = async (req, res) => {
    try {
        const { name, members } = req.body;

        // Default current user as leader
        const teamMembers = [{
            userId: req.user.userId,
            role: 'leader'
        }];

        // Add other members if provided
        if (members && Array.isArray(members)) {
            // In a real app, validate these userIds exist
            members.forEach(m => teamMembers.push({ userId: m, role: 'member' }));
        }

        const team = await Team.create({
            name,
            members: teamMembers
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
};

// Get My Teams
exports.getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            'members.userId': req.user.userId
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams' });
    }
};

// Add Member
exports.addMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Check permissions (must be leader)
        const isLeader = team.members.find(m =>
            m.userId.toString() === req.user.userId && m.role === 'leader'
        );

        if (!isLeader) return res.status(403).json({ message: 'Not authorized' });

        // Find user to add
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) return res.status(404).json({ message: 'User not found' });

        // Check if already member
        if (team.members.find(m => m.userId.toString() === userToAdd._id.toString())) {
            return res.status(400).json({ message: 'User already in team' });
        }

        team.members.push({ userId: userToAdd._id, role: role || 'member' });
        await team.save();

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error adding member' });
    }
};
