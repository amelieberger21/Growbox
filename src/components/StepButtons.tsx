import { Minus, Plus } from 'lucide-react';
import { useT, currentLocale } from '../i18n';
export function StepButtons({ label, value, min, max, step, unit = '', disabled = false, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string; disabled?: boolean; onChange: (value: number) => void;
}) {
  const tx = useT();
  const current = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const adjust = (direction: number) => onChange(Number(Math.min(max, Math.max(min, current + direction * step)).toFixed(6)));
  const number = new Intl.NumberFormat(currentLocale(), { maximumFractionDigits: 2 }).format(current);
  return <div className="step-buttons" role="group" aria-label={tx(label)}>
    <button type="button" disabled={disabled || current <= min} onClick={() => adjust(-1)} aria-label={`${tx(label)}: ${tx('Verringern')} (${step} ${unit})`}><Minus size={22} aria-hidden="true" /><span className="sr-only">−</span></button>
    <output aria-live="polite" aria-atomic="true">{number} {unit}</output>
    <button type="button" disabled={disabled || current >= max} onClick={() => adjust(1)} aria-label={`${tx(label)}: ${tx('Erhöhen')} (${step} ${unit})`}><Plus size={22} aria-hidden="true" /><span className="sr-only">+</span></button>
  </div>;
}
