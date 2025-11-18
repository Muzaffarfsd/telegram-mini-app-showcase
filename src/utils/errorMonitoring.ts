class ErrorMonitor {
  private errors: Array<{ message: string; stack?: string; timestamp: number }> = [];
  private readonly MAX_ERRORS = 100;
  
  init() {
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now()
      });
    });
  }
  
  logError(error: { message: string; stack?: string; timestamp: number }) {
    this.errors.push(error);
    
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift();
    }
    
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message));
    }
    
    console.error('[Error Monitor]', error);
  }
  
  getErrors() {
    return this.errors;
  }
  
  clearErrors() {
    this.errors = [];
  }
}

export const errorMonitor = new ErrorMonitor();
