import "core-js/stable";
import "regenerator-runtime/runtime";

import Arranger from "@arranger/server";
import { port, env } from "./config/vars";
import logger from "./config/logger";
import app from "./app";

Arranger({
  esHost: process.env.ES_HOST,
  esUser: process.env.ES_USER,
  esPass: process.env.ES_PASS,
  // Maybe the following could come in handy later on...
  /*getServerSideFilter: () => ({
    op: 'not',
    content: [
      {
        op: 'in',
        content: {
          field: 'access_denied',
          value: ['true'],
        },
      },
    ]
  })*/
}).then((router) => {
  app.use(router);
  app.listen(port, () =>
    logger.info(`CQDG-Arranger server started on port ${port} (${env})`)
  );
});
