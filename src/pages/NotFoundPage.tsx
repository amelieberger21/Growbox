import { useT } from "../i18n";
import { ArrowLeft, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
export function NotFoundPage() {
  const tx = useT();
  return (
    <div className="empty-state not-found">
      <Sprout size={48}  aria-hidden="true" />
      <p className="eyebrow">{tx("HIER W\u00C4CHST NOCH NICHTS \u00B7 404")}</p>
      <h1>{tx("Diese Seite wurde nicht gefunden.")}</h1>
      <p>
        {tx(
          "Vielleicht ist der Link veraltet. Dein Pilzlabor wartet auf dich.",
        )}
      </p>
      <Link to="/" className="button button-primary" aria-label={tx("Zur\u00FCck zum Dashboard")} title={tx("Zur\u00FCck zum Dashboard")}>
        <ArrowLeft size={16}  aria-hidden="true" />
        {tx("Zur\u00FCck zum Dashboard")}
      </Link>
    </div>
  );
}
