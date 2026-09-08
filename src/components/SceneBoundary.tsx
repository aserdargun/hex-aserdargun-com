import { Component, type ReactNode } from "react";
export default class SceneBoundary extends Component<
  { children: ReactNode; lang: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="scene-fallback">
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
                ? "Dersler ve bileşen listeleri kullanılabilir. WebGL destekli tarayıcıda yeniden deneyin."
                : "Lessons and component lists remain available. Retry in a browser with WebGL support."}
            </p>
            <button
              className="text-button"
              onClick={() => this.setState({ failed: false })}
            >
              {this.props.lang === "tr" ? "Yeniden dene" : "Retry 3D"}
            </button>
          </div>
        </div>
      );
    return this.props.children;
  }
}
