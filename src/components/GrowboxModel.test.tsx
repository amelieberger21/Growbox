import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GrowboxModel } from './GrowboxModel';
import { createInitialState, CONFIG } from '../simulation/engine';

vi.mock('./growboxScene', () => ({
  mountGrowboxScene: vi.fn(async () => ({
    canOpen: true,
    dispose: vi.fn(),
    setCultivationPhase: vi.fn(),
    setTankPreview: vi.fn(),
    highlight: vi.fn(),
    animateCameraTo: vi.fn(),
    setCultivationMist: vi.fn(),
    setInspectionEnabled: vi.fn(),
  })),
}));

describe('Zuordnung der 3D-Lernansicht', () => {
  it('kennzeichnet Vorschauaktionen und lässt die gespeicherte Kultur unverändert', async () => {
    const before=JSON.stringify(createInitialState());
    localStorage.setItem(CONFIG.storageKey,before);
    const user=userEvent.setup();
    render(<GrowboxModel/>);
    expect(screen.getByRole('region',{name:'Growbox in 3D'})).toHaveAccessibleDescription(/unabhängig von der aktiven Kultur/);
    const growth=screen.getByRole('button',{name:'Wachstumsvorschau'});
    await waitFor(()=>expect(growth).toBeEnabled());
    await user.click(growth);
    await user.click(screen.getByRole('button',{name:'5. Ernte'}));
    await user.click(screen.getByRole('button',{name:'Nebelvorschau einschalten'}));
    expect(screen.getByRole('heading',{name:'Wachstumsvorschau · Champignons'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Nebelvorschau ausschalten'})).toHaveAttribute('aria-pressed','true');
    await user.click(screen.getByRole('button',{name:'Tankvorschau'}));
    expect(localStorage.getItem(CONFIG.storageKey)).toBe(before);
  });
});
