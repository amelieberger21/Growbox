import { TechnologySummary } from "../components/Technology";
import { useT } from "../i18n";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Leaf,
  Lightbulb,
  Pause,
  Play,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGrowbox } from "../state/GrowboxProvider";
import { entries, getEntry, PHASES, species } from "../data/catalog";
import {
  cultureDay,
  formatNumber,
  percent,
  phaseAt,
} from "../simulation/engine";
import { MushroomArt } from "../components/MushroomArt";
import {
  MushroomCard,
  PageHeader,
  Progress,
  SectionTitle,
  StatusBadge,
} from "../components/ui";
import {
  Alerts,
  EventLog,
  SensorCards,
  TelemetryChart,
} from "../components/Telemetry";
export function DashboardPage() {
  const tx = useT();
  const { state, dispatch } = useGrowbox();
  const entry = state.cycle ? getEntry(state.cycle.slug) : undefined;
  const progress = percent(state);
  const phase = PHASES[phaseAt(progress)];
  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow={tx("EIN GUTER TAG ZUM WACHSEN")}
        title={tx("Deine MycoBox im \u00DCberblick")}
        description={tx("Ein kleines \u00D6kosystem. Und du bist mittendrin.")}
        action={
          <Link to="/growbox" className="button button-outline">
            <SlidersHorizontal size={16} />
            {tx("Growbox steuern")}
            <ArrowUpRight size={16} />
          </Link>
        }
      />
      <Alerts />
      <div className="dashboard-hero-grid">
        <section className="culture-hero">
          <div className="hero-contours" aria-hidden="true">
            <svg viewBox="0 0 500 300">
              {tx(
                Array.from({ length: 8 }, (_, i) => (
                  <ellipse
                    key={i}
                    cx="340"
                    cy="145"
                    rx={80 + i * 27}
                    ry={70 + i * 18}
                    transform="rotate(-25 340 145)"
                  />
                )),
              )}
            </svg>
          </div>
          <div className="culture-hero-content">
            <div className="hero-eyebrow">
              <span className="hero-label">
                <Leaf size={13} />
                {tx("DEINE AKTUELLE KULTUR")}
              </span>
              <StatusBadge status={state.cycle?.status} />
            </div>
            {tx(
              entry ? (
                <>
                  <Link
                    className="hero-culture-name"
                    to={`/pilze/${entry.slug}`}
                  >
                    <h2>{tx(entry.name)}</h2>
                    <ArrowUpRight size={22} />
                  </Link>
                  <p className="hero-scientific">
                    {tx(species[entry.speciesId].scientificName)}
                  </p>
                  <div className="hero-phase">
                    <Sprout size={16} />
                    <span>{tx(phase.name)}</span>
                    <span className="hero-phase-dot" />
                    <span>{tx(state.settings.mode)}</span>
                  </div>
                  <div className="hero-progress-heading">
                    <span>
                      {tx("Tag ")}
                      {tx(cultureDay(state))}
                      {tx(" ")}
                      <span className="soft-text">
                        {tx("von ")}
                        {tx(state.cycle?.totalDays)}
                      </span>
                    </span>
                    <strong>
                      {tx(formatNumber(progress))}
                      {tx(" %")}
                    </strong>
                  </div>
                  <Progress value={progress} />
                  <div className="hero-progress-footer">
                    <span>
                      <Clock3 size={12} />
                      {tx("Noch")}
                      {tx(" ")}
                      {tx(
                        Math.ceil(
                          (state.cycle!.totalDays * 24 -
                            state.cycle!.elapsedHours) /
                            24,
                        ),
                      )}
                      {tx(" ")}
                      {tx("simulierte Tage")}
                    </span>
                    <Link to="/wachstum">
                      {tx("Verlauf ansehen")}
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                  <Link
                    className="hero-recipe-link"
                    to={`/pilze/${entry.slug}/rezepte`}
                    state={{ returnTo: "/" }}
                  >
                    {tx("Rezeptideen")}
                    <ArrowUpRight size={13} />
                  </Link>
                </>
              ) : (
                <>
                  <h2>{tx("Hier kann etwas wachsen.")}</h2>
                  <p>
                    {tx(
                      "Entdecke deinen ersten Pilz und bereite eine virtuelle Kultur vor.",
                    )}
                  </p>
                  <Link to="/pilze" className="button button-lime">
                    {tx("Pilz ausw\u00E4hlen")}
                    <ArrowRight size={16} />
                  </Link>
                </>
              ),
            )}
          </div>
          {tx(
            entry && (
              <div className="hero-art">
                <MushroomArt entry={entry} hero />
                <span>{tx("Fotografie · Bildnachweise im Projekt")}</span>
              </div>
            ),
          )}
          <div className="hero-bottom">
            <span>
              <Check size={14} />
              {tx("Eine Growbox. Deine kleine Pilzwelt.")}
            </span>
            {tx(
              (state.cycle?.status === "Läuft" ||
                state.cycle?.status === "Pausiert") && (
                <button
                  className="hero-pause"
                  onClick={() =>
                    dispatch({
                      type: "STATUS",
                      status:
                        state.cycle?.status === "Läuft" ? "Pausiert" : "Läuft",
                    })
                  }
                >
                  {tx(
                    state.cycle?.status === "Läuft" ? (
                      <Pause size={13} />
                    ) : (
                      <Play size={13} />
                    ),
                  )}
                  {tx("Demo")}
                  {tx(" ")}
                  {tx(
                    state.cycle?.status === "Läuft"
                      ? "pausieren"
                      : "fortsetzen",
                  )}
                </button>
              ),
            )}
          </div>
        </section>
        <aside className="discovery-card">
          <div className="discovery-top">
            <span className="tip-icon">
              <Lightbulb size={20} />
            </span>
            <span>{tx("WISSEN, DAS W\u00C4CHST")}</span>
          </div>
          <h2>
            {tx("Der Pilz ist nur")}
            <br />
            {tx("der Anfang.")}
          </h2>
          <p>
            {tx(
              "Unter der Oberfl\u00E4che liegt das Myzel \u2013 ein feines Geflecht, aus dem die sichtbaren Fruchtk\u00F6rper entstehen.",
            )}
          </p>
          <Link to="/wachstum">
            {tx("Lerne die Wachstumsphasen kennen")}
            <ArrowUpRight size={17} />
          </Link>
          <div className="mycelium-art" aria-hidden="true">
            <svg viewBox="0 0 300 90">
              {tx(
                Array.from({ length: 12 }, (_, i) => (
                  <path
                    key={i}
                    d={`M150 0Q${100 + i * 9} 30 ${20 + i * 24} 85M${90 + i * 9} 52l${i % 2 ? 16 : -16} 15m${i % 2 ? -8 : 8} -8l${i % 2 ? 20 : -20} 5`}
                  />
                )),
              )}
            </svg>
            <Sprout size={33} />
          </div>
        </aside>
      </div>
      <TechnologySummary />
      <div className="section-title sensor-section-title">
        <h2>{tx("Ein Blick auf dein Klima")}</h2>
        <span className="live-label">
          <span className="tiny-dot" />
          {tx("Simulierte Messwerte")}
        </span>
      </div>
      <SensorCards />
      <div className="chart-events-grid">
        <TelemetryChart />
        <EventLog />
      </div>
      <section className="featured-section">
        <SectionTitle title={tx("Dein n\u00E4chstes kleines Wunder")}>
          <Link className="text-link" to="/pilze">
            {tx("Alle 15 Pilze entdecken")}
            <ArrowRight size={16} />
          </Link>
        </SectionTitle>
        <p className="section-description">
          {tx(
            "Lerne neue Pilze kennen und finde dein n\u00E4chstes Beispielprofil. Schwierigkeiten sind Demo-Einstufungen.",
          )}
        </p>
        <div className="featured-grid">
          {tx(
            [entries[1], entries[5], entries[7]].map((item) => (
              <MushroomCard entry={item} key={item.slug} compact />
            )),
          )}
        </div>
      </section>
    </div>
  );
}
