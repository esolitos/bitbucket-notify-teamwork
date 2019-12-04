import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import {GeneralError, NotImplemented} from "@feathersjs/errors";

export interface TwCommentInterface {
  id?: string;
  task_id?: string;
  body: string;
  notify?: string;
  isPrivate?: boolean;
  'content-type'?: string;
  'author-id'?: string;
}

interface TwApiCommentResponse {
  commentId: string;
  STATUS: 'OK' | 'ERROR';
}

interface ServiceOptions {
  apiKey: string;
  teamWorkUrl: string;
  commentUserId?: string;
}

export class TwCommentService implements ServiceMethods<any> {
  app: Application;
  options: ServiceOptions;
  // Ref. https://github.com/moshie/teamwork-api
  teamWorkApi: any;

  constructor (options: ServiceOptions, app: Application) {
    this.options = options;
    this.app = app;

    if (!(this.options.apiKey && this.options.teamWorkUrl)) {
      throw new GeneralError("Missing API key and/or domain, please refer to the README to configure the service.");
    }

    this.teamWorkApi = require('teamwork-api')(this.options.apiKey, this.options.teamWorkUrl, true);
  }

  async create (commentData: TwCommentInterface): Promise<boolean> {
    // Override the author of the comment based on the configuration.
    if (this.options.commentUserId !== undefined) {
      commentData["author-id"] = this.options.commentUserId;
    }

    const result: TwApiCommentResponse = await this.teamWorkApi.tasks.createComment(commentData.task_id, {comment: commentData});
    return result.STATUS === 'OK';
  }

  // Not used methods
  async find (params?: Params): Promise<any> {throw new NotImplemented()}
  async get (id: Id, params?: Params): Promise<any> {throw new NotImplemented()}
  async update (id: NullableId, data: any, params?: Params): Promise<any> {throw new NotImplemented()}
  async patch (id: NullableId, data: any, params?: Params): Promise<any> {throw new NotImplemented()}
  async remove (id: NullableId, params?: Params): Promise<any> {throw new NotImplemented()}
}
