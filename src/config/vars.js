// import .env variables
require('dotenv-safe').config({
  allowEmptyValues: true,
  example: './.env.example',
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5050,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  logsRequestInterceptor: process.env.LOGS_REQUEST_INTERCEPTOR,
  authRealm: process.env.AUTH_REALM,
  authServerUrl: process.env.AUTH_SERVER_URL,
  authClientId: process.env.AUTH_CLIENT_ID,
  sessionSecret: process.env.SESSION_SECRET,
  serviceAccountClientId: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  serviceAccountClientSecret: process.env.SERVICE_ACCOUNT_CLIENT_SECRET,
  secure: process.env.SECURE !== 'false',

  esHost: process.env.ES_HOST,
  esUser: process.env.ES_USER,
  esPass: process.env.ES_PASS,
  esFileIndex: process.env.ES_FILE_INDEX || 'file_centric',
  esStudyIndex: process.env.ES_STUDY_INDEX || 'study_centric',
  esParticipantIndex: process.env.ES_PARTICIPANT_INDEX || 'participant_centric',
  esVariantIndex: process.env.ES_VARIANT_INDEX || 'variant_centric',
  esBiospecimenIndex: process.env.ES_BIOSPECIMEN_INDEX || 'biospecimen_centric',
  indexNameGeneFeatureSuggestion: process.env.GENES_SUGGESTIONS_INDEX_NAME,
  indexNameVariantFeatureSuggestion: process.env.VARIANTS_SUGGESTIONS_INDEX_NAME,
  maxNOfGenomicFeatureSuggestions: process.env.MAX_NUMBER_OF_GF_SUGGESTIONS || 5,
};
