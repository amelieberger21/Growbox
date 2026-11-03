import { MushroomGallery } from "../components/MushroomGallery";
import { EXPERIENCE_KEY } from "../experience/model";
import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter,RouterProvider} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import {GrowboxProvider} from '../state/GrowboxProvider';
import {ExperienceProvider} from '../experience/ExperienceProvider';
import {SpeechProvider} from '../experience/Speech';
import {Layout} from '../components/Layout';
import {DashboardPage} from './DashboardPage';
import {GrowboxPage} from './GrowboxPage';
import {SettingsPage} from './SettingsPage';
import {MushroomFacts,SafetyNotice} from '../components/MushroomFacts';
import {createInitialState,CONFIG} from '../simulation/engine';
import {entries} from '../data/catalog';
function setup(path='/growbox'){const router=createMemoryRouter([{element:<Layout/>,children:[{path:'/',element:<DashboardPage/>},{path:'/growbox',element:<GrowboxPage/>},{path:'/einstellungen',element:<SettingsPage/>}]}],{initialEntries:[path]});return {...render(<GrowboxProvider><ExperienceProvider><SpeechProvider><RouterProvider router={router}/></SpeechProvider></ExperienceProvider></GrowboxProvider>),user:userEvent.setup()};}
describe('Gezielte Überarbeitung',()=>{
 it('schlägt die Einführung zu Sitzungsbeginn vor und lässt unverändert fortfahren',async()=>{sessionStorage.removeItem('mycobox.tutorial.offered');const first=setup();expect(screen.getByRole('dialog')).toHaveTextContent('Möchtest du eine kurze Einführung?');await first.user.click(screen.getByRole('button',{name:'Ohne Tutorial fortfahren'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();const before=JSON.parse(localStorage.getItem(CONFIG.storageKey)!);first.unmount();setup();expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(JSON.parse(localStorage.getItem(CONFIG.storageKey)!).cycle).toEqual(before.cycle);});
 it('blendet Navigation aus und öffnet sie mit sinnvoller Fokusführung wieder',async()=>{const {user}=setup();await user.click(screen.getByRole('button',{name:'Navigation ausblenden'}));const button=screen.getByRole('button',{name:'Menü öffnen'});expect(button).toHaveFocus();expect(screen.getByLabelText('Hauptnavigation')).toHaveAttribute('inert');await user.click(button);expect(screen.getByLabelText('Hauptnavigation')).not.toHaveAttribute('inert');expect(screen.getByRole('link',{name:'MycoBox Dashboard'})).toHaveFocus();});
 it('ordnet das bestehende Kulturbild vor den Informationen an und erhält seinen Pfad',()=>{const {container}=setup('/');const art=container.querySelector('.culture-hero > .hero-art')!;const text=container.querySelector('.culture-hero-content')!;expect(art.compareDocumentPosition(text)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();expect(art.querySelector('img')?.getAttribute('src')).toBeTruthy();expect(container.querySelector('.champ-entry')).toContainElement(screen.getByRole('button',{name:/Mit Champ sprechen/}));});
 it('schließt ein Klimabanner ohne die Abweichung zu beseitigen',async()=>{const state=createInitialState();state.reading.co2=2200;localStorage.setItem(CONFIG.storageKey,JSON.stringify(state));const {user}=setup();await user.click(screen.getByRole('button',{name:'Meldung schließen: CO₂'}));expect(screen.getByRole('button',{name:'Hinweise wieder anzeigen'})).toBeInTheDocument();expect(JSON.parse(localStorage.getItem(CONFIG.storageKey)!).reading.co2).toBe(2200);await user.click(screen.getByRole('button',{name:'Hinweise wieder anzeigen'}));expect(screen.getByRole('button',{name:'Meldung schließen: CO₂'})).toBeInTheDocument();});
 it('blendet Benachrichtigungen aus ohne sie als gelesen zu markieren oder den Tank zu verändern',async()=>{const state=createInitialState();state.water.level=0;localStorage.setItem(CONFIG.storageKey,JSON.stringify(state));const {user}=setup();await user.click(screen.getByRole('button',{name:/Benachrichtigungen \(/}));const dialog=screen.getByRole('dialog');const close=within(dialog).getByRole('button',{name:/Benachrichtigung ausblenden: Tank leer/});await user.click(close);expect(within(dialog).getByRole('button',{name:'Ausgeblendete Meldungen anzeigen'})).toBeInTheDocument();expect(JSON.parse(localStorage.getItem(CONFIG.storageKey)!).water.level).toBe(0);await user.click(within(dialog).getByRole('button',{name:'Ausgeblendete Meldungen anzeigen'}));expect(within(dialog).getByRole('button',{name:/Benachrichtigung ausblenden: Tank leer/})).toBeInTheDocument();expect(within(dialog).getByRole('button',{name:'Als gelesen markieren'})).not.toBeDisabled();});
});
describe('Nachvollziehbare Pilzinformationen',()=>{
 it('zeigt Champignonwerte mit Rohbezug und eindeutig beschrifteten verfügbaren Kohlenhydraten',()=>{render(<MushroomFacts entry={entries.find(e=>e.slug==='weisser-champignon')!}/>);const table=screen.getByRole('table');expect(table).toHaveTextContent('17');expect(table).toHaveTextContent('Verfügbare Kohlenhydrate');expect(screen.getByRole('link',{name:/Matvaretabellen/})).toHaveAttribute('href','https://matvaretabellen.mattilsynet.io/en/mushroom-common-raw/');});
 it('überträgt keine Zahlen auf eine Art ohne Datensatz',()=>{render(<MushroomFacts entry={entries.find(e=>e.slug==='igelstachelbart')!}/>);expect(screen.queryByRole('table')).not.toBeInTheDocument();expect(screen.getByText(/noch keine verlässlich zugeordneten Nährwertzahlen/)).toBeInTheDocument();});
 it('zeigt für Enoki automatisch die passende Rohverzehrwarnung',()=>{render(<SafetyNotice entry={entries.find(e=>e.slug==='enoki')!}/>);expect(screen.getByText(/Enoki vollständig durchgaren/)).toBeInTheDocument();expect(screen.queryByText(/Kulturchampignons kann Rohverzehr/)).not.toBeInTheDocument();});
});

describe('Größere Schrift und Bildergalerie',()=>{
 it('speichert 250 Prozent, erhält sie beim Neustart und begrenzt weitere Vergrößerung',async()=>{
  const first=setup('/einstellungen');
  await first.user.click(screen.getByRole('button',{name:'250 %'}));
  expect(JSON.parse(localStorage.getItem(EXPERIENCE_KEY)!).preferences.fontScale).toBe(2.5);
  expect(screen.getAllByRole('button',{name:/Schriftgröße: Erhöhen/}).every(button=>(button as HTMLButtonElement).disabled)).toBe(true);
  first.unmount();
  const next=setup('/');
  expect(document.documentElement.style.getPropertyValue('--user-font-scale')).toBe('2.5');
  await next.user.click(screen.getByRole('button',{name:/Schriftgröße: Verringern/}));
  expect(JSON.parse(localStorage.getItem(EXPERIENCE_KEY)!).preferences.fontScale).toBe(2.45);
 });
 it('zeigt nur unterschiedliche Fotos, ohne wiederholte Ausschnitte oder Vorschauduplikate',()=>{
  const {container}=render(<MushroomGallery entry={entries.find(e=>e.slug==='weisser-champignon')!}/>);
  const paths=[...container.querySelectorAll('img')].map(image=>image.getAttribute('src'));
  expect(paths).toHaveLength(2);expect(new Set(paths).size).toBe(2);
  expect(screen.queryByText(/Detailausschnitt/)).not.toBeInTheDocument();
 });
});
