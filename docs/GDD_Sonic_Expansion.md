# SHOUT! : Sonic Expansion Game Design Document (GDD)

**Version:** 1.0 (Phase 8 Design Proposal)
**Author:** Senior Game Architect & Creative Director
**Date:** 2026-02-22

---

## 📌 1. Vision & Core Philosophy

현재 *SHOUT!*의 코어 루프는 "탐색(Map) ➔ 적 조우(Combat) ➔ 음성/음량 공격(Resonance) ➔ 보상(EXP)"으로 구성되어 있습니다. 플레이어의 마이크(Voice)라는 특수 입력 장치를 200% 활용하기 위해, 단순한 사냥(Hunt)을 넘어선 **수집(Collection)과 생존/도전(Survival/Time-Attack) 콘텐츠**를 추가하여 게임의 볼륨과 리텐션을 극대화합니다.

---

## 🔮 Idea 1: "The Resonant Echoes" (음향의 파편 수집 시스템)

### Concept

오랜 침묵으로 인해 산산조각 난 '세계의 처음 소리' 들이 각 생태계(Biome) 곳곳에 왜곡된 잔향으로 남아 있습니다. 플레이어는 특정 지역에서 특수한 파음(키워드)을 발사하여 숨겨진 **음향의 파편(Sound Fragments)**을 획득할 수 있습니다.

### Gameplay Loop

1. **수집(Collection):** 각 던전이나 맵 노드 클리어 시 낮은 확률로 '음향의 파편(예: _신록의 속삭임 속성 파편_)' 드롭.
2. **해독(Decoding):** 마도서(Grimoire) 메뉴에 신설된 [공명석(Resonance Stone)] 탭에서 모은 파편 조각들을 조합.
3. **영구적 보상(Perk System):**
   - _로어 해금 (Lore Unlock):_ 과거 달의 노래를 부르던 자들의 비하인드 스토리 스크롤 오픈.
   - _패시브 스탯 (Stat Boost):_ "마이크 기초 감도 +5% 상승(Base dB 요구치 감소)", "원초적 메아리(Echo) 타격 배수 1.5x -> 1.7x 증가" 등 영구 버프 획득.

---

## ⏳ Idea 2: "Trial of the Voice" (목소리의 시련: 타임어택 서바이벌 모드)

### Concept

자신의 한계를 시험하는 엔드 콘텐츠(End-game Content). 적과 싸우는 것이 아니라, 고대의 봉인(Sacred Seal)을 풀기 위해 **정해진 시간 내에 요구되는 패턴의 소리를 빠르고 정확하게 완성**해야 합니다.

### Core Mechanics (The 3 Trials)

- **1. 지속의 시련 (Trial of Sustain):**
  - 목표: 마이크 입력값을 60dB 이상으로 **연속 5초 동안 유지**하기.
  - UI: 게이지가 60dB 밑으로 떨어지면 타이머가 초기화되는 텐션 높은 애니메이션 구현.
- **2. 속사의 시련 (Trial of Sequence):**
  - 목표: 랜덤하게 노출되는 5개의 키워드(예: "진동 가르기", "소닉 펀치" 등)를 10초 안에 순서대로 정확히 영창하기.
  - UI: 리듬 게임의 노트처럼 키워드가 흘러가고, 정확히 인식될 때마다 다음 태그로 넘어감.
- **3. 한계 돌파 (Zenith Break):**
  - 목표: 단 한 번의 외침으로 90dB(절대 공명) 선을 돌파하여 봉인석을 깨뜨림.

### Technical Implementation Blueprint (JSON Data & Logic)

**Data Structure (JSON):**

```json
{
  "trials": [
    {
      "id": "trial_sustain_1",
      "type": "SUSTAIN",
      "name": "지속의 시련 (초급)",
      "targetDb": 60,
      "durationSeconds": 5,
      "description": "5초간 60dB 이상의 성량을 일정하게 유지하십시오."
    },
    {
      "id": "trial_sequence_1",
      "type": "SEQUENCE",
      "name": "속사의 시련 (중급)",
      "sequence": ["스매시", "에코 킥", "진동 가르기"],
      "timeLimitSeconds": 15,
      "description": "제시된 키워드를 순서대로 15초 안에 정확히 영창하십시오."
    }
  ]
}
```

**React Component Pseudocode (`components/VoiceTrial.tsx`):**

```tsx
import { useState, useEffect } from "react";
import { useVoiceCombat } from "@/hooks/useVoiceCombat";

export default function VoiceTrial({ trialData }) {
  const { currentDb, attackWord, isListening, startListening } = useVoiceCombat(
    "commoner",
    30,
  );
  const [progress, setProgress] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    // Sustain Logic Example
    if (trialData.type === "SUSTAIN" && isListening) {
      if (currentDb >= trialData.targetDb) {
        setProgress((prev) => prev + 100 / (trialData.durationSeconds * 10)); // Assuming 100ms interval updates
        if (progress >= 100) handleTrialSuccess();
      } else {
        // Reset or apply penalty if tone drops
        setProgress(Math.max(0, progress - 5));
      }
    }
  }, [currentDb, isListening]);

  return (
    <div className="trial-container">
      <h2>{trialData.name}</h2>
      <p>{trialData.description}</p>

      {/* Visual Feedback for Voice Sustain */}
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill bg-amber-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isListening && <button onClick={startListening}>시련 시작</button>}
    </div>
  );
}
```

---

## 🎯 Summary Action Plan

결론적으로 "Trial of the Voice"를 우선 도입하여 유저들에게 피지컬(성대)적인 도전 목표를 제공하고, 이후 "The Resonant Echoes" 수집 모델을 도입해 장기적인 플레이 동기를 부여하는 방향이 가장 훌륭한 게임 디자인 솔루션으로 평가됩니다.
