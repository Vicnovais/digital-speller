import React from 'react';
import * as S from './styles';
import Typography from '../../../components/Typography';
import { useDataContext } from '../../../components/DataContext';

const Result = () => {
  const { predictions, highlightedWord } = useDataContext();
  const lastPrediction = predictions[predictions.length - 1]?.prediction;

  return (
    <S.Container>
      <Typography variant="h1">Resultado</Typography>
      {lastPrediction !== null && (
        <Typography variant="span" fontSize="large">
          Predição: {lastPrediction}
        </Typography>
      )}
      {lastPrediction === 1 && highlightedWord && (
        <S.HighlightedWordContainer>
          <Typography variant="span" fontSize="large">
            {highlightedWord}
          </Typography>
        </S.HighlightedWordContainer>
      )}
    </S.Container>
  );
};

export default Result;
