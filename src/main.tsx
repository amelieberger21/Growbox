import { RecipeListPage, RecipeDetailPage } from "./pages/RecipePages";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import "./styles/index.css";
import "./styles/experience.css";
import "@fontsource/vazirmatn/arabic-400.css";
import "@fontsource/vazirmatn/arabic-600.css";
import { ExperienceProvider } from "./experience/ExperienceProvider";
import { SpeechProvider } from "./experience/Speech";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { GrowboxProvider } from "./state/GrowboxProvider";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { MushroomLibraryPage } from "./pages/MushroomLibraryPage";
import { MushroomDetailPage } from "./pages/MushroomDetailPage";
import { GrowboxPage } from "./pages/GrowboxPage";
import { ClimatePage, GrowthPage } from "./pages/GrowthPage";
import { ProjectPage } from "./pages/ProjectPage";
import { NotFoundPage } from "./pages/NotFoundPage";
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/pilze", element: <MushroomLibraryPage /> },
      { path: "/pilze/:slug", element: <MushroomDetailPage /> },
      { path: "/pilze/:slug/rezepte", element: <RecipeListPage /> },
      { path: "/pilze/:slug/rezepte/:recipeId", element: <RecipeDetailPage /> },
      { path: "/growbox", element: <GrowboxPage /> },
      { path: "/wachstum", element: <GrowthPage /> },
      { path: "/wachstum/klima", element: <ClimatePage /> },
      { path: "/projekt", element: <ProjectPage /> },
      { path: "/einstellungen", element: <SettingsPage /> },
      { path: "/hilfe", element: <HelpPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GrowboxProvider>
      <ExperienceProvider>
        <SpeechProvider>
          <RouterProvider router={router} />
        </SpeechProvider>
      </ExperienceProvider>
    </GrowboxProvider>
  </StrictMode>,
);
