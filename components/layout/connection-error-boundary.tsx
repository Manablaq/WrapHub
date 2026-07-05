"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ConnectionErrorBoundaryProps = {
  children: ReactNode;
};

type ConnectionErrorBoundaryState = {
  error: Error | null;
};

export class ConnectionErrorBoundary extends Component<
  ConnectionErrorBoundaryProps,
  ConnectionErrorBoundaryState
> {
  state: ConnectionErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Connection boundary caught an error.", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="connection-error-shell">
        <section className="connection-error-panel">
          <span>Connection interrupted</span>
          <h1>Wallet or RPC connection was interrupted.</h1>
          <p>Refresh the page or check wallet/RPC connectivity.</p>
          <button className="button primary" type="button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </section>
      </div>
    );
  }
}
