import {LabControlButton} from '@aserdargun/lab-ui';
import '@aserdargun/lab-ui/styles.css';
import {manifest,initialRoute} from './ils/catalog';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import {
  bodies,
  chapters,
  joints,
  lessons,
  modes,
  stages,
  t,
  type Lang,
  type Mode,
} from "./data/content";
import { jointLimit } from "./core/motion";
import LessonPanel from "./components/LessonPanel";
import InfoDialog from "./components/InfoDialog";
import SceneBoundary from "./components/SceneBoundary";
const loadScene = () => import("./scene/RobotScene");
export default function App() {
  const [route] = useState(() => initialRoute(location.search));
  const [RobotScene, setRobotScene] = useState(() => lazy(loadScene));
  const [sceneAttempt, setSceneAttempt] = useState(0);
  const [sceneFailed, setSceneFailed] = useState(false);
  const motionSample = useRef(0);
  const onSample = useCallback((value: number) => {
    motionSample.current = value;
  }, []);
  const [lang, setLang] = useState<Lang>(() => {
    if(route.locale) return route.locale;
    try {
      return localStorage.getItem("hex-lang") === "tr" ? "tr" : "en";
    } catch {
      return "en";
    }
  });
  const [mode, setMode] = useState<Mode>(route.mode);
  const [lesson, setLesson] = useState(route.mode === "joints" ? "knee" : route.mode === "behavior" ? "balance" : route.mode);
  const [explode, setExplode] = useState(0);
  const [joint, setJoint] = useState("KNEE_L");
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [body, setBody] = useState("all");
  const [view, setView] = useState<"front" | "back" | "side">("front");
  const [reset, setReset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState(false);
  const [guide, setGuide] = useState(route.lesson);
  const guideWasOpen = useRef(false);
  useEffect(() => {
    if (guide)
      document.getElementById("learning-title")?.focus({ preventScroll: true });
    else if (guideWasOpen.current)
      document.getElementById("explorer-title")?.focus({ preventScroll: true });
    guideWasOpen.current = guide;
  }, [guide]);
  const [chapter, setChapter] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [perception, setPerception] = useState(0);
  const [behavior, setBehavior] = useState<"stand" | "balance" | "reach">(
    "balance",
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) {
        setPlaying(false);
        if (playing) setAngle(motionSample.current);
      }
    };
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [playing]);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("hex-lang", lang);
    } catch {
      /* Browser may disable local storage. */
    }
  }, [lang]);
  const pauseMotion = useCallback(() => {
    if (playing) setAngle(motionSample.current);
    setPlaying(false);
  }, [playing]);
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) pauseMotion();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [pauseMotion]);
  const openInfo = () => {
    pauseMotion();
    setInfo(true);
  };
  const retryScene = async () => {
    setReady(false);
    try {
      const scene = await loadScene();
      scene.clearModelCache();
      setRobotScene(() => lazy(loadScene));
      setSceneAttempt((n) => n + 1);
      setSceneFailed(false);
    } catch {
      setSceneFailed(true);
    }
  };
  const sceneError = useCallback(() => {
    setSceneFailed(true);
    setReady(false);
    setPlaying(false);
  }, []);
  const changeMode = (m: Mode) => {
    setReset((r) => r + 1);
    motionSample.current = 0;
    if (innerWidth <= 900)
      requestAnimationFrame(() =>
        window.scrollTo({
          top: 0,
          behavior: reducedMotion ? "instant" : "smooth",
        }),
      );
    setMode(m);
    setLesson(m === "joints" ? "knee" : m === "behavior" ? "balance" : m);
    setSelected(null);
    setBody("all");
    setExplode(0);
    setAngle(0);
    setView("front");
    setPlaying(false);
    setJoint("KNEE_L");
    setPerception(0);
    setBehavior("balance");
  };
  const selectLesson = useCallback((id: string, name?: string) => {
    setLesson(lessons[id] ? id : "structure");
    setSelected(name || null);
  }, []);
  const chooseJoint = (id: string) => {
    setJoint(id);
    setLesson(id.split("_")[0].toLowerCase());
    setSelected("HEX_ACT_" + id);
    setAngle(0);
    setPlaying(false);
    motionSample.current = 0;
    setBody("all");
  };
  const openKnee = () => {
    changeMode("joints");
    setJoint("KNEE_L");
    setLesson("knee");
    setSelected("HEX_ACT_KNEE_L");
    setExplode(8);
  };
  const target = () => {
    changeMode("behavior");
    setBehavior("reach");
    setLesson("reach");
    setPlaying(!reducedMotion && ready);
  };
  const loadChapter = (i: number) => {
    const ch = chapters[i];
    changeMode(ch.mode);
    setLesson(ch.lesson);
    setChapter(i);
    setGuide(false);
    if (ch.lesson === "transmission") setExplode(8);
  };
  const nextChapter = () => {
    if (chapter === chapters.length - 1) {
      setChapter(null);
      changeMode("explore");
    } else loadChapter((chapter ?? -1) + 1);
  };
  const onReady = useCallback(() => setReady(true), []);
  const onComplete = useCallback(() => {
    setPlaying(false);
    setAngle(100);
  }, []);
  const current = modes.find((m) => m.id === mode)!;
  const maxAngle = jointLimit(joint);
  const stage = Math.round(explode);
  const stageDescription =
    mode === "joints"
      ? `${t(["Joint separation", "Eklem ayrıştırma"], lang)} · ${Math.round((explode / 8) * 100)}%`
      : `${stage}/8 · ${t(stages[stage], lang)}`;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#lesson">
        {t(["Skip to lesson", "Derse geç"], lang)}
      </a>
      <header className="masthead">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeMode("explore");
            setChapter(null);
            setGuide(false);
          }}
          aria-label={t(["HEX home", "HEX ana sayfa"], lang)}
        >
          <strong>HEX</strong>
          <span>Humanoid Engineering Explorer</span>
        </a>
        <nav
          className="top-nav"
          aria-label={t(["Main navigation", "Ana gezinme"], lang)}
        >
          <button
            className={!guide ? "active" : ""}
            aria-pressed={!guide}
            onClick={() => setGuide(false)}
          >
            {t(["Explorer", "Keşif"], lang)}
          </button>
          <button
            className={guide ? "active" : ""}
            aria-pressed={guide}
            onClick={() => {
              pauseMotion();
              setGuide(true);
            }}
          >
            {t(["Learning path", "Öğrenme yolu"], lang)}
          </button>
        </nav>
        <div className="header-right">
          <a href="https://eng.aserdargun.com" target="_blank" rel="noreferrer">
            ENG
            <ArrowUpRight size={17} />
          </a>
          <div
            className="language-switch"
            role="group"
            aria-label={t(["Language", "Dil"], lang)}
          >
            <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
            <span>/</span>
            <button aria-pressed={lang === "tr"} onClick={() => setLang("tr")}>
              TR
            </button>
          </div>
        </div>
      </header>
      <main className="workspace">
        <aside className="systems-rail">
          <p className="section-label">{t(["SYSTEMS", "SİSTEMLER"], lang)}</p>
          <nav aria-label={t(["System modes", "Sistem modları"], lang)}>
            {modes.map((m, i) => (
              <button
                key={m.id}
                className={mode === m.id ? "active" : ""}
                aria-pressed={mode === m.id}
                onClick={() => {
                  changeMode(m.id);
                  setGuide(false);
                  setChapter(null);
                }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {t(m.name, lang)}
              </button>
            ))}
          </nav>
          <div className="rail-bottom">
            <svg viewBox="0 0 48 100" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="18" y="3" width="12" height="13" rx="4" />
                <path d="M22 16v5h-7L9 46l5 5 4-21 2 20h8l2-20 4 21 5-5-6-25h-7v-5M20 50l-5 37 5 4 5-28 2 28 6-4-5-37M15 87l-2 8h8l-1-4m7 0v4h9l-3-8M18 25h12M20 44h8" />
                <circle cx="17" cy="62" r="3" />
                <circle cx="30" cy="62" r="3" />
              </g>
            </svg>
            <p>
              {t(["HUMAN FORM.", "İNSAN BİÇİMİ."], lang)}
              <br />
              {t(["REAL ENGINEERING.", "GERÇEK MÜHENDİSLİK."], lang)}
              <i />
            </p>
          </div>
        </aside>
        <section
          className="explorer"
          aria-labelledby={guide ? "learning-title" : "explorer-title"}
        >
          <div className="explorer-content" inert={guide}>
            <div className="viewport-heading">
              <h1 id="explorer-title" tabIndex={-1}>
                {t(current.title, lang)}
              </h1>
              <p>{t(current.subtitle, lang)}</p>
            </div>
            <div
              className="view-buttons"
              aria-label={t(["Camera view", "Kamera görünümü"], lang)}
            >
              {(["front", "back", "side"] as const).map((v, i) => (
                <button
                  aria-pressed={view === v}
                  className={view === v ? "active" : ""}
                  key={v}
                  onClick={() => setView(v)}
                >
                  {t(
                    [
                      ["Front", "Ön"],
                      ["Back", "Arka"],
                      ["Side", "Yan"],
                    ][i] as [string, string],
                    lang,
                  )}
                </button>
              ))}
            </div>
            <div
              className="viewport"
              role="region"
              aria-label={t(
                [
                  "Interactive 3D humanoid. Drag to orbit; scroll to zoom. All parts are also available through controls.",
                  "Etkileşimli 3B humanoid. Döndürmek için sürükle, yakınlaştırmak için kaydır. Parçalara kontrollerden de erişilebilir.",
                ],
                lang,
              )}
            >
              <SceneBoundary
                key={sceneAttempt}
                lang={lang}
                onError={sceneError}
                onRetry={retryScene}
              >
                <Suspense
                  fallback={
                    <div className="scene-loading">
                      {t(["Loading the explorer…", "Keşif yükleniyor…"], lang)}
                    </div>
                  }
                >
                  <RobotScene
                    mode={mode}
                    lang={lang}
                    explode={explode}
                    joint={joint}
                    angle={angle}
                    playing={playing}
                    behavior={behavior}
                    perception={perception}
                    body={body}
                    view={view}
                    reset={reset}
                    selected={selected}
                    reducedMotion={reducedMotion}
                    onSelect={selectLesson}
                    onReady={onReady}
                    onTarget={target}
                    onSample={onSample}
                    onComplete={onComplete}
                  />
                </Suspense>
              </SceneBoundary>
            </div>
            <div className="viewport-options">
              <label>
                <span>{t(["BODY", "BEDEN"], lang)}</span>
                <select
                  aria-label={t(["Body region", "Beden bölgesi"], lang)}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                >
                  {bodies.map((b) => (
                    <option key={b.id} value={b.id}>
                      {t(b.name, lang)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="icon-button"
                onClick={() => {
                  setReset((r) => r + 1);
                  setView("front");
                }}
                aria-label={t(
                  ["Fit model to view", "Modeli görünüme sığdır"],
                  lang,
                )}
                title={t(["Fit model to view", "Modeli görünüme sığdır"], lang)}
              >
                <Maximize2 size={17} />
              </button>
            </div>
            {mode === "joints" && (
              <div className="joint-controls">
                <label className="joint-select">
                  <span>{t(["JOINT ANATOMY", "EKLEM ANATOMİSİ"], lang)}</span>
                  <select
                    value={joint}
                    onChange={(e) => chooseJoint(e.target.value)}
                    aria-label={t(["Joint selection", "Eklem seçimi"], lang)}
                  >
                    {joints.map((j) => (
                      <option key={j.id} value={j.id}>
                        {t(j.label, lang)}
                      </option>
                    ))}
                  </select>
                </label>
                <p>{t(joints.find((j) => j.id === joint)!.axes, lang)}</p>
                <div className="motion-input">
                  <LabControlButton action={playing ? "pause" : "play"} capabilities={manifest.capabilities} locale={lang}
                    className="icon-button"
                    aria-label={t(
                      playing
                        ? ["Pause joint motion", "Eklem hareketini duraklat"]
                        : ["Play joint motion", "Eklem hareketini oynat"],
                      lang,
                    )}
                    onClick={() => {
                      if (playing) setAngle(motionSample.current);
                      setPlaying(!playing);
                    }}
                    disabled={reducedMotion || !ready}
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </LabControlButton>
                  <input
                    aria-label={t(
                      ["Illustrative joint angle", "Temsili eklem açısı"],
                      lang,
                    )}
                    type="range"
                    min={0}
                    max={maxAngle}
                    value={angle}
                    onChange={(e) => {
                      setPlaying(false);
                      setAngle(Number(e.target.value));
                    }}
                  />
                  <output>
                    {playing
                      ? t(["Motion", "Hareket"], lang)
                      : Math.round(angle) + "°"}
                  </output>
                </div>
                <small>
                  {t(["Illustrative kinematics", "Temsili kinematik"], lang)}
                </small>
              </div>
            )}
            {mode === "behavior" && (
              <div className="behavior-controls">
                <div className="segmented">
                  {(["stand", "balance", "reach"] as const).map((b, i) => (
                    <button
                      key={b}
                      className={behavior === b ? "active" : ""}
                      aria-pressed={behavior === b}
                      onClick={() => {
                        setBehavior(b);
                        setLesson(
                          b === "reach"
                            ? "reach"
                            : b === "stand"
                              ? "stand"
                              : "balance",
                        );
                        setAngle(0);
                        setPlaying(false);
                        setReset((r) => r + 1);
                      }}
                    >
                      {t(
                        [
                          ["Stand", "Dur"],
                          ["Lean & recover", "Eğil ve toparlan"],
                          ["Reach", "Uzan"],
                        ][i] as [string, string],
                        lang,
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="text-button"
                  disabled={behavior === "stand" || reducedMotion || !ready}
                  onClick={() => {
                    if (playing) setAngle(motionSample.current);
                    else if (
                      mode === "behavior" &&
                      behavior === "reach" &&
                      angle >= 100
                    )
                      setAngle(0);
                    setPlaying(!playing);
                  }}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                  {t(
                    playing
                      ? ["Pause demonstration", "Gösterimi duraklat"]
                      : ["Play demonstration", "Gösterimi oynat"],
                    lang,
                  )}
                </button>
                {behavior !== "stand" && (
                  <label className="behavior-progress">
                    <span>{t(["Sequence", "Dizi"], lang)}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={angle}
                      aria-label={t(
                        ["Demonstration progress", "Gösterim ilerlemesi"],
                        lang,
                      )}
                      onChange={(e) => {
                        setPlaying(false);
                        setAngle(Number(e.target.value));
                      }}
                    />
                    <output>{playing ? "▶" : Math.round(angle) + "%"}</output>
                  </label>
                )}
                <small>
                  {t(
                    [
                      "Scripted motion · illustrative COM / CoP",
                      "Hazır hareket · temsili kütle / basınç merkezi",
                    ],
                    lang,
                  )}
                </small>
                {behavior === "balance" && (
                  <div className="balance-legend">
                    <span>
                      <i className="com" />{" "}
                      {t(["Center of mass", "Kütle merkezi"], lang)}
                    </span>
                    <span>
                      <i className="cop" />
                      {t(["Center of pressure", "Basınç merkezi"], lang)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {mode === "perception" && (
              <div className="perception-controls">
                <p className="section-label">
                  {t(["PERCEPTION STAGES", "ALGI AŞAMALARI"], lang)}
                </p>
                <div>
                  {[
                    ["Raw camera", "Ham kamera"],
                    ["Features", "Özellikler"],
                    ["World state", "Dünya durumu"],
                    ["Task", "Görev"],
                  ].map((s, i) => (
                    <button
                      key={i}
                      className={perception === i ? "active" : ""}
                      aria-pressed={perception === i}
                      onClick={() => setPerception(i)}
                    >
                      <span>0{i + 1}</span>
                      {t(s as [string, string], lang)}
                    </button>
                  ))}
                </div>
                {perception === 0 ? (
                  <p>
                    {t(
                      [
                        "Conceptual camera field of view.",
                        "Kavramsal kamera görüş alanı.",
                      ],
                      lang,
                    )}
                  </p>
                ) : perception === 3 ? (
                  <button className="text-button" onClick={target}>
                    {t(
                      ["Reach for the selected target", "Seçili hedefe uzan"],
                      lang,
                    )}
                    <ArrowUpRight size={16} />
                  </button>
                ) : (
                  <p>
                    {t(
                      [
                        "Candidate objects; uncertainty remains.",
                        "Olası nesneler; belirsizlik sürer.",
                      ],
                      lang,
                    )}
                  </p>
                )}
              </div>
            )}
            {(["power", "compute", "control"] as Mode[]).includes(mode) && (
              <div className="flow-controls">
                <button
                  className="text-button"
                  disabled={reducedMotion || !ready}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                  {t(
                    playing
                      ? ["Pause flow", "Akışı duraklat"]
                      : ["Animate flow", "Akışı canlandır"],
                    lang,
                  )}
                </button>
                {mode === "control" && (
                  <button
                    className="text-button physical-ai-button"
                    onClick={() => {
                      setLesson("physical-ai");
                      setSelected(null);
                    }}
                  >
                    {t(
                      [
                        "Physical AI architecture",
                        "Fiziksel Yapay Zekâ mimarisi",
                      ],
                      lang,
                    )}
                    <ArrowUpRight size={14} />
                  </button>
                )}
                <small>
                  {t(
                    mode === "power"
                      ? [
                          "Energy → distribution → motor",
                          "Enerji → dağıtım → motor",
                        ]
                      : [
                          "Measurements ↔ controllers ↔ commands",
                          "Ölçümler ↔ kontrolcüler ↔ komutlar",
                        ],
                    lang,
                  )}
                </small>
              </div>
            )}
            {mode === "control" && (
              <div className="physical-loop">
                <span>{t(["WORLD", "DÜNYA"], lang)}</span>
                <ChevronRight size={12} />
                <span>{t(["SENSE", "ALGILA"], lang)}</span>
                <ChevronRight size={12} />
                <span>{t(["ESTIMATE", "KESTİR"], lang)}</span>
                <ChevronRight size={12} />
                <span>{t(["PLAN", "PLANLA"], lang)}</span>
                <ChevronRight size={12} />
                <span>{t(["CONTROL", "KONTROL"], lang)}</span>
                <ChevronRight size={12} />
                <span>{t(["ACT", "EYLE"], lang)}</span>
                <RotateCcw size={14} />
              </div>
            )}
            {chapter !== null && (
              <div className="chapter-progress">
                <button
                  aria-label={t(["Previous chapter", "Önceki bölüm"], lang)}
                  disabled={chapter === 0}
                  onClick={() => loadChapter(chapter - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {String(chapter + 1).padStart(2, "0")} / {chapters.length} —{" "}
                  {t(chapters[chapter].title, lang)}
                </span>
                <button
                  onClick={() => setChapter(null)}
                  aria-label={t(
                    ["Exit guided lesson", "Rehberli dersten çık"],
                    lang,
                  )}
                >
                  <X size={15} />
                </button>
              </div>
            )}
            <div className="explode-toolbar">
              <div className="explode-input">
                <span>{t(["Assembled", "Montajlı"], lang)}</span>
                <input
                  aria-label={t(
                    ["Exploded view stage", "Patlatılmış görünüm aşaması"],
                    lang,
                  )}
                  aria-valuetext={stageDescription}
                  type="range"
                  min={0}
                  max={8}
                  step={0.1}
                  value={explode}
                  onChange={(e) => {
                    setExplode(Number(e.target.value));
                    setPlaying(false);
                    setAngle(0);
                  }}
                />
                <span>{t(["Explode", "Parçala"], lang)}</span>
              </div>
              <LabControlButton action="reset" capabilities={manifest.capabilities} locale={lang}
                aria-label={t(["Reset view", "Görünümü sıfırla"], lang)}
                className="reset-button"
                onClick={() => {
                  setExplode(0);
                  setAngle(0);
                  setPlaying(false);
                  setSelected(null);
                  setReset((r) => r + 1);
                  setView("front");
                  setBody("all");
                }}
              >
                <RotateCcw size={15} />
                <span>{t(["Reset view", "Görünümü sıfırla"], lang)}</span>
              </LabControlButton>
              {explode > 0 && (
                <output className="stage-readout">{stageDescription}</output>
              )}
            </div>
            <div className="viewport-hint">
              {reducedMotion
                ? t(
                    [
                      "Reduced motion · explore with manual controls",
                      "Azaltılmış hareket · elle kontrollerle keşfet",
                    ],
                    lang,
                  )
                : t(
                    [
                      "Drag to orbit · Scroll to zoom",
                      "Döndürmek için sürükle · Yakınlaştırmak için kaydır",
                    ],
                    lang,
                  )}
            </div>
            <span className="sr-only" role="status">
              {sceneFailed
                ? t(
                    [
                      "3D unavailable; lessons remain accessible",
                      "3B kullanılamıyor; derslere erişilebilir",
                    ],
                    lang,
                  )
                : ready
                  ? t(["3D model ready", "3B model hazır"], lang)
                  : t(["Loading model", "Model yükleniyor"], lang)}
            </span>
          </div>
          {guide && (
            <div
              className="learning-path"
              onKeyDown={(event) => {
                if (event.key === "Escape") setGuide(false);
              }}
            >
              <div className="learning-header">
                <div>
                  <p className="section-label">
                    HEX / {chapters.length} {t(["CHAPTERS", "BÖLÜM"], lang)}
                  </p>
                  <h1 id="learning-title" tabIndex={-1}>
                    {t(
                      ["From matter to intelligence.", "Maddeden zekâya."],
                      lang,
                    )}
                  </h1>
                  <p>
                    {t(
                      [
                        "A guided journey through one connected body.",
                        "Bağlı bir beden boyunca rehberli bir yolculuk.",
                      ],
                      lang,
                    )}
                  </p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setGuide(false)}
                  aria-label={t(
                    ["Close learning path", "Öğrenme yolunu kapat"],
                    lang,
                  )}
                >
                  <X size={20} />
                </button>
              </div>
              <ol>
                {chapters.map((c, i) => (
                  <li key={i}>
                    <button onClick={() => loadChapter(i)}>
                      <span className="chapter-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{t(c.title, lang)}</strong>
                        <small>{t(c.question, lang)}</small>
                      </span>
                      <ArrowUpRight size={19} />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
        <div
          id="lesson"
          className="lesson-container"
          tabIndex={-1}
          inert={guide}
        >
          <LessonPanel
            lang={lang}
            mode={mode}
            lesson={lesson}
            selected={selected}
            onKnee={openKnee}
            onLesson={selectLesson}
            onInfo={openInfo}
            chapter={chapter}
            onNext={nextChapter}
            joint={joint}
            body={body}
          />
        </div>
      </main>
      <footer className="footer">
        <button onClick={openInfo}>
          {t(
            [
              "An educational research platform.",
              "Eğitsel bir araştırma platformu.",
            ],
            lang,
          )}
          <Info size={13} />
        </button>
        <span className="footer-rule" />
        <span>{t(["Mechanics → Intelligence", "Mekanik → Zekâ"], lang)}</span>
      </footer>
      <InfoDialog open={info} onClose={() => setInfo(false)} lang={lang} />
    </div>
  );
}
