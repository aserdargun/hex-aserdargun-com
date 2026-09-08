import { useEffect, useRef } from "react";
import { ArrowUpRight, Download, X } from "lucide-react";
import { sources, t, type Lang } from "../data/content";
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
    if (open) ref.current?.showModal();
    else ref.current?.close();
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
        </dl>
        <h3>{t(["Engineering references", "Mühendislik kaynakları"], lang)}</h3>
        <p className="muted">
          {t(
            [
              "References support mechanisms, not fictional HEX specifications. Checked 8 September 2026.",
              "Kaynaklar mekanizmaları destekler; kurgusal HEX özelliklerini değil. 8 Eylül 2026 tarihinde kontrol edildi.",
            ],
            lang,
          )}
        </p>
        <div className="sources-list">
          {sources.map((s) => (
            <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
              <span>
                <strong>{s.name}</strong>
                <small>{s.title}</small>
              </span>
              <ArrowUpRight size={17} />
            </a>
          ))}
        </div>
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
        <div className="ecosystem-links">
          {[
            [
              "ENG",
              "https://eng.aserdargun.com",
              "Humanoid engineering",
              "Humanoid mühendisliği",
            ],
            [
              "WFM",
              "https://wfm.aserdargun.com",
              "World models",
              "Dünya modelleri",
            ],
            [
              "ITL",
              "https://itl.aserdargun.com",
              "Digital twins",
              "Dijital ikizler",
            ],
            [
              "EVL",
              "https://evl.aserdargun.com",
              "Evaluation",
              "Değerlendirme",
            ],
          ].map(([name, url, en, tr]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer">
              <strong>{name}</strong>
              <span>{lang === "en" ? en : tr}</span>
              <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </div>
    </dialog>
  );
}
