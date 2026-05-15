import AppProviders from "./pages/_app";
import RendererErrorBoundary from "./error-boundary";
import Home from "./pages/index";

const App = () => {
  return (
    <RendererErrorBoundary>
      <AppProviders>
        <Home />
      </AppProviders>
    </RendererErrorBoundary>
  );
};

export default App;