import assert from 'assert';
import app from '../../src/app';

describe('\'tw\' service', () => {
  it('registered the service', () => {
    const service = app.service('tw');

    assert.ok(service, 'Registered the service');
  });
});
