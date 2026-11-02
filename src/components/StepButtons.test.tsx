import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StepButtons } from './StepButtons';
function Control({min,max,step}:{min:number;max:number;step:number}) { const [value,set]=useState(min); return <><input aria-label="Testslider" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/><StepButtons label="Messwert" value={value} min={min} max={max} step={step} onChange={set}/></>; }
describe('Schrittbedienung',()=>{
  it.each([{min:5,max:40,step:.5},{min:30,max:100,step:1},{min:350,max:3500,step:50}])('beachtet Grenzen und Schrittweite $step der Demo-Messwerte',async props=>{
    const user=userEvent.setup();render(<Control {...props}/>);
    const minus=screen.getByRole('button',{name:/Verringern/}),plus=screen.getByRole('button',{name:/Erhöhen/}),slider=screen.getByRole('slider');
    expect(minus).toBeDisabled();plus.focus();await user.keyboard('{Enter}');expect(slider).toHaveValue(String(props.min+props.step));
    fireEvent.change(slider,{target:{value:String(props.max)}});expect(plus).toBeDisabled();
    await user.click(minus);expect(slider).toHaveValue(String(props.max-props.step));
  });
});
