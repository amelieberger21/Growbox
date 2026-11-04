import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, MessageCircle, Send, Trash2, UserRound, X } from "lucide-react";
import { Modal, PageHeader } from "../components/ui";
import { useT, currentLocale } from "../i18n";
import { mushroomPhotos } from "../data/mushroomPhotos";
import { addPost, COMMUNITY_KEY, deletePost, preparePhoto, readPosts, type CommunityPost } from "../community/storage";

const examples = [
  { name: "Katja", text: "Braune Champignons schmecken besonders gut klein geschnitten auf Baguette" },
  { name: "Anonym", text: "Ich notiere mir jeden Tag kurz, was sich an meiner Kultur verändert. So fallen mir kleine Fortschritte viel leichter auf.", photo: "austernseitling" },
  { name: "Jonas", text: "Die Phasenübersicht hilft mir beim Einstieg. Ich schaue erst nach, in welcher Phase meine Kultur ist, bevor ich Einstellungen ändere." },
  { name: "Anonym", text: "Mein Tipp für den Standort: Ich stelle die Box so auf, dass ich den Tank gut erreichen und die Tür vollständig öffnen kann." },
  { name: "Mira", text: "Ich fotografiere meine Pilze immer aus derselben Perspektive. Den Unterschied zwischen den Tagen finde ich richtig spannend!", photo: "shimeji" },
];
export function CommunityPage() {
  const tx = useT();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  useEffect(() => {
    const load = () => {
      try { setPosts(readPosts()); }
      catch { setError("Gespeicherte Beiträge sind nicht verfügbar. Dein Entwurf bleibt erhalten."); }
    };
    load();
    const sync = (event: StorageEvent) => { if (event.key === COMMUNITY_KEY || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const images = await Promise.all(files.map(preparePhoto));
      setPosts(addPost({ id: crypto.randomUUID(), name: name.trim(), text: text.trim(), images, createdAt: new Date().toISOString() }));
      setText(""); setFiles([]);
      if (input.current) input.current.value = "";
      setNotice("Dein Beitrag wurde lokal gespeichert.");
    } catch {
      setError("Der Beitrag konnte nicht gespeichert werden. Prüfe die Bilder und den freien Browser-Speicher. Dein Entwurf bleibt erhalten.");
    } finally { setBusy(false); }
  }
  function remove(id: string) {
    try { setPosts(deletePost(id)); setNotice("Dein Beitrag wurde gelöscht."); setError(""); }
    catch { setError("Der Beitrag konnte nicht gelöscht werden. Bitte erneut versuchen."); }
  }
  return <div className="page community-page">
    <PageHeader eyebrow="ZUSAMMEN WACHSEN" title="Community" description="Teile deine Erfahrungen, Bilder und kleinen Erfolgsmomente mit der Pilzzucht."/>
    <div className="community-notice"><MessageCircle aria-hidden="true"/><p>{tx("Community-Demo: Eigene Beiträge und Bilder bleiben in diesem Browser und werden nicht veröffentlicht. Die fünf Beispielbeiträge sind erfunden; die zwei Beispielbilder stammen aus der Pilzbibliothek.")}</p></div>
    <div className="community-layout">
      <section className="panel community-compose" aria-labelledby="community-compose-title">
        <h2 id="community-compose-title"><MessageCircle aria-hidden="true"/>{tx("Dein Beitrag")}</h2>
        <form onSubmit={submit}>
          <label htmlFor="community-name">{tx("Name · optional")}</label>
          <input id="community-name" maxLength={60} value={name} onChange={event => setName(event.target.value)} placeholder={tx("Ohne Namen erscheint dein Beitrag als Anonym")} disabled={busy}/>
          <label htmlFor="community-text">{tx("Deine Erfahrung oder dein Tipp")}</label>
          <textarea id="community-text" required maxLength={2000} rows={6} value={text} onChange={event => setText(event.target.value)} placeholder={tx("Was möchtest du mit anderen teilen?")} disabled={busy} aria-describedby="community-length"/>
          <small id="community-length">{text.length} / 2000</small>
          <label htmlFor="community-images"><ImagePlus aria-hidden="true"/>{tx("Bilder hinzufügen · optional")}</label>
          <input ref={input} id="community-images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} aria-describedby="community-image-help" onChange={event => {
            const selected = Array.from(event.target.files ?? []);
            if (selected.length > 3 || selected.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
              setError("Bitte höchstens drei Bilder auswählen: JPEG, PNG oder WebP, jeweils bis 5 MB.");
              event.target.value = ""; setFiles([]); return;
            }
            setError(""); setFiles(selected);
          }}/>
          <small id="community-image-help">{tx("Bis zu 3 eigene Bilder, jeweils höchstens 5 MB. JPEG, PNG oder WebP. Bilder werden für die Anzeige verkleinert.")}</small>
          {previews.length > 0 && <div className="community-previews">{previews.map((url, index) => <figure key={url}><img src={url} alt={`${tx("Bildvorschau")}: ${files[index]?.name ?? ""}`}/><button type="button" className="icon-button" title={tx("Bild entfernen")} aria-label={`${tx("Bild entfernen")}: ${files[index]?.name ?? ""}`} disabled={busy} onClick={() => {setFiles(files.filter((_, i) => i !== index)); if (input.current) input.current.value = "";}}><X aria-hidden="true"/></button></figure>)}</div>}
          {error && <p className="community-error" role="alert">{tx(error)}</p>}
          <button className="button button-primary" type="submit" disabled={busy || !text.trim()} title={tx("Beitrag lokal speichern")}><Send aria-hidden="true"/>{tx(busy ? "Beitrag wird gespeichert …" : "Beitrag lokal speichern")}</button>
        </form>
        <p className="community-storage-note">{tx("Wenn du Browserdaten löschst, gehen deine lokalen Beiträge verloren.")}</p>
      </section>
      <section className="community-feed" aria-labelledby="community-feed-title">
        <div className="section-title"><h2 id="community-feed-title">{tx("Erfahrungen & Tipps")}</h2><span className="muted-tag">{posts.length + examples.length} {tx("Beiträge")}</span></div>
        <p role="status" className="community-status">{tx(notice)}</p>
        {posts.map(post => <article className="panel community-post" key={post.id}>
          <header><div className="community-author"><UserRound aria-hidden="true"/><div><h3>{post.name || tx("Anonym")}</h3><time dateTime={post.createdAt}>{new Intl.DateTimeFormat(currentLocale(), {dateStyle:"medium", timeStyle:"short"}).format(new Date(post.createdAt))}</time></div></div><span className="muted-tag">{tx("Dein lokaler Beitrag")}</span></header>
          <p className="community-post-text">{post.text}</p>
          {post.images.length > 0 && <div className="community-post-images">{post.images.map((src, index) => <button type="button" key={index} title={`${tx("Bild vergrößern")} ${index + 1}`} aria-label={`${tx("Bild vergrößern")} ${index + 1}`} onClick={() => setOpenPhoto(src)}><img src={src} alt={`${tx("Eigenes Bild zum Beitrag")} ${index + 1}`} loading="lazy"/></button>)}</div>}
          <button type="button" className="text-button" title={tx("Eigenen Beitrag löschen")} aria-label={tx("Eigenen Beitrag löschen")} onClick={() => remove(post.id)}><Trash2 aria-hidden="true"/>{tx("Beitrag löschen")}</button>
        </article>)}
        {examples.map((example, index) => {
          const photo = example.photo ? mushroomPhotos[example.photo] : null;
          return <article className="panel community-post" key={`example-${index}`}>
            <header><div className="community-author"><UserRound aria-hidden="true"/><h3>{example.name === "Anonym" ? tx("Anonym") : example.name}</h3></div><span className="muted-tag">{tx("Beispielbeitrag")}</span></header>
            <p className="community-post-text">{tx(example.text)}</p>
            {photo && <figure className="community-example-photo"><img src={photo.src} alt={tx(photo.altDe)} loading="lazy"/><figcaption>{tx("Beispielbild aus der Pilzbibliothek")} · <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.author}</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></figcaption></figure>}
          </article>;
        })}
      </section>
    </div>
    {openPhoto && <Modal title={tx("Bild zum Beitrag")} onClose={() => setOpenPhoto(null)} footer={<button className="button button-primary" onClick={() => setOpenPhoto(null)}>{tx("Schließen")}</button>}><img className="community-photo-large" src={openPhoto} alt={tx("Eigenes Bild zum Beitrag")}/></Modal>}
  </div>;
}
