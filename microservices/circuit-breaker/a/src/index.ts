import * as express from 'express';
import config from './utils/config';
import RouteHandler from './utils/RouteHandler';
import CircuitBreaker from './circuitBreaker/Breaker';
import BreakerMiddleware from './middleware/BreakerMiddleware';

const app = express();

const circuitBreaker = new CircuitBreaker({
  method: 'get',
  url: `${config.get('services.b.health')}`,
});

setInterval(() => {
  circuitBreaker.exec()
    .then(console.log)
    .catch(console.error);
}, 1000);

const breakerMiddleware = new BreakerMiddleware(circuitBreaker);

app.use(RouteHandler.middleware(async (req, res, next) => breakerMiddleware.filter(req, res, next)));

app.get('/', RouteHandler.route(() => {
  console.log();
  return {
    a: 1,
  };
}));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => RouteHandler.error(err, req, res, next));

const port = config.get('port', 3310);
app.listen(port, () => console.debug(`Listening at the port ${port}`));
