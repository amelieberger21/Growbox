import { PHASES } from '../data/catalog';
import { useEffect, useId, useRef, useState } from 'react';
import { Box, Cpu, DoorClosed, Droplets, Monitor, RotateCcw } from 'lucide-react';
import { center, displayFrameName, housingColors, hotspots, overview } from './growboxModelConfig';
import type { mountGrowboxScene } from './growboxScene';
import { useT } from '../i18n';
import './growboxModel.css';

export function GrowboxModel() {
  // A prototype running inside its own display must not create another display.
  if (window.self !== window.top && window.name === displayFrameName) return null;
  return <GrowboxModelPanel />;
}

function GrowboxModelPanel() {
  const tx = useT();
  const [productView, setProductView] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [cultivationPhase, setCultivationPhase] = useState<number | null>(null);
  const [mistOn, setMistOn] = useState(false);
  const [tankFilled, setTankFilled] = useState(false);
  const [displayOn, setDisplayOn] = useState(false);
  const title = useId();
  const host = useRef<HTMLDivElement>(null);
  const markerLayer = useRef<HTMLDivElement>(null);
  const scene = useRef<Awaited<ReturnType<typeof mountGrowboxScene>>>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [canOpen, setCanOpen] = useState(false);
  const [sensorMode, setSensorMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const target = host.current;
    const markers = Array.from(markerLayer.current?.querySelectorAll('button') ?? []);
    if (!target) return;
    void import('./growboxScene')
      .then(({ mountGrowboxScene }) => mountGrowboxScene(target, markers, controller.signal, focusComponent))
      .then(view => {
        if (controller.signal.aborted) return view.dispose();
        scene.current = view;
        setCanOpen(view.canOpen);
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error');
      });
    return () => {
      controller.abort();
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  function toggleCultivation() {
    const phase = cultivationPhase === null ? 0 : null;
    setCultivationPhase(phase);
    scene.current?.setCultivationPhase(phase);
    setMistOn(false);
    scene.current?.setTankPreview(phase !== null || tankFilled);
    clearSelection();
    if (phase !== null) {
      scene.current?.animateCameraTo([0.39, 0.25, 0.44], [0.22, 0.12, -0.13]);
    }
  }

  function toggleTankPreview() {
    scene.current?.setTankPreview(!tankFilled || cultivationPhase !== null);
    setTankFilled(!tankFilled);
    if (!tankFilled) focusComponent(1);
  }

  function toggleDisplay() {
    scene.current?.setDisplay(!displayOn);
    setDisplayOn(!displayOn);
    if (!displayOn) {
      clearSelection();
      scene.current?.animateCameraTo(hotspots[7].camera, hotspots[7].point);
    }
  }

  function focusComponent(index: number) {
    setProductView(false);
    scene.current?.setInspectionEnabled(true);
    const { camera, point } = hotspots[index];
    setSelected(index);
    scene.current?.highlight(index);
    scene.current?.animateCameraTo(camera, point);
  }

  function clearSelection() {
    setSelected(null);
    scene.current?.highlight(null);
  }

  return (
    <section className="panel growbox-model" aria-labelledby={title} aria-describedby={`${title}-preview`}>
      <h2 id={title}><Box aria-hidden="true" /> {tx('Growbox in 3D')}</h2>
      <div className="growbox-preview-note" id={`${title}-preview`}>
        <strong>{tx('Lernansicht · unabhängig von der aktiven Kultur')}</strong>
        <p>{tx('Tank, Nebel und Wachstumsphasen dieser Lernansicht sind unabhängig von der aktiven Kultur. Das 3D-Wachstum zeigt beispielhaft Champignons.')}</p>
      </div>
      <p>{tx('Ziehe zum Drehen, nutze die rechte Maustaste zum Schwenken und scrolle zum Zoomen. Auf Touchscreens schwenkst und zoomst du mit zwei Fingern.')}</p>
      <div className="growbox-model-stage">
        <div ref={host} className="growbox-model-canvas" />
        <div className="growbox-color-picker" hidden={productView} role="group" aria-label={tx('Gehäusefarbe')}>
          {housingColors.map(({ label, hex }, index) => (
            <button key={label} type="button" aria-label={tx(label)} title={tx(label)}
              aria-pressed={colorIndex === index} disabled={status !== 'ready'}
              style={{ backgroundColor: hex }} onClick={() => {
                scene.current?.setHousingColor(hex);
                setColorIndex(index);
              }} />
          ))}
        </div>
        <div ref={markerLayer} className="growbox-model-markers" hidden={status !== 'ready' || productView}>
          {hotspots.map(({ label }, index) => (
            <button key={label} type="button" aria-label={tx(label)} aria-pressed={selected === index}
              onClick={() => focusComponent(index)} title={tx(label)}>{index + 1}</button>
          ))}
        </div>
        {status !== 'ready' && <p className="growbox-model-status" role="status">{tx(status === 'loading'
          ? 'Das 3D-Modell wird geladen …'
          : 'Die 3D-Ansicht konnte nicht geladen werden. Die Bauteilbeschreibungen sind unten verfügbar.')}</p>}
        {!productView && selected !== null && <aside className="growbox-model-info" aria-live="polite">
          <strong>{tx(hotspots[selected].label)}</strong>
          <p>{tx(hotspots[selected].description)}</p>
          {sensorMode && (selected === 0 || selected === 3) && <img
            className="growbox-sensor-reference"
            src={import.meta.env.BASE_URL + 'models/klimasensor-referenz.png'}
            alt={tx('Beispiel einer Platine für Temperatur und Luftfeuchtigkeit mit vier Anschlusspins')}
          />}
          {selected === 1 && tankFilled && <p>{tx('Vorschau: Der Tank ist teilweise gefüllt.')}</p>}
          {selected === 7 && <button type="button" className="button button-outline" disabled={status !== 'ready'} onClick={toggleDisplay}>{tx(displayOn ? 'Bildschirm ausschalten' : 'Bildschirm einschalten')}</button>}
          {selected === 6 && <p><a href="https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/2-seven-stages-of-cultivation/" target="_blank" rel="noreferrer">Cornell Small Farms</a></p>}
          <button type="button" className="button button-outline" onClick={clearSelection}>{tx('Infokarte schließen')}</button>
        </aside>}
      </div>
      <div className="growbox-model-actions">
        <button type="button" className={productView ? 'button button-primary' : 'button button-outline'}
          aria-pressed={productView} disabled={status !== 'ready'} onClick={() => {
            const enabled = !productView;
            setProductView(enabled);
            scene.current?.setInspectionEnabled(!enabled);
            clearSelection();
          }} aria-label={tx(productView ? 'Bauteilmarkierungen anzeigen' : 'Produktansicht')} title={tx(productView ? 'Bauteilmarkierungen anzeigen' : 'Produktansicht')}><Box aria-hidden="true" /> {tx(productView ? 'Bauteilmarkierungen anzeigen' : 'Produktansicht')}</button>
        <button type="button" className="button button-outline" disabled={status !== 'ready'} onClick={toggleDisplay} aria-label={tx(displayOn ? 'Bildschirm ausschalten' : 'Bildschirm einschalten')} title={tx(displayOn ? 'Bildschirm ausschalten' : 'Bildschirm einschalten')}>
          <Monitor aria-hidden="true" /> {tx(displayOn ? 'Bildschirm ausschalten' : 'Bildschirm einschalten')}
        </button>
        <button type="button" className="button button-outline" aria-pressed={cultivationPhase !== null}
          disabled={status !== 'ready'} onClick={toggleCultivation} aria-label={tx('Wachstumsvorschau')} title={tx('Wachstumsvorschau')}>
          {tx('Wachstumsvorschau')}
        </button>
        <button type="button" className="button button-outline" aria-pressed={tankFilled}
          disabled={status !== 'ready'} onClick={toggleTankPreview} aria-label={tx('Tankvorschau')} title={tx('Tankvorschau')}>
          <Droplets aria-hidden="true" /> {tx('Tankvorschau')}
        </button>
        <button type="button" className={sensorMode ? 'button button-primary' : 'button button-outline'}
          aria-pressed={sensorMode} disabled={status !== 'ready'} onClick={() => {
            scene.current?.setSensorMode(!sensorMode);
            setSensorMode(!sensorMode);
          }} aria-label={tx('Sensoransicht')} title={tx('Sensoransicht')}><Cpu aria-hidden="true" /> {tx('Sensoransicht')}</button>
        <button type="button" className="button button-primary" disabled={!canOpen} onClick={() => {
          scene.current?.setDoor(!open);
          setOpen(!open);
        }} aria-label={tx(open ? 'Tür schließen' : 'Tür öffnen')} title={tx(open ? 'Tür schließen' : 'Tür öffnen')}><DoorClosed aria-hidden="true" /> {tx(open ? 'Tür schließen' : 'Tür öffnen')}</button>
        <button type="button" className="button button-outline" disabled={status !== 'ready'} onClick={() => {
          scene.current?.animateCameraTo(overview, center);
          clearSelection();
        }} aria-label={tx('Ansicht zurücksetzen')} title={tx('Ansicht zurücksetzen')}><RotateCcw aria-hidden="true" /> {tx('Ansicht zurücksetzen')}</button>
      </div>
      {cultivationPhase !== null && <section className="growbox-cultivation-controls" aria-label={tx('Wachstum im 3D-Modell')}>
        <h3>{tx('Wachstumsvorschau · Champignons')}</h3>
        <p>{tx('LED-Beleuchtung eingeschaltet · Der Zuchtbereich wird sanft ausgeleuchtet.')}</p>
        <p>{tx('Die weißen Fäden im Substrat sind das Myzel. Wähle eine Phase, um zu sehen, wie sich das Pilzgeflecht und die Fruchtkörper entwickeln.')}</p>
        <div className="growbox-model-actions">
          {PHASES.map((phase, index) => <button key={phase.name} type="button"
            className={cultivationPhase === index ? 'button button-primary' : 'button button-outline'}
            aria-pressed={cultivationPhase === index} onClick={() => {
              setCultivationPhase(index);
              scene.current?.setCultivationPhase(index);
            }}>{index + 1}. {tx(phase.short)}</button>)}
        </div>
        <p aria-live="polite">{tx(PHASES[cultivationPhase].description)}</p>
        <button type="button" className="button button-outline" aria-pressed={mistOn} onClick={() => {
          scene.current?.setCultivationMist(!mistOn);
          setMistOn(!mistOn);
        }} aria-label={tx(mistOn ? 'Nebelvorschau ausschalten' : 'Nebelvorschau einschalten')} title={tx(mistOn ? 'Nebelvorschau ausschalten' : 'Nebelvorschau einschalten')}><Droplets aria-hidden="true" /> {tx(mistOn ? 'Nebelvorschau ausschalten' : 'Nebelvorschau einschalten')}</button>
      </section>}
      {!productView && sensorMode && <p>{tx('Die Sensoransicht zeigt Temperatur, Luftfeuchtigkeit, CO₂ sowie die Substratsonde (9), den Schwimmschalter (10) und das optionale Partikelmodul (11). Die Bauformen und Einbaupositionen sind Beispiele für die Hardwareplanung.')}</p>}
      {!productView && <><p>{tx('Die Markierungen erklären die Bauteile. Einige zeigen beispielhafte Einbaupositionen.')}</p>
      <div className="growbox-model-actions">
        {hotspots.map(({ label }, index) => (
          <button key={label} type="button" className="button button-outline" aria-pressed={selected === index}
            onClick={() => focusComponent(index)}>{index + 1}. {tx(label)}</button>
        ))}
      </div></>}
    </section>
  );
}
