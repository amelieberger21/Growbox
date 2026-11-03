import { MushroomGallery } from "../components/MushroomGallery";
import { MushroomFacts } from "../components/MushroomFacts";
import { RecipeEntry } from "./RecipePages";
import { ConditionsPanel } from "../experience/Monitoring";
import { useT } from "../i18n";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ClipboardList,
  Info,
  Layers,
  LibraryBig,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Droplets,
  ExternalLink,
  Leaf,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  getEntry,
  getProfile,
  PHASES,
  SOURCES,
  species,
  SUITABILITY,
} from "../data/catalog";
import { useGrowbox } from "../state/GrowboxProvider";
import { InfoNote, Modal } from "../components/ui";
import { MushroomArt } from "../components/MushroomArt";
import { NotFoundPage } from "./NotFoundPage";
export function MushroomDetailPage() {
  const tx = useT();
  const { slug = "" } = useParams();
  const entry = getEntry(slug);
  const { state, dispatch, notify, canControl } = useGrowbox();
  const [preview, setPreview] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: unknown = location.state;
  const backSearch =
    typeof locationState === "object" &&
    locationState !== null &&
    "librarySearch" in locationState &&
    typeof locationState.librarySearch === "string"
      ? locationState.librarySearch
      : "";
  if (!entry) return <NotFoundPage />;
  const profile = getProfile(entry);
  const info = species[entry.speciesId];
  const prepare = () => {
    dispatch({ type: "PREPARE", slug: entry.slug });
    notify(
      `${entry.name}: Kultur vorbereitet. Du kannst die Demo jetzt starten.`,
    );
    navigate("/growbox");
  };
  return (
    <div className="page detail-page">
      <Link
        className="back-link"
        to={`/pilze${backSearch ? `?${backSearch}` : ""}`}
      >
        <ArrowLeft size={16} />
        {tx("Zur\u00FCck zur Pilzbibliothek")}
      </Link>
      <div className="detail-layout">
        <MushroomGallery key={entry.slug} entry={entry} />
        <div className="detail-information">
      <div className="detail-hero">
        <div className="detail-intro">
          <p className="eyebrow">
            {tx("LERNE DEINE N\u00C4CHSTE KULTUR KENNEN")}
          </p>
          <h1>{tx(entry.name)}</h1>
          <p className="detail-latin">{tx(info.scientificName)}</p>
          <span className="difficulty">
            <Leaf size={13} />
            {tx(profile.difficulty)}
            {tx(" \u00B7 Demo-Einstufung")}
          </span>
          <p className="detail-description">{tx(entry.description)}</p>
          {tx(
            entry.speciesId === "nameko" && (
              <div className="related-note">
                <BookOpen size={18} />
                <p>
                  {tx("Goldk\u00E4ppchen ist ein Handelsname f\u00FCr Nameko.")}
                  {tx(" ")}
                  <Link
                    to={`/pilze/${entry.slug === "nameko" ? "goldkaeppchen" : "nameko"}`}
                  >
                    {tx("Zum Eintrag")}
                    {tx(" ")}
                    {tx(entry.slug === "nameko" ? "Goldkäppchen" : "Nameko")}
                    <ArrowRight size={13} />
                  </Link>
                </p>
              </div>
            ),
          )}
          <button
            disabled={!canControl} className="button button-primary button-wide"
            onClick={(event) => {
              event.currentTarget.focus();
              setPreview(true);
            }}
          >
            <Sprout size={18} />
            {tx("In meiner Growbox anbauen")}
            <ArrowRight size={17} />
          </button>
          <p className="detail-suitability">
            <Check size={14} />
            {tx(SUITABILITY)}
          </p>
        </div>
      </div>
      {tx(
        entry.speciesId === "stock" && (
          <InfoNote warning>
            <strong>
              {tx("Verwechslungsgefahr mit dem giftigen Gifth\u00E4ubling.")}
            </strong>
            {tx(" ")}
            {tx(
              "Diese Website eignet sich nicht zur Bestimmung selbst gesammelter Pilze.",
            )}
            {tx(" ")}
            <a href={SOURCES[3].url} target="_blank" rel="noreferrer">
              {tx("Quelle: Universit\u00E4tsklinikum Freiburg")}
            </a>
          </InfoNote>
        ),
      )}
        </div>
      </div>
      <div className="detail-sections">
      <ConditionsPanel entry={entry} />
      <MushroomFacts key={entry.slug} entry={entry}/>
      <div className="detail-recipes"><RecipeEntry entry={entry} librarySearch={backSearch} /></div>
      <section className="panel demo-profile-panel">
        <div>
          <p className="eyebrow">{tx("EIN BEISPIEL, KEINE ANBAUEMPFEHLUNG")}</p>
          <h2><ClipboardList aria-hidden="true" />{tx("Dein Demo-Profil")}</h2>
          <p>{tx("Diese Werte werden nur in der Simulation verwendet.")}</p>
        </div>
        <div className="profile-values">
          <div>
            <Thermometer size={21} />
            <strong>
              {tx(profile.temperature)}
              <small>{tx("\u00B0C")}</small>
            </strong>
            <span>{tx("Demo-Solltemperatur")}</span>
          </div>
          <div>
            <Droplets size={21} />
            <strong>
              {tx(profile.humidity)}
              <small>{tx("%")}</small>
            </strong>
            <span>{tx("Demo-Sollluftfeuchtigkeit")}</span>
          </div>
          <div>
            <Clock3 size={21} />
            <strong>
              {tx(profile.days)}
              <small>{tx("Tage")}</small>
            </strong>
            <span>{tx("Simulierte Kulturdauer")}</span>
          </div>
        </div>
      </section>
      <div className="detail-content-grid">
        <section className="panel">
          <h2><Layers aria-hidden="true" />{tx("Ein Blick hinter den Hut")}</h2>
          <dl className="care-list">
            <div>
              <span className="icon-tile">
                <Leaf size={19} />
              </span>
              <div>
                <dt>{tx("Substrat \u2013 das N\u00E4hrmaterial")}</dt>
                <dd>{tx(info.substrate)}</dd>
              </div>
            </div>
            <div>
              <span className="icon-tile">
                <Sun size={19} />
              </span>
              <div>
                <dt>{tx("Licht")}</dt>
                <dd>{tx(info.light)}</dd>
              </div>
            </div>
            <div>
              <span className="icon-tile">
                <Wind size={19} />
              </span>
              <div>
                <dt>{tx("Frischluft")}</dt>
                <dd>{tx(info.air)}</dd>
              </div>
            </div>
            <div>
              <span className="icon-tile">
                <Droplets size={19} />
              </span>
              <div>
                <dt>{tx("Pflege & Beobachtung")}</dt>
                <dd>{tx(info.care)}</dd>
              </div>
            </div>
          </dl>
          <p className="verification-note">
            {tx(
              "Redaktionelle Einordnung aus dem Projektkonzept \u00B7 Fachpr\u00FCfung noch ausstehend.",
            )}
          </p>
        </section>
        <section className="panel detail-phases">
          <h2><Sprout aria-hidden="true" />{tx("Vom Anfang bis zum Aha.")}</h2>
          <p>
            {tx(
              "F\u00FCnf Phasen machen Wachstum verst\u00E4ndlich. Ein vereinfachtes Lernmodell.",
            )}
          </p>
          <ol>
            {tx(
              PHASES.map((phase, index) => (
                <li key={phase.name}>
                  <span>{tx(String(index + 1).padStart(2, "0"))}</span>
                  <div>
                    <strong>{tx(phase.name)}</strong>
                    <p>{tx(phase.description)}</p>
                  </div>
                </li>
              )),
            )}
          </ol>
          <Link to="/wachstum" className="text-link">
            {tx("Aktuellen Verlauf ansehen")}
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <section className="panel source-panel">
        <div>
          <h2><Info aria-hidden="true" />{tx("Gut zu wissen")}</h2>
          <p>{tx(info.harvest)}</p>
          {tx(
            entry.synonyms.length > 0 && (
              <p>
                <strong>{tx("Weitere Namen & Suchbegriffe:")}</strong>
                {tx(" ")}
                {tx(entry.synonyms.join(", "))}
                {tx(".")}
              </p>
            ),
          )}
          <p className="verification-note">
            {tx(
              "Wissenschaftliche Namen dienen der Einordnung. Diese Website ist kein Bestimmungswerkzeug.",
            )}
          </p>
        </div>
        <div>
          <h3><LibraryBig aria-hidden="true" />{tx("Quellen & Pr\u00FCfstand")}</h3>
          {tx(
            info.sources.map((id) => {
              const source = SOURCES.find((item) => item.id === id)!;
              return (
                <a
                  className="source-link"
                  href={source.url}
                  key={id}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tx(source.name)}
                  <ExternalLink size={13} />
                </a>
              );
            }),
          )}
          <p className="verification-note">
            {tx(
              entry.speciesId === "nameko"
                ? "Handelsname Nameko/Goldkäppchen: mit BZfE belegt. "
                : "",
            )}
            {tx(
              "Die Zahlen im Demo-Profil sind synthetisch. Artspezifische Pflegeangaben und reale Growbox-Eignung sind ungepr\u00FCft.",
            )}
          </p>
        </div>
      </section>
      </div>
      {tx(
        preview && (
          <Modal
            title={tx("Platz f\u00FCr etwas Neues?")}
            onClose={() => setPreview(false)}
            footer={
              <>
                <button
                  className="button button-outline"
                  onClick={() => setPreview(false)}
                >
                  {tx("Abbrechen")}
                </button>
                <button className="button button-primary" onClick={prepare}>
                  {tx("Kultur vorbereiten")}
                  <ArrowRight size={16} />
                </button>
              </>
            }
          >
            <div className="preview-culture">
              <div style={{ background: entry.background }}>
                <MushroomArt entry={entry} />
              </div>
              <div>
                <h3>{tx(entry.name)}</h3>
                <p>
                  {tx(profile.temperature)}
                  {tx(" \u00B0C \u00B7 ")}
                  {tx(profile.humidity)}
                  {tx(" % \u00B7 ")}
                  {tx(profile.days)}
                  {tx(" ")}
                  {tx("Demo-Tage")}
                </p>
                <small>
                  {tx("Automatik, Beleuchtung und Bel\u00FCftung: ein")}
                </small>
              </div>
            </div>
            <p>
              {tx(
                "Diese Einstellungen werden nur in der Demo verwendet. Die neue Kultur wird vorbereitet und startet erst, wenn du \u201EDemo starten\u201C w\u00E4hlst.",
              )}
            </p>
            {tx(
              state.cycle && (
                <InfoNote warning>
                  {tx("Deine")}
                  {tx(" ")}
                  {tx(
                    state.cycle.slug === entry.slug
                      ? "bereits aktive"
                      : "aktuelle",
                  )}
                  {tx(" ")}
                  {tx("Kultur \u201E")}
                  {tx(getEntry(state.cycle.slug)?.name)}
                  {tx(
                    "\u201C und ihr laufender Verlauf werden ersetzt. Auch eine erneute Auswahl beginnt wieder bei 0 %.",
                  )}
                </InfoNote>
              ),
            )}
          </Modal>
        ),
      )}
    </div>
  );
}
