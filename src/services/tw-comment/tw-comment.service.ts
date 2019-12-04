// Initializes the `TwComment` service on path `/tw-comment`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TwCommentService } from './tw-comment.class';
import hooks from './tw-comment.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tw-comment': TwCommentService & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    apiKey: app.get('teamwork_api_key'),
    teamWorkUrl: app.get('teamwork_domain'),
    commentUserId: app.get('teamwork_author_id'),
  };

  // Initialize our service with any options it requires
  app.use('/tw-comment', new TwCommentService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tw-comment');

  service.hooks(hooks);
};
