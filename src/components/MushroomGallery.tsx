import type { MushroomEntry } from '../types';
import { MushroomArt } from './MushroomArt';
import { useT } from '../i18n';
import { Images } from 'lucide-react';

/** Show each available photograph once; crops are not additional photographs. */
export function MushroomGallery({entry}:{entry:MushroomEntry}) {
  const tx=useT();
  const extra=entry.slug==='weisser-champignon'
    ? {src:'/mushrooms/weisser-champignon.jpg',credit:'chris_73 · CC BY-SA 3.0'}
    : entry.slug==='brauner-champignon'
      ? {src:'/mushrooms/brauner-champignon.jpg',credit:'Evan-Amos · Public domain'} : null;
  return <section className="mushroom-gallery" aria-label={`${tx('Bilder')}: ${tx(entry.name)}`}>
    <div className="gallery-main"><MushroomArt entry={entry} hero /></div>
    {extra&&<figure className="gallery-extra"><img src={extra.src} alt={`${tx(entry.name)} · ${tx('Weitere Aufnahme')}`} loading="lazy"/><figcaption>{extra.credit}</figcaption></figure>}
    <p className="gallery-caption"><Images aria-hidden="true"/>{tx('Kein Bestimmungsbild')}</p>
  </section>;
}
