import { Application } from '../declarations';
import bitHook from './bit-hook/bit-hook.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(bitHook);
}
