export type TrialType = "SUSTAIN" | "SEQUENCE" | "ZENITH";

export interface TrialData {
  id: string;
  type: TrialType;
  name: string;
  description: string;
  requiredLevel: number;
  rewardExp: number;

  // For SUSTAIN trials
  targetDb?: number;
  durationSeconds?: number;

  // For SEQUENCE trials
  sequence?: string[];
  timeLimitSeconds?: number;
}

export const TRIALS: TrialData[] = [
  {
    id: "trial_sustain_1",
    type: "SUSTAIN",
    name: "지속의 시련 (초급)",
    description:
      "5초 동안 마이크의 성량을 60dB 이상으로 일정하게 유지하십시오.",
    requiredLevel: 2,
    rewardExp: 200,
    targetDb: 60,
    durationSeconds: 5,
  },
  {
    id: "trial_sequence_1",
    type: "SEQUENCE",
    name: "속사의 시련 (중급)",
    description:
      "제시된 3개의 키워드를 순서대로 15초 안에 빠르고 정확하게 영창하십시오.",
    requiredLevel: 4,
    rewardExp: 350,
    sequence: ["스매시", "에코 킥", "파음격"],
    timeLimitSeconds: 15,
  },
  {
    id: "trial_zenith_1",
    type: "ZENITH",
    name: "한계 돌파 (고급)",
    description:
      "단 한 번의 외침으로 85dB 이상의 거대한 진동을 발생시켜 봉인을 깨뜨리십시오.",
    requiredLevel: 6,
    rewardExp: 500,
    targetDb: 85,
  },
];
