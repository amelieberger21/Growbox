import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { assistantMiddleware } from '../../server/assistant';
async function call(url: string, body: string, key = 'test-key', type = 'application/json', locale?: string) {
  const req = Object.assign(Readable.from([Buffer.from(body)]), { url, method: 'POST', headers: { host: '127.0.0.1:5173', origin: 'http://127.0.0.1:5173', 'content-type': type, ...(locale ? {'x-assistant-language':locale} : {}) } }) as unknown as IncomingMessage;
  const result = { status: 0, data: {} as Record<string, unknown> };
  const res = { writeHead(code: number) { result.status = code; }, end(data: string) { result.data = JSON.parse(data); } } as unknown as ServerResponse;
  await assistantMiddleware({ MISTRAL_API_KEY: key })(req, res, vi.fn()); return result;
}
afterEach(() => vi.unstubAllGlobals());
describe('Mistral-Serveranbindung', () => {
  it('sendet Chat und Systemkontext ausschließlich an Mistral und validiert die Navigation', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ reply: 'Ich öffne die Growbox.', language: 'de-DE', navigate: '/growbox', close: false }) } }] }) });
    vi.stubGlobal('fetch', fetcher);
    const result = await call('/api/assistant/chat', JSON.stringify({ messages: [{ role: 'user', content: 'Öffne die Growbox' }], context: { simulated: true } }));
    expect(result.status).toBe(200); expect(result.data.navigate).toBe('/growbox');
    expect(fetcher.mock.calls[0][0]).toBe('https://api.mistral.ai/v1/chat/completions');
    const body = JSON.parse(fetcher.mock.calls[0][1].body); expect(body.model).toBe('mistral-small-latest'); expect(body.messages[0].role).toBe('system');
    fetcher.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ reply: 'Extern', language: 'de', navigate: 'https://example.com', close: false }) } }] }) });
    expect((await call('/api/assistant/chat', JSON.stringify({ messages: [], context: {} }))).status).toBe(502);
  });
  it('sendet Audio an Voxtral mit automatischer Sprache und ohne OpenAI-Parameter', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ text: 'Hello', language: 'en' }) }); vi.stubGlobal('fetch', fetcher);
    expect((await call('/api/assistant/transcribe', 'test-audio', 'test-key', 'audio/webm')).data.text).toBe('Hello');
    const [url, options] = fetcher.mock.calls[0]; expect(url).toBe('https://api.mistral.ai/v1/audio/transcriptions');
    expect(options.body.get('model')).toBe('voxtral-mini-transcribe-3'); expect(options.body.get('language')).toBeNull(); expect(options.body.get('return_language')).toBe('true'); expect(options.body.get('response_format')).toBeNull();
  });
  it('zeigt fehlende Schlüssel und ausgeschöpftes Kontingent ohne Geheimnisse an', async () => {
    expect((await call('/api/assistant/chat', '{}', '')).status).toBe(503);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    const result = await call('/api/assistant/chat', JSON.stringify({ messages: [], context: {} })); expect(result.data.error).toContain('Nutzungslimit'); expect(JSON.stringify(result)).not.toContain('test-key');
  });
});

import { ASSISTANT_LANGUAGES } from './assistantLanguages';
it.each(ASSISTANT_LANGUAGES)('$name: bindet Voxtral und Antworten an die gewählte Sprache', async ({locale,code,name}) => {
  const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({text:'test',language:code})}).mockResolvedValueOnce({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reply:'test',language:'en-GB',navigate:'',close:false})}}]})});
  vi.stubGlobal('fetch',fetcher);
  await call('/api/assistant/transcribe','test-audio','test-key','audio/webm',locale);
  expect(fetcher.mock.calls[0][1].body.get('language')).toBe(code);
  const response=await call('/api/assistant/chat',JSON.stringify({messages:[{role:'user',content:'Temperature 23,5'}],language:locale,context:{}}),'test-key','application/json',locale);
  expect(response.data.language).toBe(locale);
  expect(JSON.parse(fetcher.mock.calls[1][1].body).messages[0].content).toContain(name);
});
