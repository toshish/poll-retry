const {describe, it} = require('mocha');
const assert = require('assert').strict;

const {Poller} = require('../index');

describe('Poller', function () {
    describe('#start()', function () {
        it('should start polling.', function (done) {
            let counter = 0;
            const pollFn = () => {
                counter++;
                // Print counter on every poll
                console.log(counter);
            };

            const poller = new Poller({
                pollFn
            });

            assert.equal(poller.status === 'not_started', true);

            poller.start();

            poller.on('poll', (wrapper, status) => {
                assert.equal(status === 'in_progress', true);
                poller.stop();
                done();
            });
        });


        it('should start polling and pass the polling parameter.', function (done) {
            const wrapper = {
                counter: 0
            };
            const pollFn = (wrapper) => {
                wrapper.counter++;
                return wrapper;
            };

            const poller = new Poller({
                pollFn,
                pollFnParameters: wrapper
            });

            assert.equal(poller.status === 'not_started', true);

            poller.start();

            poller.on('poll', (wrapper, status) => {
                assert.equal(status === 'in_progress', true);
                assert.equal(wrapper.counter, 1);
                poller.stop();
                done();
            });
        });

        it('should start polling and stop after retry count is exhausted.', function (done) {
            const retryCount = 5;

            const wrapper = {
                counter: 0
            };

            const pollFn = (wrapper) => {
                wrapper.counter++;
                return wrapper;
            };

            const poller = new Poller({
                pollFn,
                pollFnParameters: wrapper,
                options: {
                    retryCount,
                    delay: 250
                }
            });

            assert.equal(poller.status === 'not_started', true);

            poller.start();

            poller.on('poll', (wrapper, status) => {
                console.log(wrapper.counter, status);
                if (wrapper.counter <= retryCount) {
                    assert.equal(status === 'in_progress', true);
                } else {
                    assert.equal(status === 'stopped', true);
                    done();
                }
            });
        });

        it('should start polling and stop after condition is met.', function (done) {
            const retryCount = 10;

            const wrapper = {
                counter: 0
            };

            const pollFn = (wrapper) => {
                wrapper.counter++;
                return wrapper;
            };

            const poller = new Poller({
                pollFn,
                pollFnParameters: wrapper,
                options: {
                    retryCount,
                    delay: 250
                },
                conditionFn: (wrapper) => {
                    if (wrapper.counter >= 5) {
                        console.log('condition met on counter value: ', wrapper.counter);
                        return true;
                    }
                    return false;
                }
            });

            assert.equal(poller.status === 'not_started', true);

            poller.start();

            poller.on('end', (wrapper, status) => {
                assert.equal(status === 'stopped', true);
                assert.equal(wrapper.counter >= 5, true);
                done();
            });
        });
    });

    describe('#stop()', function () {
        it('should stop polling', function (done) {
            const wrapper = {
                counter: 0
            };
            const pollFn = (wrapper) => {
                wrapper.counter++;
                return wrapper;
            };

            const poller = new Poller({
                pollFn,
                pollFnParameters: wrapper
            });

            assert.equal(poller.status === 'not_started', true);

            poller.start();

            poller.on('poll', (wrapper, status) => {
                assert.equal(status === 'in_progress', true);
                // console.log(wrapper, status)
                assert.equal(wrapper.counter, 1);
                poller.stop();
            });

            poller.on('end', (wrapper, status) => {
                assert.equal(status === 'stopped', true);
                // console.log('end', wrapper, status)
                assert.equal(wrapper.counter, 1);
                done();
            });
        });
    });

});