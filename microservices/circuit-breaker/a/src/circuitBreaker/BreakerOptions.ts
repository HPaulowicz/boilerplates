enum BreakerState {
  GREEN = 'GREEN',
  RED = 'RED',
  YELLOW = 'YELLOW',
}

class BreakerOptions {
  public failureThreshold: number;

  public successThreshold: number;

  public timeout: number;
}

export {
  BreakerOptions,
  BreakerState,
};
