// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./auth/AuthProvider";
import { router } from "./app/router";
import { AppThemeProvider } from "./theme/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={4000}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;