import * as deepmerge from 'deepmerge';

class Config {
  private env: string;

  private configJSON?: object;

  constructor() {
    this.env = process.env.NODE_ENV;

    console.log('\x1b[33m%s\x1b[0m', `Node environment is ${this.env}`);

    const cwd = process.cwd();

    let defaultJSON;
    this.configJSON = undefined;
    try {
      defaultJSON = require(`${cwd}/config/default.json`);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        throw new Error('Directory "/config" must contain the "default.json" configuration file.');
      }
      throw e;
    }
    if (typeof this.env !== 'undefined') {
      try {
        const environmentJSON = require(`${cwd}/config/${this.env}.json`);
        this.configJSON = deepmerge(defaultJSON, environmentJSON);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          throw new Error(`Directory "/config/" must contain the "${this.env}.json" configuration file.`);
        }
        throw e;
      }
    } else {
      this.configJSON = defaultJSON;
    }
    try {
      /**
       * If there is local.json exists, overwriting the values from there
       */
      const localJSON = require(`${cwd}/config/local.json`);
      this.configJSON = deepmerge(this.configJSON, localJSON);
    } catch (e) {
      console.warn('\x1b[33m%s\x1b[0m', `Can not load the local configuration: ${e.message}`);
    }
    try {
      /**
       * If there is environment-variables.json exists, look for the existing keys and overwrite
       */
      const environmentVarsJSON = require(`${cwd}/config/environment-variables.json`);
      const mergedEnvironmentVarsJSON = Config.mergeWithEnvironmentVars(environmentVarsJSON);
      this.configJSON = deepmerge(this.configJSON, mergedEnvironmentVarsJSON);
    } catch (e) {
      console.warn('\x1b[33m%s\x1b[0m', `Can not load the environment-variables configuration: ${e.message}`);
    }
  }

  get(path, fallbackValue?: any) {
    try {
      let toReturn = this.configJSON;
      const crumbs = path.split('.');
      for (const i of crumbs) {
        if (i in toReturn) {
          toReturn = toReturn[i];
        } else {
          toReturn = undefined;
          break;
        }
      }
      if (typeof toReturn === 'undefined' && typeof fallbackValue !== 'undefined') {
        toReturn = fallbackValue;
      }
      return toReturn;
    } catch (e) {
      if (typeof fallbackValue !== 'undefined') {
        return fallbackValue;
      }
      return undefined;
    }
  }

  static mergeWithEnvironmentVars(obj) {
    const json = {};
    const objKeys = Object.keys(obj);
    for (const key of objKeys) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        json[key] = Config.mergeWithEnvironmentVars(obj[key]);
      } else if (typeof process.env[obj[key]] === 'undefined') {
        delete json[key];
      } else {
        json[key] = process.env[obj[key]];
      }
    }
    return json;
  }
}

export default new Config();
