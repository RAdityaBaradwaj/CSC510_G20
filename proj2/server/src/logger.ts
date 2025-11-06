import morgan from 'morgan';

import { env } from './env';

export const httpLogger = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev');

export const log = {
  info: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ level: 'info', message, meta }));
  },
  error: (message: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'error', message, meta }));
  },
};
