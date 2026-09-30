import { RelatedLearning } from "@aserdargun/lab-ui";
import { manifest } from "../ils/catalog";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Download, X } from "lucide-react";
import {
  chapters,
  chapterCoverage,
  exportBoundary,
  lessonCoverage,
  lessons,
  spine,
  spineContext,
  sources,
  curriculumContext,
  portfolioUrl,
  t,
  uncoveredLessons,
  type Lang,
} from "../data/content";
export default function InfoDialog({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) {
      ref.current?.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    ref.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="info-dialog"
      aria-labelledby="info-title"
    >
      <div className="dialog-content">
        <button
          className="icon-button close-dialog"
          onClick={onClose}
          aria-label={t(["Close", "Kapat"], lang)}
        >
          <X size={22} />
        </button>
        <p className="section-label">
          HEX / {t(["MODEL NOTES", "MODEL NOTLARI"], lang)}
        </p>
        <h2 id="info-title">
          {t(["Understand the model.", "Modeli anla."], lang)}
        </h2>
        <p>
          {t(
            [
              "HEX is an original educational humanoid architecture. Its geometry explains relationships; it is not a manufactured robot or a validated mechanical design.",
              "HEX özgün bir eğitsel humanoid mimarisidir. Geometrisi ilişkileri açıklar; üretilmiş bir robot veya doğrulanmış mekanik tasarım değildir.",
            ],
            lang,
          )}
        </p>
        <dl className="assumptions">
          <div>
            <dt>{t(["Mechanical model", "Mekanik model"], lang)}</dt>
            <dd>
              {t(
                [
                  "27 major rotational axes, simplified grippers, coaxial planetary cartridges, representative materials and harness routes. Gear teeth are schematic.",
                  "27 ana dönme ekseni, sade tutucular, eş eksenli planet kartuşları, temsili malzemeler ve kablo yolları. Dişli dişleri şematiktir.",
                ],
                lang,
              )}
            </dd>
          </div>
          <div>
            <dt>{t(["Motion & balance", "Hareket ve denge"], lang)}</dt>
            <dd>
              {t(
                [
                  "All animations are authored kinematics. No dynamics, contact forces, inverse kinematics or trained policy are being solved. COM and CoP markers are illustrative.",
                  "Tüm animasyonlar hazırlanmış kinematik hareketlerdir. Dinamik, temas kuvvetleri, ters kinematik veya eğitilmiş politika çözülmez. Kütle ve basınç merkezi işaretleri temsildir.",
                ],
                lang,
              )}
            </dd>
          </div>
          <div>
            <dt>
              {t(["Measurements & numbers", "Ölçümler ve sayılar"], lang)}
            </dt>
            <dd>
              {t(
                [
                  "Dimensions and angle controls are educational scenario values. No capacity, torque rating, loop frequency, alloy grade or commercial performance is claimed.",
                  "Boyutlar ve açı kontrolleri eğitsel senaryo değerleridir. Kapasite, tork, döngü frekansı, alaşım veya ticari performans iddiası yoktur.",
                ],
                lang,
              )}
            </dd>
          </div>
          <div>
            <dt>
              {t(["Export & inspection", "Dışa aktarım ve inceleme"], lang)}
            </dt>
            <dd>{t(exportBoundary, lang)}</dd>
          </div>
        </dl>
        <h3>{t(["Engineering references", "Mühendislik kaynakları"], lang)}</h3>
        <p className="muted">
          {t(
            [
              "References explain mechanisms and export tools. Manufacturer examples are not a HEX bill of materials. Each source has its own review date.",
              "Kaynaklar mekanizmaları ve dışa aktarım araçlarını açıklar. Üretici örnekleri HEX malzeme listesi değildir. Her kaynağın inceleme tarihi ayrı gösterilir.",
            ],
            lang,
          )}
        </p>
        <div className="sources-list">
          {sources.map((s) => (
            <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
              <span>
                <strong>{s.name}</strong>
                <small>{t(s.title, lang)}</small>
                <small>{t(s.detail, lang)}</small>
                <small>
                  {t(["Reviewed", "İncelendi"], lang)}:{" "}
                  <time dateTime={s.checkedAt}>
                    {new Intl.DateTimeFormat(
                      lang === "tr" ? "tr-TR" : "en-GB",
                      { dateStyle: "long", timeZone: "UTC" },
                    ).format(new Date(s.checkedAt))}
                  </time>
                </small>
              </span>
              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
        <h3>
          {t(
            [
              "What each source backs",
              "Her kaynak neyi destekliyor",
            ],
            lang,
          )}
        </h3>
        <p className="muted">
          {t(
            [
              "Coverage is counted from the content, not asserted. A blank cell means no source backs that material yet — it is not evidence that the claim is unsound, and the teaching boundary text still applies.",
              "Kapsam içerikten sayılır, iddia edilmez. Boş hücre, o malzemenin henüz kaynakla desteklenmediği anlamına gelir; iddianın temelsiz olduğu anlamına gelmez ve öğretim sınırı metni yine geçerlidir.",
            ],
            lang,
          )}
        </p>
        <p className="coverage-counts">
          <span>
            {t(["Chapters", "Bölümler"], lang)}: {chapterCoverage.covered}/
            {chapterCoverage.total} {t(["attached", "bağlı"], lang)}
          </span>
          <span>
            {t(["Lessons", "Dersler"], lang)}: {lessonCoverage.covered}/
            {lessonCoverage.total} {t(["attached", "bağlı"], lang)}
          </span>
        </p>
        <div className="coverage-table" role="group" aria-label="Source coverage">
          {sources.map((s) => (
            <div className="coverage-source" key={s.url}>
              <h4>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.name}
                  <ArrowUpRight size={13} />
                </a>
              </h4>
              <p>
                {s.covers.chapters.length
                  ? s.covers.chapters
                      .map((id) => {
                        const chapter = chapters.find((c) => c.id === id);
                        return chapter ? t(chapter.title, lang) : id;
                      })
                      .join(" · ")
                  : t(
                      [
                        "Backs no chapter; documents the export tooling only.",
                        "Hiçbir bölümü desteklemez; yalnızca dışa aktarım araçlarını belgeler.",
                      ],
                      lang,
                    )}
              </p>
              <p className="coverage-lessons">
                {t(["Lessons: ", "Dersler: "], lang)}
                {s.covers.lessons.length
                  ? s.covers.lessons
                      .map((id) => t(lessons[id].title, lang))
                      .join(" · ")
                  : t(["none", "yok"], lang)}
              </p>
            </div>
          ))}
        </div>
        <h4 className="coverage-subhead">
          {t(
            ["Not yet source-attached", "Henüz kaynağa bağlanmamış"],
            lang,
          )}
        </h4>
        <ul className="coverage-gaps">
          {chapters
            .filter((c) => c.source === undefined)
            .map((c) => (
              <li key={c.id}>
                <span>{t(c.title, lang)}</span>
                <small>
                  {t(
                    ["no source yet", "henüz kaynak yok"],
                    lang,
                  )}
                </small>
              </li>
            ))}
          {uncoveredLessons.map((id) => (
            <li key={id}>
              <span>{t(lessons[id].title, lang)}</span>
              <small>
                {t(["no source yet", "henüz kaynak yok"], lang)}
              </small>
            </li>
          ))}
        </ul>
        <a
          className="download-model"
          download
          href={import.meta.env.BASE_URL + "models/HEX_Web.glb"}
        >
          <Download size={18} />
          {t(
            ["Download the web model (.glb)", "Web modelini indir (.glb)"],
            lang,
          )}
        </a>
        <h3>
          {t(
            ["Part of a connected curriculum", "Bağlı bir müfredatın parçası"],
            lang,
          )}
        </h3>
        <p>{t(curriculumContext, lang)}</p>
        <p className="muted">{t(spineContext, lang)}</p>
        <ol className="spine-list">
          {spine.map((s) => (
            <li key={s.year}>
              <span className="spine-year">Y{s.year}</span>
              <span>
                <strong>{t(s.discipline, lang)}</strong>
                <small>{t(s.focus, lang)}</small>
                <small className="spine-chapters">
                  {t(["HEX chapters: ", "HEX bölümleri: "], lang)}
                  {chapters
                    .filter((c) => c.year === s.year)
                    .map((c) => t(c.title, lang))
                    .join(" · ")}
                </small>
              </span>
            </li>
          ))}
        </ol>
        <a
          className="source-link"
          href={portfolioUrl(lang)}
          target="_blank"
          rel="noreferrer"
        >
          {t(
            [
              "Explore the aserdargun.com learning system",
              "aserdargun.com öğrenme sistemini keşfet",
            ],
            lang,
          )}
          <ArrowUpRight size={14} />
        </a>
        <RelatedLearning
          theory={manifest.related.theory}
          labs={manifest.related.labs}
          locale={lang}
        />
      </div>
    </dialog>
  );
}
