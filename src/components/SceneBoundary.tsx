import { Component, type ReactNode } from "react";
export default class SceneBoundary extends Component<
  {
    children: ReactNode;
    lang: string;
    onError: () => void;
    onRetry: () => Promise<void>;
  },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed)
      return (
        <div className="scene-fallback" role="status">
          <img
            src={import.meta.env.BASE_URL + "renders/hero.webp"}
            alt={
              this.props.lang === "tr"
                ? "HEX humanoid modeli"
                : "HEX humanoid model"
            }
          />
          <div>
            <h3>
              {this.props.lang === "tr"
                ? "3B görünüm kullanılamıyor"
                : "3D view is unavailable"}
            </h3>
            <p>
              {this.props.lang === "tr"
                ? "Dersler ve bileşen listeleri kullanılabilir. Bağlantınızı ve tarayıcınızın WebGL desteğini kontrol edip yeniden deneyin."
                : "Lessons and component lists remain available. Check your connection and browser WebGL support, then retry."}
            </p>
            <button
              className="text-button"
              onClick={() => void this.props.onRetry()}
            >
              {this.props.lang === "tr" ? "Yeniden dene" : "Retry 3D"}
            </button>
            <button
              className="text-button"
              onClick={() => window.location.reload()}
            >
              {this.props.lang === "tr"
                ? "Sayfayı yeniden yükle"
                : "Reload page"}
            </button>
          </div>
        </div>
      );
    return this.props.children;
  }
}
