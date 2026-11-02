import { randomBytes } from 'node:crypto';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Local-only credential entry. Never renders, returns or logs the stored secret. */
export function assistantSetup(env: Record<string, string>, directory: string) {
  const token = randomBytes(32).toString('hex');
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/assistant/setup') return next();
    const host = req.headers.host ?? '';
    const local = /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host);
    const address = req.socket?.remoteAddress;
    const send = (code: number, body: unknown) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    if (!local || !address || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)) return send(403, { error: 'Die Einrichtung ist nur auf diesem Computer verfügbar.' });
    if (req.method === 'GET') {
      if (req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Bitte die Einrichtungsseite direkt öffnen.' });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': `default-src 'none'; style-src 'nonce-${token}'; script-src 'nonce-${token}'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'` });
      res.end(`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mistral verbinden · MycoBox</title>
<style nonce="${token}">*{box-sizing:border-box}body{font:17px/1.6 system-ui,sans-serif;color:#203e30;background:#f3f5ee;margin:0;padding:40px 20px}main{max-width:540px;margin:5vh auto;background:#fffef9;border:1px solid #cfddce;border-radius:24px;padding:32px;box-shadow:0 12px 40px #203e3010}small{color:#506555}h1{font-size:30px;line-height:1.2;margin:12px 0 20px}label{display:block;font-weight:600;margin:24px 0 8px}input{width:100%;padding:16px;border:2px solid #789580;border-radius:12px;font:inherit}button,a{font:inherit}button{width:100%;margin-top:18px;border:0;border-radius:12px;padding:16px;background:#224d38;color:white;font-weight:600;cursor:pointer}button:disabled{opacity:.6}a{color:#224d38}input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #bd7a13;outline-offset:4px}#status{margin:16px 0;white-space:pre-wrap}.hint{font-size:14px}</style>
<main><small>MYCOBOX · SPRACHASSISTENT</small><h1>Mistral verbinden</h1><p>Hier kommt dein neuer API-Schlüssel hinein. Klicke in das Feld, füge ihn ein und drücke „Schlüssel speichern“.</p>
<form id="setup"><label for="key">Mistral-API-Schlüssel</label><input id="key" name="key" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Neuen Schlüssel hier einfügen" required minlength="16" maxlength="256" autofocus><button id="save" type="submit">Schlüssel speichern</button></form>
<p id="status" role="status" aria-live="polite"></p><p class="hint">Der Schlüssel wird nur auf diesem Computer in der lokalen Konfigurationsdatei gespeichert. Er erscheint weder im Chat noch im Gesprächsverlauf. Für KI-Anfragen verwendet der Server ihn zur Anmeldung bei Mistral.</p><p class="hint">Verwende einen neuen Schlüssel, der noch nicht im Chat geteilt wurde.</p><a href="/growbox">Zurück zum Prototyp</a></main>
<script nonce="${token}">const form=document.getElementById('setup'),key=document.getElementById('key'),button=document.getElementById('save'),status=document.getElementById('status');form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;status.textContent='Wird lokal gespeichert …';try{const response=await fetch('/api/assistant/setup',{method:'POST',headers:{'Content-Type':'application/json','X-Setup-Token':'${token}'},body:JSON.stringify({key:key.value.trim()})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Speichern fehlgeschlagen.');key.value='';status.textContent='Gespeichert. Öffne jetzt den Prototyp über den Link unten. Die KI-Verbindung kannst du dort mit einer Frage testen.';form.hidden=true;}catch(error){status.textContent=error.message||'Speichern fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.';button.disabled=false;}});</script></html>`);
      return;
    }
    if (req.method !== 'POST') return send(405, { error: 'Methode nicht erlaubt.' });
    if (req.headers.origin !== `http://${host}` || req.headers['x-setup-token'] !== token || req.headers['content-type'] !== 'application/json') return send(403, { error: 'Bitte die Einrichtungsseite neu laden und erneut versuchen.' });
    let temporary: string | undefined;
    try {
      const chunks: Buffer[] = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 2048) return send(413, { error: 'Eingabe zu lang.' }); chunks.push(Buffer.from(chunk)); }
      const input: unknown = JSON.parse(Buffer.concat(chunks).toString());
      const key = input && typeof input === 'object' && 'key' in input ? input.key : undefined;
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{16,256}$/.test(key)) return send(400, { error: 'Bitte den vollständigen API-Schlüssel ohne Leerzeichen einfügen.' });
      const path = join(directory, '.env.local');
      let existing = '';
      try { existing = await readFile(path, 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      const clean = existing.replace(/^\s*(?:export\s+)?MISTRAL_API_KEY\s*=.*$/gm, '').trimEnd();
      temporary = join(directory, `.assistant-key-${randomBytes(12).toString('hex')}.local`);
      await writeFile(temporary, `${clean}\nMISTRAL_API_KEY=${key}\n`, { mode: 0o600, flag: 'wx' });
      await rename(temporary, path); temporary = undefined; env.MISTRAL_API_KEY = key;
      send(200, { saved: true });
    } catch { send(500, { error: 'Der Schlüssel konnte nicht gespeichert werden. Bitte die Eingabe und den lokalen Server prüfen.' }); }
    finally { if (temporary) await unlink(temporary).catch(() => {}); }
  };
}
