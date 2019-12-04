import {HookContext} from "@feathersjs/feathers";
import {NotAcceptable, NotAuthenticated} from "@feathersjs/errors";

const disable = (context: HookContext) => {
  throw new NotAcceptable();
};

const requireToken = (context: HookContext) => {
  if (context.params.query !== undefined && !context.params.query.hasOwnProperty('token')) {
    throw new NotAcceptable("Missing token parameter");
  }
  const token: string|boolean = context.params.query ? context.params.query['token'] : false;
  if (token && token !== process.env.APP_AUTH_TOKEN) {
    throw new NotAuthenticated("Invalid token.");
  }
};

export default {
  before: {
    all: [],
    find: disable,
    get: disable,
    create: [
      requireToken
    ],
    update: disable,
    patch: disable,
    remove: disable
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
