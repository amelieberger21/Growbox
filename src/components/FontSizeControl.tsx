import { useExperience } from '../experience/ExperienceProvider';
import { StepButtons } from './StepButtons';
import { useT } from '../i18n';

export function FontSizeControl({compact=false}:{compact?:boolean}) {
  const {experience,setPreferences}=useExperience();
  const tx=useT();
  const percent=Math.round(experience.preferences.fontScale*100);
  return <div className={`font-size-control ${compact?'compact-font-control':''}`}>
    <span>{tx('Schriftgröße')}</span>
    <StepButtons label="Schriftgröße" value={percent} min={100} max={250} step={5} unit="%" onChange={value=>setPreferences({fontScale:value/100})}/>
  </div>;
}
