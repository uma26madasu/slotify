const AuditLog = require('../models/AuditLog');
const winston = require('winston');

// Configure Winston logger for file output
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'slotify-api' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/audit.log' })
    ]
});

// If we're not in production then log to the `console` 
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

/**
 * Log an audit event
 * @param {Object} params - The log parameters
 * @param {String} params.userId - The user performin the action
 * @param {String} params.action - The action name (enum from Model)
 * @param {String} params.resourceId - ID of the affected resource
 * @param {String} params.resourceType - Type of resource (e.g., 'Booking')
 * @param {Object} params.details - Additional JSON details
 * @param {Object} params.req - The express request object (optional, extracts IP/UserAgent)
 */
const logAudit = async ({ userId, action, resourceId, resourceType, details, req }) => {
    try {
        // 1. Log to DB
        const logData = {
            userId,
            action,
            resourceId,
            resourceType,
            details,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent'],
            timestamp: new Date()
        };

        await AuditLog.create(logData);

        // 2. Log to File (Winston)
        logger.info('Audit Event', logData);

    } catch (error) {
        // Fallback: don't crash if audit logging fails, just console error
        console.error('SERVER_ERROR: Failed to write audit log', error);
    }
};

module.exports = {
    logAudit,
    logger
};
