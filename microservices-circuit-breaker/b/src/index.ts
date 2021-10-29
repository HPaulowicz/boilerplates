import * as express from 'express';
import config from './utils/config';
import RouteHandler from './utils/RouteHandler';

const app = express();

app.get('/resource-one', RouteHandler.route(() => {
  if (Math.random() > 0.5) {
    return {
      status: 200,
    };
  }
  throw new Error('Server error');
}));

app.get('/health', RouteHandler.route(() => {
  if (Math.random() > 0.5) {
    return {
      status: 'ok',
    };
  }
  throw new Error('Not serving');
}));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => RouteHandler.error(err, req, res, next));

const port = config.get('port', 3310);
app.listen(port, () => console.debug(`Listening at the port ${port}`));
