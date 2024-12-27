import { useState, useEffect } from "react";

export const usePersistentState = (key, initialValue)=> {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) || initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] ;
}