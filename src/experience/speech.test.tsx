import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GrowboxProvider } from "../state/GrowboxProvider";
import { ExperienceProvider } from "./ExperienceProvider";
import { SpeechPanel, SpeechProvider } from "./Speech";
import { EXPERIENCE_KEY, initialExperience } from "./model";
import { createInitialState } from "../simulation/engine";
class FakeUtterance {
  constructor(public text: string) {}
  lang = "";
  rate = 1;
  voice = null;
  onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
  onend: ((event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
  onboundary: ((event: SpeechSynthesisEvent) => void) | null = null;
}
afterEach(() => vi.unstubAllGlobals());
function setup() {
  const state = initialExperience(createInitialState());
  state.preferences.readerEnabled = true;
  state.preferences.welcomeAnswered = true;
  localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(state));
  render(
    <GrowboxProvider>
      <ExperienceProvider>
        <SpeechProvider>
          <main>
            <p>Ein kurzer Text.</p>
          </main>
          <SpeechPanel />
        </SpeechProvider>
      </ExperienceProvider>
    </GrowboxProvider>,
  );
  return userEvent.setup();
}
describe("Vorlesefunktion", () => {
  it("startet, pausiert, setzt fort, markiert echte Wortgrenzen und stoppt", async () => {
    const synth = {
      speak: vi.fn((u: SpeechSynthesisUtterance) =>
        u.onstart?.(new Event("start") as SpeechSynthesisEvent),
      ),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: () => [],
    };
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", synth);
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      { width: 300, height: 30 },
    ] as unknown as DOMRectList);
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Vorlesen starten" }));
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utterance = synth.speak.mock.calls[0][0];
    expect(utterance.lang).toBe("de-DE");
    act(() =>
      utterance.onboundary?.({
        name: "word",
        charIndex: 0,
        charLength: 3,
      } as SpeechSynthesisEvent),
    );
    expect(document.querySelector(".speech-text mark")).toHaveTextContent(
      "Ein",
    );
    expect(document.querySelector("main p")).toHaveClass("speech-reading");
    await user.click(
      screen.getByRole("button", { name: "Vorlesen pausieren" }),
    );
    expect(synth.pause).toHaveBeenCalledOnce();
    await user.click(
      screen.getByRole("button", { name: "Vorlesen fortsetzen" }),
    );
    expect(synth.resume).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Vorlesen stoppen" }));
    expect(document.querySelector("main p")).not.toHaveClass("speech-reading");
    expect(document.querySelector(".speech-text mark")).toBeNull();
  });
  it("bietet bei fehlenden Wortgrenzen ehrlich die Abschnittsmarkierung an", async () => {
    const synth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: () => [],
    };
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", synth);
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      { width: 300, height: 30 },
    ] as unknown as DOMRectList);
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Vorlesen starten" }));
    expect(
      screen.getByText(
        "Abschnittsmarkierung: Diese Stimme liefert möglicherweise keine zuverlässigen Wortgrenzen.",
      ),
    ).toBeInTheDocument();
    expect(document.querySelector(".speech-text mark")).toBeNull();
  });
});
