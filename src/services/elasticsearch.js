import { Client } from '@elastic/elasticsearch';

import { esHost } from '../config/vars';

export const SUGGESTIONS_TYPES = {
  VARIANT: 'variant',
  GENE: 'gene',
};

class EsClass {
  constructor() {
    if (!this.client) {
      this.client = new Client({ node: esHost });
    }
  }

  getClient() {
    return this.client;
  }
}

const singletonEsClass = new EsClass();

Object.freeze(singletonEsClass);

export default singletonEsClass;
