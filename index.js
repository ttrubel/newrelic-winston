'use strict';

const winston = require('winston');
const TransportStream = require('winston-transport');
const { LEVEL, MESSAGE } = require('triple-beam');

/**
 * Transport for reporting errors to newrelic.
 * @type {Newrelic}
 * @extends {TransportStream}
 */
module.exports = class Newrelic extends TransportStream {
    /**
     * Constructor function for the Console transport object responsible for
     * persisting log messages and metadata to a terminal or TTY.
     * @param {!Object} [options={}] - Options for this instance.
     */
    constructor(options = {}) {
        const env = options.env || process.env.NODE_ENV;
        super(options);
        this.newrelic = require('./newrelicHelper')(env);
        this.name = 'newrelic-winston';
    }

    /**
     *
     * @param {Object} info
     * @param {function} callback
     */
    log(level, msg, customAttributes = {}, callback) {
        const className = (customAttributes.event || 'Error').split('-').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join('')

        const data = {
            ...customAttributes,
            className
        }

        setImmediate(() => this.emit('logged', { level, msg, data }));

        if (level === 'error') {
            this.newrelic.noticeError(msg, data);
        }

        callback();
    }
};
