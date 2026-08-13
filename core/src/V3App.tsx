import React, { Suspense, lazy } from "react";
import { V3StoreProvider, useV3State } from "./contexts/V3Store";
import { CurriculumProvider } from "./contexts/CurriculumContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { PremiumLayout } from "./components/layout/PremiumLayout";
import { PremiumSidebar } from "./components/layout/PremiumSidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";

const V2DashboardBridge = lazy(() => import("./views/v2/V2DashboardBridge"));
const V2RoadmapBridge = lazy(() => import("./views/v2/V2RoadmapBridge"));
const V2PlaygroundBridge = lazy(() => import("./views/v2/V2PlaygroundBridge"));
const V2PracticeBridge = lazy(() => import("./views/v2/V2PracticeBridge"));
const V2MockTestBridge = lazy(() => import("./views/v2/V2MockTestBridge"));
const V2PuzzlesBridge = lazy(() => import("./views/v2/V2PuzzlesBridge"));
const V2DayDetailsBridge = lazy(() => import("./views/v2/V2DayDetailsBridge"));
const PremiumInteractiveLessonView = lazy(() => import("./views/PremiumInteractiveLessonView"));

function Router() {
  const state = useV3State();

  const renderView = () => {
    switch (state.activeView) {
      case "dashboard":
        return <V2DashboardBridge />;
      case "roadmap":
        return <V2RoadmapBridge />;
      case "playground":
        return <V2PlaygroundBridge />;
      case "practice":
        return <V2PracticeBridge />;
      case "puzzles":
        return <V2PuzzlesBridge />;
      case "mocks":
        return <V2MockTestBridge />;
      case "day-details":
        return <V2DayDetailsBridge />;
      case "interactive-lesson":
        return <PremiumInteractiveLessonView />;
      default:
        return <V2DashboardBridge />;
    }
  };

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: "100%",
            width: "100%",
            color: "var(--accent-cyan)",
          }}
        >
          Loading V3 Engine...
        </div>
      }
    >
      {renderView()}
    </Suspense>
  );
}

export default function V3App() {
  return (
    <ErrorBoundary fallbackTitle="SQL Academy V3 Platform">
      <ProgressProvider>
        <CurriculumProvider>
          <V3StoreProvider>
            <PremiumLayout sidebar={<PremiumSidebar />}>
              <Router />
            </PremiumLayout>
          </V3StoreProvider>
        </CurriculumProvider>
      </ProgressProvider>
    </ErrorBoundary>
  );
}
