import {Id, NullableId, Params, ServiceMethods} from '@feathersjs/feathers';
import {Application} from '../../declarations';
import {NotImplemented} from "@feathersjs/errors";
import {TwCommentService} from "../tw-comment/tw-comment.class";
import {existsSync, mkdirSync, writeFile} from "fs";

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
    const twService = app.service('tw-comment');
    await data.push.changes.forEach((change): void => {
      change.commits.forEach((commit) => {
        this.processCommit(data.repository, commit, twService)
          .catch(reason => console.error(reason));
      });
    });

    return [];
  }

  async processCommit(repository: BbRepository, commit: BbCommit, twComment: TwCommentService): Promise<boolean> {
    // Verify if we already processed the commit.
    if (this.isCommitProcessed(repository, commit)) {
      console.debug(`Skip already processed ${repository.full_name}#${commit.hash}`);
      return true;
    }

    const matchAll = require('string.prototype.matchall');
    const matches = matchAll(commit.message, /#TW-(?<id>\d+)/gims);
    let count = 0;

    // TODO: Ensure we post 1 comment for each TW task, not multiple!
    // Idea: Build a map of messages, indexed by taskId and commit hash (to avoid duplicates)
    // (requires updating tw comment body)
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
<b>${author}</b> pushed a <a href="${commit.links.html.href}">commit ${commit.hash.substr(0, 8)}</a> for this task.

<blockquote>${commitMessage}</blockquote>
`;

    const taskData = {
      'task_id': taskId,
      'body': taskComment,
      // An empty string in the "notify" means: do not notify anyone
      // while not changing the privacy.
      'notify': '',
      // 'isPrivate': true,
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

  private isCommitProcessed(repository: BbRepository, commit: BbCommit): boolean {
    const storage_path = this.app.get("commit_storage"),
      repo_name = repository.full_name,
      repo_dir = `${storage_path}/${repo_name}`,
      commit_file = `${repo_dir}/${commit.hash}`
    ;

    // Ensure the repository directory exists in the storage.
    if (!existsSync(repo_dir)){
      mkdirSync(repo_dir, {recursive: true});
    }

    // If a file matching teh commit hash exists, then the commit was already processed.
    if (existsSync(commit_file)) {
      return true;
    }

    writeFile(commit_file, commit.message, {mode: 0o660}, (err) => {
      if (err) {
        console.error(err);
      }
    })


    return false;
  }
}
