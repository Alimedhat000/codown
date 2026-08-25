import { AppProvider } from './provider';
import { AppRouter } from './router';

/**
 * Application root: providers wrapped around the router.
 */
function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
