import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const ThemeModeContext = createContext({
  mode: "dark",
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "app-theme-mode";

const getInitialMode = () => {
  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  return storedMode === "light" ? "light" : "dark";
};

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 8,
        },
        palette: {
          mode,
          primary: { main: "#38BDF8" },
          background:
            mode === "dark"
              ? { default: "#020617", paper: "#0f172a" }
              : { default: "#f8fafc", paper: "#ffffff" },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                fontWeight: 600,
              },
              outlined: {
                borderWidth: "1px",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                borderWidth: "1px",
              },
            },
          },
        },
      }),
    [mode]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme: () => {
        setMode((prev) => {
          const next = prev === "dark" ? "light" : "dark";
          localStorage.setItem(THEME_STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeModeContext);
