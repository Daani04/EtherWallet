import { createContext, useState } from 'react';

const Context = createContext();

export const Provider = ({ children }) => {
  const [data, setData] = useState([]);

  return (
    <Context.Provider value={{ data, setData }}>
      {children}
    </Context.Provider>
  );
};

export default Context;