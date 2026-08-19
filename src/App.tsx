import Router from "./router";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {

    return (
        <ErrorBoundary>
            <Router />
        </ErrorBoundary>
    );

}

export default App;
