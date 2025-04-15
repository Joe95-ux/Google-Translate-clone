import { useState, useEffect } from "react";

export const usePersistentState = (key, initialValue)=> {
  
  const [value, setValue] = useState(() => {
    if(typeof window !== "undefined"){
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? storedValue : initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] ;
}