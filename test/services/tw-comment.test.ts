import assert from 'assert';
import app from '../../src/app';

describe('\'TwComment\' service', () => {
  it('registered the service', () => {
    const service = app.service('tw-comment');

    assert.ok(service, 'Registered the service');
  });
});
