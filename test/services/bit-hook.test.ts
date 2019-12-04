import assert from 'assert';
import app from '../../src/app';

describe('\'BitHook\' service', () => {
  it('registered the service', () => {
    const service = app.service('webhook/bb');

    assert.ok(service, 'Registered the service');
  });
});
