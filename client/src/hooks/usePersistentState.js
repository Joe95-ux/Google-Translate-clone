import { useState, useEffect } from "react";

export const usePersistentState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null
          ? JSON.parse(storedValue)
          : initialValue;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error storing ${key} in localStorage`, err);
    }
  }, [key, value]);

  return [value, setValue];
};
