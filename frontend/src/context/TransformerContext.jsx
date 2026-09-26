import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const TransformerContext = createContext();

export const TransformerProvider = ({ children }) => {
  const [selectedTransformer, setSelectedTransformer] = useState('TX-101');
  const [transformers, setTransformers] = useState([]);
  const [timeRange, setTimeRange] = useState('7 Days');

  useEffect(() => {
    api.getTransformers()
      .then(txs => {
        setTransformers(txs);
        if (txs.length > 0 && !selectedTransformer) {
          setSelectedTransformer(txs[0].transformer_code);
        }
      })
      .catch(err => console.error('Failed to fetch transformers list:', err));
  }, []);

  return (
    <TransformerContext.Provider value={{
      selectedTransformer,
      setSelectedTransformer,
      transformers,
      timeRange,
      setTimeRange
    }}>
      {children}
    </TransformerContext.Provider>
  );
};

export const useTransformer = () => useContext(TransformerContext);
