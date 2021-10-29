import axios, { AxiosRequestConfig } from 'axios';
import {
  BreakerOptions,
  BreakerState,
} from './BreakerOptions';

class CircuitBreaker {
  private request: AxiosRequestConfig;

  private state: BreakerState;

  private failureCount: number;

  private successCount: number;

  private nextAttempt: number;

  private failureThreshold: number;

  private successThreshold: number;

  private timeout: number;

  constructor(request: AxiosRequestConfig, options?: BreakerOptions) {
    this.request = request;
    this.state = BreakerState.GREEN;

    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();

    if (options) {
      this.failureThreshold = options.failureThreshold;
      this.successThreshold = options.successThreshold;
      this.timeout = options.timeout;
    } else {
      // Define defaults
      this.failureThreshold = 3;
      this.successThreshold = 2;
      this.timeout = 10000;
    }
  }

  private log(result: string): void {
    console.table({
      Result: result,
      Timestamp: Date.now(),
      Successes: this.successCount,
      Failures: this.failureCount,
      State: this.state,
    });
  }

  private success(res: any): any {
    this.failureCount = 0;
    if (this.state === BreakerState.YELLOW) {
      this.successCount += 1;

      if (this.successCount > this.successThreshold) {
        this.successCount = 0;
        this.state = BreakerState.GREEN;
      }
    }
    this.log('Success');
    return res;
  }

  private failure(res: any): any {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.state = BreakerState.RED;

      this.nextAttempt = Date.now() + this.timeout;
    }
    this.log('Failure');
    return res;
  }

  public async exec(): Promise<void> {
    if (this.state === BreakerState.RED) {
      if (this.nextAttempt <= Date.now()) {
        this.state = BreakerState.YELLOW;
      } else {
        throw new Error('Service is suspended');
      }
    }

    try {
      const response = await axios(this.request);
      if (response.status === 200) {
        return this.success(response.data);
      }
      return this.failure(response.data);
    } catch (err) {
      return this.failure(err.message);
    }
  }
}

export default CircuitBreaker;
