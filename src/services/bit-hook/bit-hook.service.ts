// Initializes the `BitHook` service on path `/webhook/bb`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BitHook } from './bit-hook.class';
import hooks from './bit-hook.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'webhook/bb': BitHook & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {};

  // Initialize our service with any options it requires
  app.use('/webhook/bb', new BitHook(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('webhook/bb');

  service.hooks(hooks);
}
