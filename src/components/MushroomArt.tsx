import { useEffect, useState } from "react";
import { CameraOff } from "lucide-react";
import type { MushroomEntry } from "../types";
import { mushroomPhotos } from "../data/mushroomPhotos";
import { useT } from "../i18n";
export function MushroomArt({
  entry,
  className = "",
  hero = false,
}: {
  entry: MushroomEntry;
  className?: string;
  hero?: boolean;
}) {
  const tx = useT();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [entry.slug]);
  const photo = mushroomPhotos[entry.slug];
  return (
    <div
      className={`mushroom-art mushroom-photo ${hero ? "hero-photo" : ""} ${className}`}
    >
      {photo && !failed ? (
        <>
          <img
            src={photo.src}
            alt={tx(photo.altDe)}
            loading={hero ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />
          <span className="photo-credit">
            {photo.author} · {photo.license}
          </span>
        </>
      ) : (
        <div
          className="photo-missing"
          role="img"
          aria-label={`${tx(entry.name)}: ${tx("Foto nicht verfügbar")}`}
        >
          <CameraOff size={25}  aria-hidden="true" />
          <strong>{tx(entry.name)}</strong>
          <span>{tx("Foto nicht verfügbar")}</span>
        </div>
      )}
    </div>
  );
}
