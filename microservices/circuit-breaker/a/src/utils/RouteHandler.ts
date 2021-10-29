import { Request, Response, NextFunction } from 'express';

class RouteHandler {
  route(callback) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await callback(req, res);
        if (typeof result !== 'undefined') {
          res.json(result);
        }
      } catch (e) {
        next(e);
      }
    };
  }

  middleware(callback) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await callback(req, res, next);
      } catch (e) {
        next(e);
      }
    };
  }

  error(err, req: Request, res: Response, next: NextFunction) {
    const {
      statusCode,
      message,
    } = err;
    console.error(err, {
      status: req.statusCode,
      path: `${req.method} ${req.path}`,
      headers: req.headers,
      payload: req.body,
      query: req.query,
    });
    res.status(statusCode || 500);
    next(res.json({
      message,
      errors: err.errors || [],
    }));
  }
}

export default new RouteHandler();
