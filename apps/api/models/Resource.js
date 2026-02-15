const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    type: {
        type: String,
        enum: ['room', 'equipment', 'vehicle', 'other'],
        default: 'room'
    },
    capacity: {
        type: Number,
        default: 1
    },

    // Availability (simplified for now)
    availability: {
        startTime: String, // e.g., "09:00"
        endTime: String,   // e.g., "17:00"
        days: [Number]     // [1,2,3,4,5]
    },

    // Linked Calendar (if booked via calendar)
    calendarIntegration: {
        provider: { type: String, enum: ['google', 'microsoft'] },
        resourceEmail: String, // Often resources have emails in Google/Exchange
        calendarId: String
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
