const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },

    // Members with roles
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['leader', 'member', 'viewer'],
            default: 'member'
        }
    }],

    // Scheduling Logic
    schedulingType: {
        type: String,
        enum: ['round_robin', 'collective'], // Round Robin: assigns to one; Collective: requires all available
        default: 'round_robin'
    },

    // Shared calendars/resources
    sharedCalendars: [{
        provider: String, // 'google', 'microsoft'
        calendarId: String,
        description: String
    }],

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
