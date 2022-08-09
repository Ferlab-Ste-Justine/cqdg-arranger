import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';

import logger from './config/logger';
import {
  authClientId,
  authRealm,
  authServerUrl,
  logsRequestInterceptor,
  secure,
  sessionSecret,
} from './config/vars';
import downloadManifestByStudyId from './controllers/downloadManifest';
import requestAccessByStudyId from './controllers/requestAccess';
import statistics from './controllers/statistics';
import { getSuggestions } from './queries/elasticsearch';
import { SUGGESTIONS_TYPES } from './services/elasticsearch';
import { getPermissions, isPermissionGranted } from './services/keycloak';

/**
 * N.B.: The memory store is not scalable and the documentation states that there is a memory leak.
 * Consequently, this is not suited for production use.
 * Eventually replace with https://github.com/tj/connect-redis
 **/
const memoryStore = new session.MemoryStore();

const app = express();

app.use(bodyParser.json({ limit: '4MB' }));
app.use(cors());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }),
);

// Request Logging Interceptor
if (logsRequestInterceptor === 'true') {
  app.use((req, res, next) => {
    logger.info('REQ: ', req.body);
    next();
  });
}

if (true === secure) {
  // Initialize Keycloak middleware
  const keycloakConfig = {
    clientId: authClientId,
    bearerOnly: true,
    serverUrl: authServerUrl,
    realm: authRealm,
  };
  const keycloakOptions = {
    store: memoryStore,
  };

  const keycloak = new Keycloak(keycloakOptions, keycloakConfig);
  app.use(keycloak.middleware());
  app.all('/request/*', keycloak.protect(), (req, res, next) => {
    req.userToken = req.kauth.grant.access_token.token;
    next();
  });

  app.use('/cqdg/graphql', keycloak.protect(), (req, res, next) => {
    next();
  });

  //--------------------------------- Permission Proof of Concept
  const testPermissions = async (req, res, next) => {
    try {
      const permissions = await getPermissions(req.kauth.grant.access_token.token);

      if (isPermissionGranted(permissions, req.params.fileId)) {
        res.status(200).json({ access: 'granted' });
      } else {
        return keycloak.accessDenied(req, res, next);
      }
    } catch (err) {
      return keycloak.accessDenied(req, res, next);
    }
  };

  app.get('/files/:fileId', testPermissions);
  app.get('/request/access/:studyId', requestAccessByStudyId);
  app.get('/request/manifest/:studyId', downloadManifestByStudyId);

  app.get('/genesFeature/suggestions/:prefix', (req, res) =>
    getSuggestions(req, res, SUGGESTIONS_TYPES.GENE),
  );
  app.get('/variantsFeature/suggestions/:prefix', (req, res) =>
    getSuggestions(req, res, SUGGESTIONS_TYPES.VARIANT),
  );

  // Using the keycloak.enforcer, we cannot dynamically pass the resource
  /*app.get(
    "/files/:fileId",
    keycloak.enforcer(["FI000004:view"], {
      resource_server_id: "cqdg-system",
      response_mode: "permissions",
    }),
    function (req, res) {
      res.status(200).json({ status: "granted" });
    }
  );*/
}

// Routes
app.get('/stats', statistics);

export default app;
