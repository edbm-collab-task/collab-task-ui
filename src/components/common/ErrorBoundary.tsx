import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <p className="mb-2 text-lg font-semibold text-gray-800">
                            Une erreur est survenue
                        </p>
                        <p className="mb-4 text-sm text-gray-500">
                            Veuillez recharger la page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Recharger
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
