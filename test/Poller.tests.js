const {describe, it} = require('mocha');
const fetch = require('node-fetch');
const assert = require('assert').strict;

const {Poller} = require('../index');

describe('Poller', function () {
    describe('#start()', function () {
        it('should start polling', function (done) {
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