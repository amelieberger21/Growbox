import { useT } from "../i18n";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, Check, CircleHelp, Leaf, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { MushroomEntry, Status } from "../types";
import { getProfile, species } from "../data/catalog";
import { MushroomArt } from "./MushroomArt";
export function Logo({ compact = false }: { compact?: boolean }) {
  const tx = useT();
  return (
    <span className="logo">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M4 19C4-1 32-1 32 19Z" fill="currentColor" />
        <path d="M14 22h8v12h-8z" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="#f7f8f2" />
        <circle cx="24" cy="10" r="3" fill="#f7f8f2" />
      </svg>
      {tx(
        !compact && (
          <span>
            {tx("myco")}
            <span className="logo-light">{tx("box")}</span>
          </span>
        ),
      )}
    </span>
  );
}
export function StatusBadge({ status }: { status?: Status }) {
  const tx = useT();
  return (
    <span className={`status-badge status-${status ?? "none"}`}>
      <span className="status-dot" />
      {tx(status ?? "Keine Kultur")}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const tx = useT();
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{tx(eyebrow)}</p>
        <h1>{tx(title)}</h1>
        <p className="page-description">{tx(description)}</p>
      </div>
      {tx(action)}
    </div>
  );
}
export function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const tx = useT();
  return (
    <div className="section-title">
      <h2>{tx(title)}</h2>
      {tx(children)}
    </div>
  );
}
export function MushroomCard({
  entry,
  compact = false,
  backSearch = "",
}: {
  entry: MushroomEntry;
  compact?: boolean;
  backSearch?: string;
}) {
  const tx = useT();
  return (
    <Link
      className={`mushroom-card ${compact ? "compact" : ""}`}
      to={`/pilze/${entry.slug}`}
      state={{ librarySearch: backSearch }}
    >
      <div className="card-art" style={{ background: entry.background }}>
        <MushroomArt entry={entry} />
        <span className="art-label">{tx("Fotografie")}</span>
        <span
          className={`difficulty difficulty-${getProfile(entry).difficulty}`}
        >
          <Leaf size={12} />
          {tx(getProfile(entry).difficulty)}
        </span>
      </div>
      <div className="mushroom-card-body">
        <h3>{tx(entry.name)}</h3>
        <p className="scientific">
          {tx(species[entry.speciesId].scientificName)}
        </p>
        <p className="card-description">{tx(entry.short)}</p>
        <span className="card-link">
          {tx("Details ansehen ")}
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}
export function Modal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer: ReactNode;
}) {
  const tx = useT();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <span className="icon-tile">
          <Leaf size={22} />
        </span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={tx("Dialog schlie\u00DFen")}
        >
          <X size={20} />
        </button>
      </div>
      <h2 id="dialog-title">{tx(title)}</h2>
      <div className="modal-content">{tx(children)}</div>
      <div className="modal-actions">{tx(footer)}</div>
    </dialog>
  );
}
export function InfoNote({
  children,
  warning = false,
}: {
  children: ReactNode;
  warning?: boolean;
}) {
  const tx = useT();
  return (
    <div className={`info-note ${warning ? "warning" : ""}`}>
      <CircleHelp size={17} />
      <div>{tx(children)}</div>
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  const tx = useT();
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={tx("Simulierter Kulturfortschritt")}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  const tx = useT();
  return (
    <button
      type="button"
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={tx(label)}
      disabled={disabled}
      onClick={onChange}
    >
      <span>{tx(checked && <Check size={11} />)}</span>
    </button>
  );
}
