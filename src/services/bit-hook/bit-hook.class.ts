import {Id, NullableId, Params, ServiceMethods} from '@feathersjs/feathers';
import {Application } from '../../declarations';
import {NotImplemented} from "@feathersjs/errors";

interface Data {}

enum BbObjectType {
  Branch = 'branch',
  Tag = 'tag'
}

interface BbLinked {
  links: Array<BbLink>;
}

interface BbOwner extends BbLinked {
  uuid: string;
  display_name: string;
  account_id: string;
  nickname: string;
  type: string;
}

interface BbAuthor {
  raw: string;
  user: BbOwner;
}

interface BbRepository extends BbLinked {
  type: 'repository';
  uuid: string;
  scm: string;
  website: string | null;
  name: string;
  full_name: string;
  is_private: boolean;
  owner: BbOwner;
  project: BbProject;
}

interface BbProject extends BbLinked {
  key: string;
  uuid: string;
  type: 'project';
  name: string;
}

interface BbLink {
  href: string;
}

interface BbHookBody {
  actor: BbOwner;
  repository: BbRepository;
}

interface BbHookPushBody extends BbHookBody{
  push: {
    changes: Array<BbChanges>;
  };
}

interface BbChanges extends BbLinked {
  created: boolean,
  closed: boolean,
  forced: boolean,
  truncated: boolean,
  new: BbChangesMetadata | null;
  old: BbChangesMetadata | null;
  commits: Array<BbCommit>
}

interface BbChangesMetadata extends BbLinked {
  type: BbObjectType;
  name: string,
  target: any,
}

interface BbCommit extends BbLinked {
  hash: string;
  author: BbAuthor;
  summary: {
    [key: string]: string
  };
  parents: Array<BbCommit>;
  date: string;
  message: string;
  type: string,
  properties: {
    [key: string]: any
  };
}

interface ServiceOptions {}

export class BitHook implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: BbHookPushBody, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  // Not used methods
  async find (params?: Params): Promise<Data> {throw new NotImplemented()}
  async get (id: Id, params?: Params): Promise<Data> {throw new NotImplemented()}
  async update (id: NullableId, data: Data, params?: Params): Promise<any> {throw new NotImplemented()}
  async patch (id: NullableId, data: Data, params?: Params): Promise<any> {throw new NotImplemented()}
  async remove (id: NullableId, params?: Params): Promise<Data> {throw new NotImplemented()}
}
