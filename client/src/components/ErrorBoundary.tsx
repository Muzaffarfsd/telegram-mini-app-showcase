import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackComponentError } from '@/utils/vitals';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    trackComponentError(error, errorInfo.componentStack || 'Unknown');
    Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: this.state.errorCount + 1,
    });
  };

  render() {
    if (this.state.hasError && this.state.errorCount < 3) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Что-то пошло не так
            </h2>
            
            <p className="text-gray-400 mb-6">
              Произошла ошибка при загрузке приложения
            </p>
            
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                  Технические детали
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/50 rounded p-3 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-black font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Попробовать снова</span>
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Ошибка записана. Наша команда получит уведомление.
            </p>
          </div>
        </div>
      );
    }

    if (this.state.errorCount >= 3) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md w-full text-center space-y-4 bg-gray-900 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-red-500">
              Критическая ошибка
            </h1>
            <p className="text-sm text-gray-400">
              Приложение не может восстановиться. Пожалуйста, перезагрузите страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors w-full"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
