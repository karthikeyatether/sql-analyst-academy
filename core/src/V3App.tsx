import React, { Suspense, lazy } from "react";
import { V3StoreProvider, useV3State } from "./contexts/V3Store";
import { CurriculumProvider } from "./contexts/CurriculumContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { PremiumLayout } from "./components/layout/PremiumLayout";
import { PremiumSidebar } from "./components/layout/PremiumSidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy-load premium views
const InteractiveRoadmapView = lazy(
  () => import("./views/InteractiveRoadmapView"),
);
const PremiumPlaygroundView = lazy(
  () => import("./views/PremiumPlaygroundView"),
);
const PremiumPracticeView = lazy(() => import("./views/PremiumPracticeView"));
const PremiumMockTestView = lazy(() => import("./views/PremiumMockTestView"));
const PremiumPuzzlesView = lazy(() => import("./views/PremiumPuzzlesView"));

function Router() {
  const state = useV3State();

  const renderView = () => {
    switch (state.activeView) {
      case "roadmap":
        return <InteractiveRoadmapView />;
      case "playground":
        return <PremiumPlaygroundView />;
      case "practice":
        return <PremiumPracticeView />;
      case "puzzles":
        return <PremiumPuzzlesView />;
      case "mocks":
        return <PremiumMockTestView />;
      default:
        return <InteractiveRoadmapView />;
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
