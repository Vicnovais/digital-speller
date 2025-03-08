import React, { useEffect, useRef, useState } from 'react';
import * as S from './styles';
import Typography from '../../../components/Typography';
import Word from '../../../components/Word';
import { useDataContext } from '../../../components/DataContext';

const words = ['Comer', 'Beber', 'Banheiro', 'Dormir', 'Sim', 'Não'];

const INTER_STIMULUS_INTERVAL = 1000;

const WordSelector = () => {
  const { addWordEvent, setHighlightedWord } = useDataContext();
  const [spellerWords, setSpellerWords] = useState(
    words.map((word) => ({ word, active: false })),
  );
  const [interStimulus, setInterStimulus] = useState(INTER_STIMULUS_INTERVAL);
  const lastWordIndex = useRef(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      lastWordIndex.current += 1;
      if (lastWordIndex.current >= spellerWords.length) {
        lastWordIndex.current = 0;
      }

      setSpellerWords((prevWords) =>
        prevWords.map((word, index) => {
          const isActive = index === lastWordIndex.current;
          if (isActive) {
            addWordEvent({
              word: word.word,
              timestamp: Date.now(),
            });
            setHighlightedWord(word.word);
          }
          return {
            ...word,
            active: isActive,
          };
        }),
      );
    }, interStimulus);

    return () => clearInterval(interval);
  }, [spellerWords, interStimulus, addWordEvent, setHighlightedWord]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = parseInt(e.target.value, 10);
    if (isNaN(newInterval)) return;

    if (newInterval < 0) setInterStimulus(0);
    else setInterStimulus(newInterval);
  };

  return (
    <S.Container>
      <S.ContainerHeader>
        <Typography variant="h1">Soletrador</Typography>

        <S.InputConfig>
          <Typography variant="span">Intervalo entre estímulos</Typography>
          <input type="number" value={interStimulus} onChange={onChange} />
        </S.InputConfig>
      </S.ContainerHeader>

      <S.WordGrid>
        {spellerWords.map(({ word, active }, index) => (
          <Word key={index} active={active}>
            {word}
          </Word>
        ))}
      </S.WordGrid>
    </S.Container>
  );
};

export default WordSelector;
