const assert = require('assert');
const Infusionsoft = require('../index');
const is = new Infusionsoft();

describe('Utility', () => {
    describe('_parseFilters()', () => {
        it('should convert an object into a url encoded query string', () => {
            const mock = {
                since: '2017-01-01T22:17:59.039Z',
                until: '2017-01-01T22:17:59.039Z',
                limit: 20
            };

            assert.equal(is._parseFilters(mock), '?since=2017-01-01T22%3A17%3A59.039Z&until=2017-01-01T22%3A17%3A59.039Z&limit=20');
        });
    })
})