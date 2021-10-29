class BreakerMiddleware {
  private breaker: any;

  constructor(breaker) {
    this.breaker = breaker;
  }

  filter(req, res, next) {
    console.log(this.breaker);
    if (this.breaker.state === 'GREEN') {
      return next();
    }
    throw new Error('Service is unavailable');
  }
}

export default BreakerMiddleware;
