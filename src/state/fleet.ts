import type { PersistedAppState } from '../types';
import { createInitialState, reducer, type Action } from '../simulation/engine';
import { isValidState, loadState } from './persistence';
export const FLEET_KEY = 'mycobox.fleet.v1';
export const BOX_IMAGES = ['/growboxes/counter.svg','/growboxes/shelf.svg','/growboxes/lab.svg'] as const;
export interface GrowboxDevice { id: string; name: string; location: string; image: string; connected: boolean; hasData: boolean; lastSeen: number | null; state: PersistedAppState }
export interface Fleet { version:1; selectedId:string; boxes:GrowboxDevice[] }
export type FleetAction = {type:'ENGINE'; action:Action} | {type:'SELECT'; id:string} | {type:'EDIT';id:string;name:string;location:string;image:string} | {type:'CONNECT';id:string;connected:boolean} | {type:'ADD';name:string;location:string;image:string};
export function initialFleet(state:PersistedAppState):Fleet {
  const second=reducer(createInitialState(),{type:'PREPARE',slug:'shiitake'});
  const third=reducer(createInitialState(),{type:'PREPARE',slug:'igelstachelbart'});
  return {version:1,selectedId:'GB-001',boxes:[
    {id:'GB-001',name:'Küchenbox',location:'Küche – Fensterbank',image:BOX_IMAGES[0],connected:true,hasData:true,lastSeen:state.reading.time,state},
    {id:'GB-002',name:'Pilzregal',location:'Raum 3 – Regal links',image:BOX_IMAGES[1],connected:false,hasData:true,lastSeen:second.reading.time,state:second},
    {id:'GB-003',name:'Laborbox',location:'Raum 3 – Arbeitstisch',image:BOX_IMAGES[2],connected:true,hasData:true,lastSeen:third.reading.time,state:third},
  ]};
}
export function isValidFleet(value:unknown):value is Fleet {
  if(!value||typeof value!=='object')return false;
  const f=value as Partial<Fleet>;
  return f.version===1 && typeof f.selectedId==='string' && Array.isArray(f.boxes) && f.boxes.length>0 && f.boxes.length<=100 && new Set(f.boxes.map(b=>b?.id)).size===f.boxes.length && f.boxes.some(b=>b?.id===f.selectedId) && f.boxes.every(b=>b && /^GB-[A-Z0-9-]+$/.test(b.id) && typeof b.name==='string' && b.name.trim().length>0 && b.name.length<=100 && typeof b.location==='string' && b.location.length<=160 && BOX_IMAGES.includes(b.image as typeof BOX_IMAGES[number]) && typeof b.connected==='boolean' && typeof b.hasData==='boolean' && (b.lastSeen===null || (Number.isFinite(b.lastSeen)&&Math.abs(b.lastSeen)<=8.64e15)) && isValidState(b.state));
}
export function loadFleet(storage:Pick<Storage,'getItem'>=localStorage):{fleet:Fleet;message:string} {
  try {
    const raw=storage.getItem(FLEET_KEY);
    if(raw) {const parsed:unknown=JSON.parse(raw); if(isValidFleet(parsed))return {fleet:parsed,message:''};
      return {fleet:initialFleet(loadState(storage).state),message:'Gespeicherte Growbox-Liste war ungültig. Der letzte gültige Einzelstand wurde übernommen.'};}
    const legacy=loadState(storage); return {fleet:initialFleet(legacy.state),message:legacy.message};
  }catch {return {fleet:initialFleet(loadState(storage).state),message:'Der lokale Speicher ist nicht verfügbar. Du kannst die Demo im Arbeitsspeicher verwenden.'};}
}
export function fleetReducer(fleet:Fleet,event:FleetAction):Fleet {
  if(event.type==='SELECT')return fleet.boxes.some(b=>b.id===event.id)?{...fleet,selectedId:event.id}:fleet;
  if(event.type==='ADD') {
    if(fleet.boxes.length>=100 || !event.name.trim() || !event.location.trim() || !BOX_IMAGES.includes(event.image as typeof BOX_IMAGES[number]))return fleet;
    let index=1;while(fleet.boxes.some(b=>b.id===`GB-${String(index).padStart(3,'0')}`))index++;
    const state=createInitialState();state.cycle=null;state.history=[];state.events=[];state.alerts=[];
    return {...fleet,boxes:[...fleet.boxes,{id:`GB-${String(index).padStart(3,'0')}`,name:event.name.trim().slice(0,100),location:event.location.trim().slice(0,160),image:event.image,connected:false,hasData:false,lastSeen:null,state}]};
  }
  return {...fleet,boxes:fleet.boxes.map(box=>{
    if(event.type==='EDIT'&&event.id===box.id){ if(!event.name.trim()||!event.location.trim()||!BOX_IMAGES.includes(event.image as typeof BOX_IMAGES[number]))return box; return {...box,name:event.name.trim().slice(0,100),location:event.location.trim().slice(0,160),image:event.image}; }
    if(event.type==='CONNECT'&&event.id===box.id)return {...box,connected:event.connected,hasData:box.hasData||event.connected,lastSeen:event.connected?Date.now():box.lastSeen};
    if(event.type!=='ENGINE'||!box.connected||!box.hasData||(event.action.type!=='TICK'&&box.id!==fleet.selectedId))return box;
    const state=reducer(box.state,event.action);return state===box.state?box:{...box,state,lastSeen:Date.now()};
  })};
}
export function findBoxes(boxes:GrowboxDevice[],query:string) {
  const normal=(s:string)=>s.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const q=normal(query);if(!q)return [];
  const exact=boxes.filter(b=>[b.id,b.name,b.location].some(v=>normal(v)===q));
  return exact.length?exact:boxes.filter(b=>[b.id,b.name,b.location].some(v=>normal(v).includes(q)));
}
