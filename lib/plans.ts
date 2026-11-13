export const plans = [
  {
    id: "tier-1",
    name: "Tier 1",
    capital: 1500,
    days: 30,
    tasks: [
      { id: "task-1", name: "Task 1", amount: 200 },
      { id: "task-2", name: "Task 2", amount: 200 },
    ],
    dailyTaskFigure: 400,
    projectedValue: 12000,
  },
  {
    id: "popular",
    name: "Popular",
    capital: 3000,
    days: 30,
    tasks: [
      { id: "task-1", name: "Task 1", amount: 300 },
      { id: "task-2", name: "Task 2", amount: 300 },
    ],
    dailyTaskFigure: 600,
    projectedValue: 18000,
  },
  {
    id: "tier-3",
    name: "Tier 3",
    capital: 6000,
    days: 30,
    tasks: [
      { id: "task-1", name: "Task 1", amount: 450 },
      { id: "task-2", name: "Task 2", amount: 450 },
    ],
    dailyTaskFigure: 900,
    projectedValue: 27000,
  },
  {
    id: "tier-4",
    name: "Tier 4",
    capital: 9000,
    days: 30,
    tasks: [
      { id: "task-1", name: "Task 1", amount: 650 },
      { id: "task-2", name: "Task 2", amount: 650 },
    ],
    dailyTaskFigure: 1300,
    projectedValue: 39000,
  },
  {
    id: "premier",
    name: "Premier",
    capital: 12000,
    days: 30,
    tasks: [
      { id: "task-1", name: "Task 1", amount: 850 },
      { id: "task-2", name: "Task 2", amount: 850 },
    ],
    dailyTaskFigure: 1700,
    projectedValue: 51000,
  },
] as const;

export const planDisclosure =
  "Draft terms pending legal, regulatory and actuarial approval. No projected value or task figure is a guaranteed return.";
