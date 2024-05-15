const moment = require('moment-timezone');

function addBusinessDaysEST(days) {
    let date = moment.tz(new Date(), "America/New_York"); // Set timezone to EST

    let addedDays = 0;
    while (addedDays < days) {
        date.add(1, 'days'); // add 1 day
        // If it's a weekend, don't count it
        if (date.day() !== 0 && date.day() !== 6) {
            addedDays++;
        }
    }
    return date;
};

function futureTimeInEST(days) {
    let date = moment.tz(new Date(), "America/New_York"); // Set timezone to EST
    date.add(days, 'days'); // add days
    return date;
};


module.exports={addBusinessDaysEST,futureTimeInEST}