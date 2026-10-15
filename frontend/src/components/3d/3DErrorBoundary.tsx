import React, { Component, type ReactNode } from "react";
import { WebGLFallback } from "./WebGLFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  subtitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ThreeDErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[3D Scene Warning] WebGL or Three.js context issue:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <WebGLFallback
          title={this.props.title || "3D Visualization Unavailable"}
          subtitle={this.props.subtitle || "Your graphics acceleration is disabled. Showing static data view."}
        />
      );
    }

    return this.props.children;
  }
}
