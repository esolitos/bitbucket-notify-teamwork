import assert from 'assert';
import app from '../../src/app';

describe('\'bb-webhook\' service', () => {
  it('registered the service', () => {
    const service = app.service('bb-webhook');

    assert.ok(service, 'Registered the service');
  });
});
