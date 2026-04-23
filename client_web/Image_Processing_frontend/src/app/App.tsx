import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <RouterProvider router={router} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
