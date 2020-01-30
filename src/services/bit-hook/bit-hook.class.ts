import {Id, NullableId, Params, ServiceMethods} from '@feathersjs/feathers';
import {Application} from '../../declarations';
import {NotImplemented} from "@feathersjs/errors";
import {TwCommentService} from "../tw-comment/tw-comment.class";

enum BbObjectType {
  Branch = 'branch',
  Tag = 'tag',
}


interface BbLinked {
  links: {
    [key: string]: BbLink
  };
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
    changes: Array<BbChange>;
  };
}

interface BbChange extends BbLinked {
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

export class BitHookService implements ServiceMethods<any> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: BbHookPushBody, params?: Params): Promise<any> {
    const app = this.app;
    await data.push.changes.forEach((change): any => {
      change.commits.forEach((commit) => {
        this.processCommit(commit, app.service('tw-comment'))
          .then((result) => {
            return result;
          })
          .catch((reason => {
              console.error(reason);
              return false;
            })
          );
      });
    });

    return [];
  }

  async processCommit(commit: BbCommit, twComment: TwCommentService): Promise<boolean> {
    const matchAll = require('string.prototype.matchall');

    const matches = matchAll(commit.message, /#TW-(?<id>\d+)/gims);
    let count = 0;

    for(let match of matches) {
      // Count matches
      count++;

      if (match.groups === undefined || match.groups['id'] === null) {
        console.log("Missing ID: " + commit.message);
        return false;
      }
      let taskId = match.groups['id'];
      this.pushComment(taskId, commit).catch((error: any) => {
        console.log(`Could not push message to task: ${taskId}`);

        const errorMsg = (error.message !== undefined) ? error.message : error;
        console.error(errorMsg);
      });
    }

    if (count <= 0) {
      console.log("Not a match: " + commit.message);
      return false;
    }

    return true;
  }

  async pushComment(taskId: string, commit: BbCommit): Promise<boolean> {
    const twComment = this.app.service("tw-comment");
    const escape = require('escape-html');

    const author = escape(commit.author.raw);
    // Escape html and do a nl2br replace.
    const commitMessage = escape(commit.message).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');


    const taskComment: string = `
<b>${author}</b> pushed a <a href="${commit.links.html.href}">commit ${commit.hash.substr(0, 8)}</a> on branch ${commit.branch} for this task.

<blockquote>${commitMessage}</blockquote>
`;

    const taskData = {
      task_id:taskId,
      body: taskComment,
      isPrivate: true,
      'content-type': 'HTML',
    };

    console.info(`Pushing message to task ${taskId}`);
    return twComment.create(taskData);
  }


  // Not used methods
  async find (params?: Params): Promise<any> {throw new NotImplemented()}
  async get (id: Id, params?: Params): Promise<any> {throw new NotImplemented()}
  async update (id: NullableId, data: any, params?: Params): Promise<any> {throw new NotImplemented()}
  async patch (id: NullableId, data: any, params?: Params): Promise<any> {throw new NotImplemented()}
  async remove (id: NullableId, params?: Params): Promise<any> {throw new NotImplemented()}
}
