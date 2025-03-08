import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

export interface EMGDataPoint {
  value: number;
  timestamp: number;
  formattedTime: string;
}

export interface WordEvent {
  word: string;
  timestamp: number;
}

export interface Prediction {
  prediction: number;
  timestamp: number;
}

interface DataContextType {
  emgData: EMGDataPoint[];
  wordEvents: WordEvent[];
  predictions: Prediction[];
  highlightedWord: string;
  addEmgDataPoint: (data: EMGDataPoint) => void;
  addWordEvent: (event: WordEvent) => void;
  addPrediction: (prediction: Prediction) => void;
  setHighlightedWord: (word: string) => void;
}

// create empty context
const DataContext = createContext<DataContextType | undefined>(undefined);

// a provider that gives the context to children
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [emgData, setEmgData] = useState<EMGDataPoint[]>([]);
  const [wordEvents, setWordEvents] = useState<WordEvent[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [highlightedWord, setHighlightedWord] = useState<string>('');

  const addEmgDataPoint = (data: EMGDataPoint) => {
    // Could also keep only last N data points if you wish
    setEmgData((prev) => [...prev, data]);
  };

  const addWordEvent = useCallback((event: WordEvent) => {
    setWordEvents((prev) => [...prev, event]);
  }, []);

  const addPrediction = useCallback((prediction: Prediction) => {
    setPredictions((prev) => [...prev, prediction]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        emgData,
        wordEvents,
        predictions,
        highlightedWord,
        addEmgDataPoint,
        addWordEvent,
        addPrediction,
        setHighlightedWord,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// a custom hook for easy usage of the context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
