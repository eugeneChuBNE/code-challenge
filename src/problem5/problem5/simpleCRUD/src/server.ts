import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

import BaseRouter from '@src/routes';
import itemsRouter from '@src/routes/items';

import Paths from '@src/common/constants/Paths';
import ENV from '@src/common/constants/ENV';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { NodeEnvs } from '@src/common/constants';

/******************************************************************************
 * App Setup
 ******************************************************************************/

const app = express();

/******************************************************************************
 * Middleware
 ******************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

if (ENV.NodeEnv === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

/******************************************************************************
 * APIs
 * - Template APIs under /api (Paths.Base)
 * - SQLite Items CRUD under /api/items
 ******************************************************************************/

app.use(Paths.Base, BaseRouter);
app.use(`${Paths.Base}/items`, itemsRouter);

/******************************************************************************
 * Static & Views
 ******************************************************************************/

// Views directory (HTML templates)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Public static assets (js/css/img)
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Home -> Items page
app.get('/', (_req: Request, res: Response) => {
  return res.redirect('/items');
});

app.get('/items', (_req: Request, res: Response) => {
  return res.sendFile('items.html', { root: viewsDir });
});

/******************************************************************************
 * 404 handler (for non-matched routes)
 ******************************************************************************/

app.use((req: Request, res: Response) => {
  res.status(HttpStatusCodes.NOT_FOUND).json({ error: `Route not found: ${req.method} ${req.path}` });
});

/******************************************************************************
 * Error handlers
 ******************************************************************************/

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  if (err instanceof RouteError) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
});

export default app;
