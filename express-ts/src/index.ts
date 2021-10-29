import * as express from 'express';
import config from './utils/config';
import RouteHandler from './utils/RouteHandler';

const app = express();
app.get('/', RouteHandler.route((req: express.Request, res: express.Response) => {
  console.log(req, res);
  return {
    a: 1,
  };
}));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => RouteHandler.error(err, req, res, next));

const port = config.get('port', 3310);
app.listen(port, () => console.debug(`Listening at the port ${port}`));
