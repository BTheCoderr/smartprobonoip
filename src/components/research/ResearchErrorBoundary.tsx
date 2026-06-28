"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class ResearchErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Research workspace render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Research workspace could not load.</p>
          <p className="mt-2">
            Your saved references are still stored. Reload the page or try again.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-3 rounded border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
