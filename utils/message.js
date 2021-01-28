const moment = require('moment-timezone');

function formatMessage(user, text, timezone) {
    return {
        user,
        text,
        time: moment().tz(timezone).format('h:mm a')
    }
}

module.exports = {
    formatMessage
};