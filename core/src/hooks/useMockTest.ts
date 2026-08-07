import { useState, useEffect, useRef } from "react";
import { PracticeProblem } from "../data/curriculum";

export type MockTestState = {
  company: string;
  questions: PracticeProblem[];
  currentIndex: number;
  answers: { query: string; isCorrect: boolean }[];
  timeRemaining: number;
  isActive: boolean;
};

export function useMockTest(
  activeView: string,
  finishMockTestCallback: (test: MockTestState) => void
) {
  const [mockTest, setMockTest] = useState<MockTestState | null>(null);
  const [mockReviewIndex, setMockReviewIndex] = useState(0);
  const isMockFinishingRef = useRef(false);

  useEffect(() => {
    if (activeView === "mock-runner" && mockTest?.isActive) {
      const timerId = setInterval(() => {
        setMockTest((prev) =>
          prev && prev.timeRemaining > 0
            ? { ...prev, timeRemaining: prev.timeRemaining - 1 }
            : prev,
        );
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [activeView, mockTest?.isActive]);

  useEffect(() => {
    if (
      activeView === "mock-runner" &&
      mockTest?.isActive &&
      mockTest.timeRemaining <= 0
    ) {
      finishMockTestCallback(mockTest);
    }
  }, [activeView, mockTest?.isActive, mockTest?.timeRemaining, finishMockTestCallback]);

  return {
    mockTest,
    setMockTest,
    mockReviewIndex,
    setMockReviewIndex,
    isMockFinishingRef,
  };
}
