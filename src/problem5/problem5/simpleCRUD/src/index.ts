import logger from 'jet-logger';
import express from 'express';

import ENV from '@src/common/constants/ENV';
import server from './server';

// import SQLite CRUD router
import itemsRouter from './routes/items';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = (
  'Express server started on port: ' + ENV.Port.toString()
);

/******************************************************************************
                                  Run
******************************************************************************/

// initialise Express app
const app = express();

// Middleware for JSON body parsing
app.use(express.json());

// Mount SQLite CRUD routes
app.use('/items', itemsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

server.listen(ENV.Port, (err?: Error) => {
  if (err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});
