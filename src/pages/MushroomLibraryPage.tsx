import { useT } from "../i18n";
import { ArrowUpDown, BookOpen, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { filterEntries } from "../data/catalog";
import { MushroomCard, PageHeader } from "../components/ui";
export function MushroomLibraryPage() {
  const tx = useT();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const difficulty = ["Einfach", "Mittel", "Anspruchsvoll"].includes(
    params.get("filter") ?? "",
  )
    ? params.get("filter")!
    : "Alle";
  const sort = params.get("sort") === "name" ? "name" : "default";
  const found = filterEntries(query, difficulty, sort);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "Alle" || value === "default") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  return (
    <div className="page library-page">
      <PageHeader
        eyebrow={tx("KLEINE WUNDER. GROSSE VIELFALT.")}
        title={tx("Deine Pilzbibliothek")}
        description={tx(
          "15 Eintr\u00E4ge, unz\u00E4hlige Aha-Momente. Entdecke, was in deiner virtuellen Growbox wachsen kann.",
        )}
        action={
          <span className="library-count">
            <BookOpen size={17}  aria-hidden="true" />
            {tx("15 Bibliothekseintr\u00E4ge")}
          </span>
        }
      />
      <div className="library-intro">
        <span className="intro-leaf">{tx("\u2733")}</span>
        <p>
          <strong>{tx("Von neugierig zu pilzbegeistert.")}</strong>
          {tx(
            " Lerne die besonderen Formen unserer Kulturpilze kennen. Alle Profile sind synthetische Beispiele; die reale Eignung f\u00FCr eine Growbox ist noch nicht gepr\u00FCft.",
          )}
        </p>
      </div>
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={20}  aria-hidden="true" />
          <span className="sr-only">{tx("Pilze suchen")}</span>
          <input
            aria-label={tx("Pilze suchen")}
            type="search"
            value={query}
            onChange={(event) => update("q", event.target.value)}
            placeholder={tx("Welchen Pilz m\u00F6chtest du entdecken?")}
          />
          {tx(
            query && (
              <button
                className="icon-button"
                aria-label={tx("Suche leeren")}
                onClick={() => update("q", "")}
               title={tx("Suche leeren")}>
                <X size={16}  aria-hidden="true" />
              </button>
            ),
          )}
        </label>
        <label className="sort-select">
          <ArrowUpDown size={16}  aria-hidden="true" />
          <span className="sr-only">{tx("Pilze sortieren")}</span>
          <select
            value={sort}
            onChange={(event) => update("sort", event.target.value)}
          >
            <option value="default">{tx("Unsere Reihenfolge")}</option>
            <option value="name">{tx("Name A\u2013Z")}</option>
          </select>
        </label>
      </div>
      <div className="library-filter-row">
        <div
          className="filter-pills"
          aria-label={tx("Nach Demo-Schwierigkeit filtern")}
        >
          {tx(
            ["Alle", "Einfach", "Mittel", "Anspruchsvoll"].map((item) => (
              <button
                key={item}
                aria-pressed={difficulty === item}
                className={difficulty === item ? "active" : ""}
                onClick={() => update("filter", item)}
              >
                {tx(item)}
                {tx(item === "Alle" && <span>{tx("15")}</span>)}
              </button>
            )),
          )}
        </div>
        <span className="result-count">
          {tx(found.length)} {tx(found.length === 1 ? "Eintrag" : "Einträge")}
        </span>
      </div>
      <p className="filter-help">
        {tx(
          "Schwierigkeit = vereinfachte Demo-Einstufung. 15 Eintr\u00E4ge sind nicht 15 biologisch unterschiedliche Arten.",
        )}
      </p>
      {tx(
        found.length ? (
          <div className="library-grid">
            {tx(
              found.map((entry) => (
                <MushroomCard
                  key={entry.slug}
                  entry={entry}
                  backSearch={params.toString()}
                />
              )),
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={34}  aria-hidden="true" />
            <h2>{tx("Keine passenden Pilze gefunden.")}</h2>
            <p>
              {tx(
                "Versuch einen anderen Namen oder setze die Filter zur\u00FCck.",
              )}
            </p>
            <button
              className="button button-primary"
              onClick={() => setParams({})}
            >
              {tx("Filter zur\u00FCcksetzen")}
            </button>
          </div>
        ),
      )}
    </div>
  );
}
