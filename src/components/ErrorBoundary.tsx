import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../types/utility.types';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: import('react').ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // Call the error callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): import('react').ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            An error occurred while rendering the form. Please try again.
          </Text>

          {this.props.showErrorDetails && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorDetailsTitle}>Error Details:</Text>
              <Text style={styles.errorDetailsText}>{this.state.error.message}</Text>
              {this.state.errorInfo?.componentStack && (
                <Text style={styles.errorDetailsText}>{this.state.errorInfo.componentStack}</Text>
              )}
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    borderRadius: 4,
    borderWidth: 1,
    margin: 8,
    padding: 16,
  },
  errorDetails: {
    backgroundColor: '#fef5e7',
    borderColor: '#f6ad55',
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
  },
  errorDetailsText: {
    color: '#744210',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  errorDetailsTitle: {
    color: '#c05621',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#742a2a',
    fontSize: 14,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#c53030',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ErrorBoundary;
