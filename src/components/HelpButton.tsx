import { useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { HELP, type HelpTopic } from '../data/help';
import { useT } from '../i18n';
import { Modal } from './ui';
export function HelpButton({topic}:{topic:HelpTopic}) {
  const tx=useT();const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);const id=useId(); const help=HELP[topic];
  const close=()=>{setOpen(false);queueMicrotask(()=>trigger.current?.focus());};
  return <><button ref={trigger} type="button" className="help-button" aria-label={`${tx('Hilfe')}: ${tx(help.title)}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(true)}><CircleHelp aria-hidden="true" size={24}/><span className="help-button-text">{tx('Hilfe')}</span></button>{open&&<Modal title={tx(help.title)} onClose={close} footer={<button className="button button-primary" onClick={close}>{tx('Verstanden')}</button>}><div id={id} className="context-help"><h3>{tx('Was bedeutet das?')}</h3><p>{tx(help.meaning)}</p><h3>{tx('So gehst du vor')}</h3><p>{tx(help.steps)}</p><h3>{tx('Grenzen und Hinweise')}</h3><p>{tx(help.limits)}</p><p className="verification-note">{tx('Diese Hilfe verändert keine Einstellungen. Alle Geräteverbindungen und Messwerte sind simuliert.')}</p></div></Modal>}</>;
}
