import { StatusCodes } from 'http-status-codes';

import {
  indexNameGeneFeatureSuggestion,
  indexNameVariantFeatureSuggestion,
  maxNOfGenomicFeatureSuggestions,
} from '../config/vars';
import EsService, { SUGGESTIONS_TYPES } from '../services/elasticsearch';

export const getSuggestions = async (req, res, type) => {
  const prefix = req.params.prefix;

  const client = await EsService.getClient();

  const _index =
    type === SUGGESTIONS_TYPES.GENE
      ? indexNameGeneFeatureSuggestion
      : indexNameVariantFeatureSuggestion;

  const { body } = await client.search({
    index: _index,
    body: {
      suggest: {
        suggestions: {
          prefix,
          completion: {
            field: 'suggest',
            size: maxNOfGenomicFeatureSuggestions,
          },
        },
      },
    },
  });

  const suggestionResponse = body.suggest.suggestions[0];

  const searchText = suggestionResponse.text;
  const suggestions = suggestionResponse.options.map((suggestion) => suggestion._source);

  res.status(StatusCodes.OK).send({
    searchText,
    suggestions,
  });
};
