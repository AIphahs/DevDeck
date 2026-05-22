import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive opacity-50" />
          <div className="space-y-1">
            <p className="font-semibold">Une erreur est survenue</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.state.error.message}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => this.setState({ error: null })}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Réessayer
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
