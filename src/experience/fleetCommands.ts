import type { GrowboxDevice } from '../state/fleet';
import { findBoxes } from '../state/fleet';
import { tr, currentLocale } from '../i18n';
const normal=(s:string)=>s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function fleetCommand(text:string,boxes:GrowboxDevice[],selected:GrowboxDevice):{reply:string;selectBoxId?:string;navigate?:string}|null {
 const q=normal(text);
 const list=/welche|liste|auflist|list|which|quelles|quali|cuales|welke|ktore|ktere|hangi/.test(q)&&/box|boite|kweekkast/.test(q);
 if(list)return {reply:boxes.map(box=>`${box.name}, ${box.id}, ${box.location}: ${tr(box.connected?'Verbunden':'Offline')}${box.id===selected.id?`, ${tr('Ausgewählt')}`:''}.`).join(' ')};
 if(!/offne|zeig|wechsel|wahle|open|show|select|switch|ouvre|montre|choisi|abre|muestra|seleccion|apri|mostra|selezion|toon|selecteer|otworz|pokaz|wybierz|otevri|zobraz|vyber|ac |goster|sec /.test(q))return null;
 let matches=boxes.filter(box=>[box.id,box.name,box.location].some(v=>q.includes(normal(v))));
 if(!matches.length){const room=q.match(/(?:raum|room|piece|salle|stanza|sala|kamer|pokoj|mistnost|oda)\s+(\d+)/);if(room)matches=findBoxes(boxes,`Raum ${room[1]}`);}
 if(!matches.length)return null;
 if(matches.length>1)return {reply:`${tr('Mehrere Growboxen passen. Bitte nenne die eindeutige ID.')}: ${matches.map(b=>`${b.name} (${b.id}, ${b.location})`).join('; ')}.`};
 const box=matches[0];return {reply:`${tr('Growbox auswählen')}: ${box.name}, ${box.id}, ${box.location}. ${tr(box.connected?'Verbunden':'Offline')}.`,selectBoxId:box.id,navigate:'/growbox'};
}
export function boxContext(box:GrowboxDevice, boxes:GrowboxDevice[]) {
 return {selected:{id:box.id,name:box.name,location:box.location,connected:box.connected,hasData:box.hasData,lastSeen:box.lastSeen},boxes:boxes.map(b=>({id:b.id,name:b.name,location:b.location,connected:b.connected,hasData:b.hasData})),readingsAreCurrent:box.connected&&box.hasData};
}
export function offlineSummary(box:GrowboxDevice){return `${tr(box.hasData?'Offline: zuletzt bekannte Werte':'Keine Messdaten vorhanden')}. ${box.lastSeen!==null?`${tr('Letzter verfügbarer Datensatz')}: ${new Intl.DateTimeFormat(currentLocale(),{dateStyle:'medium',timeStyle:'short'}).format(box.lastSeen)}.`:''}`;}
