import { render, screen, within, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CommunityPage } from "./CommunityPage";
import { COMMUNITY_KEY, readPosts, preparePhoto } from "../community/storage";
import { CULTIVATION_GUIDES } from "../data/cultivationGuides";
import { entries } from "../data/catalog";
import { ConditionsPanel } from "../experience/Monitoring";

describe("Community", () => {
  it("zeigt fünf gekennzeichnete Beispiele, darunter zwei anonyme und zwei Bilder", () => {
    render(<CommunityPage/>);
    const posts = screen.getAllByRole("article");
    expect(posts).toHaveLength(5);
    expect(screen.getAllByRole("heading", {name:"Anonym"})).toHaveLength(2);
    expect(screen.getAllByText("Beispielbeitrag")).toHaveLength(5);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Braune Champignons schmecken besonders gut klein geschnitten auf Baguette")).toBeVisible();
  });
  it("speichert Beiträge anonym oder mit Namen, übersteht Remount und löscht eigene Beiträge", async () => {
    const user = userEvent.setup();
    const view = render(<CommunityPage/>);
    await user.type(screen.getByLabelText("Deine Erfahrung oder dein Tipp"), "Mein erster Testbeitrag");
    await user.click(screen.getByRole("button", {name:"Beitrag lokal speichern"}));
    expect(await screen.findByText("Dein Beitrag wurde lokal gespeichert.")).toBeVisible();
    expect(readPosts()[0].name).toBe("");
    view.unmount(); render(<CommunityPage/>);
    expect(screen.getByText("Mein erster Testbeitrag")).toBeVisible();
    await user.type(screen.getByLabelText("Name · optional"), "Amelie");
    await user.type(screen.getByLabelText("Deine Erfahrung oder dein Tipp"), "Ein zweiter Tipp");
    await user.click(screen.getByRole("button", {name:"Beitrag lokal speichern"}));
    expect(await screen.findByRole("heading", {name:"Amelie"})).toBeVisible();
    expect(readPosts()).toHaveLength(2);
    await user.click(within(screen.getAllByRole("article")[0]).getByRole("button",{name:"Eigenen Beitrag löschen"}));
    expect(readPosts()).toHaveLength(1);
    expect(screen.queryByText("Ein zweiter Tipp")).not.toBeInTheDocument();
  });
  it("behält bei Speicherfehlern den Entwurf und behauptet keine erfolgreiche Speicherung", async () => {
    render(<CommunityPage/>);
    fireEvent.change(screen.getByLabelText("Deine Erfahrung oder dein Tipp"), {target:{value:"Entwurf bleibt"}});
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {throw new Error("quota");});
    try {
      fireEvent.submit(screen.getByRole("button",{name:"Beitrag lokal speichern"}).closest("form")!);
      expect(await screen.findByRole("alert")).toHaveTextContent("Entwurf bleibt erhalten");
      expect(screen.getByLabelText("Deine Erfahrung oder dein Tipp")).toHaveValue("Entwurf bleibt");
      expect(screen.getAllByRole("article")).toHaveLength(5);
    } finally {spy.mockRestore();}
  });
  it("weist ungültige Uploads zurück und lädt keine fremden Bild-URLs aus gespeichertem Inhalt", async () => {
    await expect(preparePhoto(new File(["html"], "fake.html", {type:"text/html"}))).rejects.toThrow();
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify([{id:"bad", name:"X", text:"X", createdAt:new Date().toISOString(), images:["https://example.com/track.jpg"]}]));
    expect(readPosts()).toEqual([]);
    render(<CommunityPage/>);
    fireEvent.change(screen.getByLabelText("Bilder hinzufügen · optional"), {target:{files:[new File(["html"], "fake.html", {type:"text/html"})]}});
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("JPEG, PNG oder WebP"));
  });
});
describe("Recherchierte Kulturangaben", () => {
  it.each(entries)("zeigt für $name Temperatur, Feuchte und die konkrete Quelle unabhängig von einer Demo-Phase", entry => {
    const guide = CULTIVATION_GUIDES[entry.speciesId];
    expect(guide).toBeDefined();
    expect(guide.fruiting.temperature[0]).toBeLessThanOrEqual(guide.fruiting.temperature[1]);
    expect(guide.fruiting.humidity[0]).toBeGreaterThan(0);
    expect(guide.fruiting.humidity[1]).toBeLessThanOrEqual(100);
    render(<ConditionsPanel entry={entry}/>);
    expect(screen.queryByText("Nicht verifiziert")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href",guide.source.url);
    expect(screen.getByText(/% RH$/)).toBeVisible();
  });
});
