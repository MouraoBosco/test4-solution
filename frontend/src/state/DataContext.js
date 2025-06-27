import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // fetchItems now accepts params for pagination and search
  const fetchItems = useCallback(async ({ page = 1, limit = 10, q = '' } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (q) params.append('q', q);
    const res = await fetch(`http://localhost:3001/api/items?${params.toString()}`);
    const json = await res.json();
    // Fallback for legacy or error responses
    if (Array.isArray(json)) {
      setItems(json);
      setTotal(json.length);
    } else {
      setItems(Array.isArray(json.items) ? json.items : []);
      setTotal(typeof json.total === 'number' ? json.total : 0);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, total, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);