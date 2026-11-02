import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assistantSetup } from '../../server/assistantSetup';
describe('Lokales Schlüsselfeld', () => {
  it('speichert nur mit lokalem Ursprung und Einrichtungstoken und gibt niemals den Schlüssel zurück', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'mycobox-setup-'));
    try {
      const env: Record<string,string> = {}; const middleware = assistantSetup(env, directory);
      async function call(method: string, body = '', headers: Record<string,string> = {}, address = '127.0.0.1') {
        const req = Object.assign(Readable.from([Buffer.from(body)]), { url: '/api/assistant/setup', method, headers: { host: '127.0.0.1:5173', ...headers }, socket: { remoteAddress: address } }) as unknown as IncomingMessage;
        const result = { status: 0, body: '' };
        const res = { writeHead(code: number) { result.status = code; }, end(text: string) { result.body = text; } } as unknown as ServerResponse;
        await middleware(req, res, () => {}); return result;
      }
      const page = await call('GET'); expect(page.status).toBe(200); expect(page.body).toContain('type="password"');
      const token = page.body.match(/'X-Setup-Token':'([a-f0-9]+)'/)?.[1]; expect(token).toBeTruthy();
      expect((await call('POST', '{}')).status).toBe(403);
      expect((await call('GET', '', {}, '192.0.2.1')).status).toBe(403);
      const headers = { origin: 'http://127.0.0.1:5173', 'x-setup-token': token!, 'content-type': 'application/json' };
      expect((await call('POST', JSON.stringify({key:'bad\nINJECT=true'}), headers)).status).toBe(400);
      const key = 'dummy_key_for_local_test_only';
      const saved = await call('POST', JSON.stringify({key}), headers); expect(saved.status).toBe(200); expect(saved.body).not.toContain(key);
      expect(env.MISTRAL_API_KEY).toBe(key); expect(await readFile(join(directory,'.env.local'),'utf8')).toContain(`MISTRAL_API_KEY=${key}`);
      expect((await stat(join(directory,'.env.local'))).mode & 0o777).toBe(0o600);
      expect((await call('GET')).body).not.toContain(key);
    } finally { await rm(directory,{recursive:true,force:true}); }
  });
});
