import { useMemo, useState } from "react";
import components from "../data/components.json";
import { lessons, modes, t, type Lang, type Mode } from "../data/content";

export default function ComponentBrowser({
  lang,
  mode,
  joint,
  body,
  selected,
  onSelect,
}: {
  lang: Lang;
  mode: Mode;
  joint: string;
  body: string;
  selected: string | null;
  onSelect: (lesson: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const categories = modes.find((m) => m.id === mode)!.categories;
    const needle = query.trim().toLocaleLowerCase(lang);
    return components.filter((part) => {
      if (body !== "all" && part.region !== body) return false;
      if (mode === "joints") {
        if (!(part.name.endsWith(joint) || part.name.includes(joint + "_")))
          return false;
      } else if (categories.length && !categories.includes(part.category))
        return false;
      return (
        !needle ||
        `${part.name} ${t(lessons[part.lesson].title, lang)}`
          .toLocaleLowerCase(lang)
          .includes(needle)
      );
    });
  }, [mode, joint, body, query, lang]);
  return (
    <details className="component-browser">
      <summary>
        {t(["Browse model components", "Model bileşenlerine göz at"], lang)}
      </summary>
      <p>
        {t(
          [
            "Select a named part to highlight it and read its lesson. Available without 3D.",
            "Adlandırılmış bir parçayı vurgulamak ve dersini okumak için seç. 3B olmadan da kullanılabilir.",
          ],
          lang,
        )}
      </p>
      <label>
        <span>{t(["Find a component", "Bileşen bul"], lang)}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label>
        <span>{t(["Model component", "Model bileşeni"], lang)}</span>
        <select
          value={
            matches.some((part) => part.name === selected) ? selected! : ""
          }
          onChange={(event) => {
            const part = matches.find(
              (item) => item.name === event.target.value,
            );
            if (part) onSelect(part.lesson, part.name);
          }}
        >
          <option value="" disabled>
            {t(["Select a component", "Bir bileşen seç"], lang)}
          </option>
          {matches.map((part) => (
            <option key={part.name} value={part.name}>
              {part.name}
            </option>
          ))}
        </select>
      </label>
      <p role="status">
        {matches.length}{" "}
        {t(["components in this view", "bileşen bu görünümde"], lang)}
        {matches.length === 0 &&
          ` · ${t(["Try another search or body region.", "Başka bir arama veya beden bölgesi dene."], lang)}`}
      </p>
    </details>
  );
}
