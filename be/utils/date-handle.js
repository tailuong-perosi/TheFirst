const moment = require(`moment-timezone`);

class InputObject {
    constructor(timelineObject) {
        if (typeof timelineObject != 'object') {
            throw new Error('Typeof input must be object!');
        }
        return timelineObject;
    }
}

class HandleOptions {
    constructor(options) {
        this.timezone = (options && options.timezone) || 'Asia/Ho_Chi_Minh';
        this.timelinePrefix = (options && options.timelinePrefix) || '';
    }
}

/**
 *
 * @param {InputObject} timelineObject
 * @param {HandleOptions} options
 * @returns
 */
let createTimeline = (timelineObject, options) => {
    timelineObject = new InputObject(timelineObject);
    options = new HandleOptions(options || {});
    if (timelineObject[`${options.timelinePrefix}today`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment().tz(options.timezone).startOf(`days`).format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment().tz(options.timezone).endOf(`days`).format();
        delete timelineObject[`${options.timelinePrefix}today`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}yesterday`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment()
            .tz(options.timezone)
            .add(-1, `days`)
            .startOf(`days`)
            .format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment()
            .tz(options.timezone)
            .add(-1, `days`)
            .endOf(`days`)
            .format();
        delete timelineObject[`${options.timelinePrefix}yesterday`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}this_week`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment()
            .tz(options.timezone)
            .startOf(`weeks`)
            .add(1, 'days')
            .format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment()
            .tz(options.timezone)
            .endOf(`weeks`)
            .add(1, 'days')
            .format();
        delete timelineObject[`${options.timelinePrefix}this_week`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}last_week`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment()
            .tz(options.timezone)
            .add(-1, `weeks`)
            .startOf(`weeks`)
            .add(1, 'days')
            .format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment()
            .tz(options.timezone)
            .add(-1, `weeks`)
            .endOf(`weeks`)
            .add(1, 'days')
            .format();
        delete timelineObject[`${options.timelinePrefix}last_week`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}this_month`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment().tz(options.timezone).startOf(`months`).format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment().tz(options.timezone).endOf(`months`).format();
        delete timelineObject[`${options.timelinePrefix}this_month`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}last_month`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment()
            .tz(options.timezone)
            .add(-1, `months`)
            .startOf(`months`)
            .format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment()
            .tz(options.timezone)
            .add(-1, `months`)
            .endOf(`months`)
            .format();
        delete timelineObject[`${options.timelinePrefix}last_month`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}this_year`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment().tz(options.timezone).startOf(`years`).format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment().tz(options.timezone).endOf(`years`).format();
        delete timelineObject[`${options.timelinePrefix}this_year`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}last_year`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment()
            .tz(options.timezone)
            .add(-1, `years`)
            .startOf(`years`)
            .format();
        timelineObject[`${options.timelinePrefix}to_date`] = moment()
            .tz(options.timezone)
            .add(-1, `years`)
            .endOf(`years`)
            .format();
        delete timelineObject[`${options.timelinePrefix}last_year`];
        return timelineObject;
    }
    if (timelineObject[`${options.timelinePrefix}from_date`] != undefined) {
        timelineObject[`${options.timelinePrefix}from_date`] = moment(
            timelineObject[`${options.timelinePrefix}from_date`]
        )
            .tz(options.timezone)
            .startOf(`days`)
            .format();
    }
    if (timelineObject[`${options.timelinePrefix}to_date`] != undefined) {
        timelineObject[`${options.timelinePrefix}to_date`] = moment(timelineObject[`${options.timelinePrefix}to_date`])
            .tz(options.timezone)
            .endOf(`days`)
            .format();
    }
    return timelineObject;
};

let changeNumberToTime = (hours) => {
    let hour = Math.floor(hours);
    let minute = Math.ceil((hours - Math.floor(hours)) * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

module.exports = { createTimeline, changeNumberToTime };
