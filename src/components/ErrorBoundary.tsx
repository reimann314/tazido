import { Component, type ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-lg text-center">
            <p className="text-red-600 font-bold mb-2">حدث خطأ</p>
            <p className="text-sm text-gray-600 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium"
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
