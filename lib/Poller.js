const EventEmitter = require('events');

const resolveStatus = (timeoutHandleId) => {
    if (timeoutHandleId === -1) {
        return 'not_started';
    }
    if (timeoutHandleId === -2) {
        return 'stopped';
    }
    if (timeoutHandleId !== -1 && timeoutHandleId !== -2) {
        return 'in_progress';
    }
};

module.exports = class Poller extends EventEmitter {

    constructor({pollFn,
                    pollFnParameters,
                    conditionFn,
                    options} = {}) {
        super();
        if (pollFn === undefined) {
            throw `1st parameter 'pollFn' must be provided`
        }

        if (typeof pollFn !== "function") {
            throw `Type of the 1st parameter 'pollFn' must be 'function'. Found '${typeof pollFn}'.`
        }

        if (conditionFn && typeof conditionFn !== "function") {
            throw `Type of the 3rd parameter 'conditionFn' must be 'function'. Found '${typeof conditionFn}'.`
        }


        const defaultOptions = {
            delay: 1000,
            initialDelay: 0,
            retryCount: -1
        };

        this.pollFn = pollFn;
        this.pollFnParameters = pollFnParameters || {};
        this.conditionFn = conditionFn || (() => false);
        this.options = options ? {...defaultOptions, ...options} : defaultOptions;
        this.timeoutHandleId = -1;
        this.status = 'not_started';
        this.lastResult = undefined;
    }

    start() {
        const poller = async () => {
            if (this.status === 'stopped') {
                return;
            }
            const result = await this.pollFn(this.pollFnParameters);
            if (!await this.conditionFn(result)) {
                this.timeoutHandleId = setTimeout(poller.bind(this), this.options.delay);
            } else {
                clearTimeout(this.timeoutHandleId);
                this.timeoutHandleId = -2;
            }
            this.status = resolveStatus(this.timeoutHandleId);
            this.lastResult = result;
            this.emit('poll', result, this.status);
        };
        this.timeoutHandleId = setTimeout(poller.bind(this), this.options.initialDelay);
    }

    stop() {
        if (typeof this.timeoutHandleId !== "number") {
            clearTimeout(this.timeoutHandleId);
            this.timeoutHandleId = -2;
            this.status = resolveStatus(this.timeoutHandleId);
            this.emit('end', this.lastResult, this.status);
        }
    }
}
