import { useEffect, useRef } from "react";
import ComponentBrowser from "./ComponentBrowser";
import {
  ArrowDown,
  ArrowUpRight,
  BrainCircuit,
  Cpu,
  Eye,
  RotateCcw,
  Settings2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  chapters,
  lessons,
  modes,
  sources,
  t,
  type Lang,
  type Mode,
} from "../data/content";
const icons = [Eye, BrainCircuit, Cpu, Settings2, RotateCcw];
interface Props {
  lang: Lang;
  mode: Mode;
  lesson: string;
  selected: string | null;
  onKnee: () => void;
  onLesson: (id: string, name?: string) => void;
  onInfo: () => void;
  chapter: number | null;
  onNext: () => void;
  joint: string;
  body: string;
}
export default function LessonPanel({
  lang,
  mode,
  lesson,
  selected,
  onKnee,
  onLesson,
  onInfo,
  chapter,
  onNext,
  joint,
  body,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [mode, lesson]);
  const l = lessons[lesson] || lessons[mode];
  const isOverview = lesson === "explore" && mode === "explore";
  const idx = modes.findIndex((m) => m.id === mode) + 1;
  return (
    <aside
      className="lesson-panel"
      aria-label={t(["Component lesson", "Bileşen dersi"], lang)}
    >
      <div className="lesson-scroll" ref={scrollRef}>
        <p className="section-label">
          {String(idx).padStart(2, "0")} /{" "}
          {t(
            isOverview
              ? ["SYSTEM OVERVIEW", "SİSTEME BAKIŞ"]
              : ["ENGINEERING NOTES", "MÜHENDİSLİK NOTLARI"],
            lang,
          )}
        </p>
        <ComponentBrowser
          key={`${mode}-${joint}-${body}`}
          lang={lang}
          mode={mode}
          joint={joint}
          body={body}
          selected={selected}
          onSelect={onLesson}
        />
        <div aria-live="polite">
          <h2>{t(l.title, lang)}</h2>
          <p className="lesson-summary">{t(l.summary, lang)}</p>
        </div>
        {selected && (
          <div className="selected-id">
            <span>{t(["SELECTED COMPONENT", "SEÇİLİ BİLEŞEN"], lang)}</span>
            <code>{selected}</code>
          </div>
        )}
        <ol
          className={`connection-chain ${isOverview ? "overview-chain" : ""}`}
          aria-label={t(["System connections", "Sistem bağlantıları"], lang)}
        >
          {l.chain.map((step, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={i}>
                <div>
                  {isOverview && <Icon size={23} strokeWidth={1.4} />}
                  <span>{t(step, lang)}</span>
                </div>
                {i < l.chain.length - 1 && (
                  <ArrowDown
                    className="chain-arrow"
                    size={20}
                    strokeWidth={1}
                  />
                )}
              </li>
            );
          })}
        </ol>
        {!isOverview && (
          <>
            <h3>{t(["Why it matters", "Neden önemli?"], lang)}</h3>
            <p className="explanation">{t(l.why, lang)}</p>
            <dl className="signal-map">
              {(
                [
                  ["receives", ["RECEIVES", "GİRDİ"]],
                  ["produces", ["PRODUCES", "ÇIKTI"]],
                  ["observes", ["OBSERVED THROUGH", "GÖZLEM"]],
                  ["influences", ["INFLUENCES", "ETKİ"]],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <dt>{label[lang === "en" ? 0 : 1]}</dt>
                  <dd>{t(l[key], lang)}</dd>
                </div>
              ))}
            </dl>
            {l.note && (
              <p className="model-note">
                <Info size={15} />
                <span>{t(l.note, lang)}</span>
              </p>
            )}
            {l.source !== undefined && (
              <a
                className="source-link"
                href={sources[l.source].url}
                target="_blank"
                rel="noreferrer"
              >
                {sources[l.source].name}
                <ArrowUpRight size={13} />
              </a>
            )}
          </>
        )}
        {mode === "sensors" && (
          <div className="component-list">
            {[
              ["camera", "HEX_SENSOR_CAM_L", "Cameras", "Kameralar"],
              ["imu", "HEX_SENSOR_IMU_TORSO", "Torso IMU", "Gövde IMU"],
              [
                "encoder",
                "HEX_ENCODER_KNEE_L",
                "Joint encoder",
                "Eklem enkoderi",
              ],
              ["foot", "HEX_FOOT_SENSOR_L_1", "Foot sensing", "Ayak ölçümü"],
            ].map(([id, n, en, tr]) => (
              <button key={id} onClick={() => onLesson(id, n)}>
                {lang === "en" ? en : tr}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        )}
        {(mode === "power" || mode === "compute") && (
          <div className="component-list">
            {(mode === "power"
              ? [
                  [
                    "battery",
                    "HEX_BATTERY_MAIN",
                    "Battery + BMS",
                    "Batarya + BMS",
                  ],
                  [
                    "power",
                    "HEX_POWER_DISTRIBUTION",
                    "Power distribution",
                    "Güç dağıtımı",
                  ],
                  ["power", "HEX_DC_CONVERTER", "DC conversion", "DC dönüşümü"],
                ]
              : [
                  [
                    "compute",
                    "HEX_COMPUTE_MAIN",
                    "Main compute",
                    "Ana hesaplama",
                  ],
                  [
                    "realtime",
                    "HEX_CTRL_REALTIME",
                    "Realtime control",
                    "Gerçek zamanlı kontrol",
                  ],
                  [
                    "motor-control",
                    "HEX_CTRL_MOTOR_THIGH_L",
                    "Motor drive",
                    "Motor sürücüsü",
                  ],
                ]
            ).map(([id, n, en, tr]) => (
              <button key={n} onClick={() => onLesson(id, n)}>
                {lang === "en" ? en : tr}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="lesson-bottom">
        {chapter !== null ? (
          <button className="primary-button" onClick={onNext}>
            {t(
              chapter === chapters.length - 1
                ? ["Finish exploration", "Keşfi tamamla"]
                : ["Next chapter", "Sonraki bölüm"],
              lang,
            )}
            <ChevronRight size={19} />
          </button>
        ) : isOverview ? (
          <button className="primary-button" onClick={onKnee}>
            {t(["Explore the knee", "Dizi keşfet"], lang)}
            <ArrowUpRight size={19} />
          </button>
        ) : (
          <button className="text-button" onClick={onInfo}>
            <Info size={16} />
            {t(
              [
                "Model assumptions & sources",
                "Model varsayımları ve kaynaklar",
              ],
              lang,
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
