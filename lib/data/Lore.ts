export interface MonsterLore {
  id: string;
  name: string;
  type: string;
  biome: string;
  requiredLevel: number;
  visualPrompt: string;
  image: string; // 몬스터 이미지 경로
  backstory: string[];
  callToAction: string;
  position: { x: number; y: number };
}

export const MONSTERS: MonsterLore[] = [
  {
    id: "scarecrow",
    name: "훈련용 기계 허수아비",
    type: "튜토리얼",
    biome: "마에스트로의 훈련장",
    requiredLevel: 1,
    visualPrompt:
      "A wooden mechanical scarecrow with magical runes, designed for target practice.",
    image: "/monsters/scarecrow.png",
    backstory: [
      "자네의 첫 번째 훈련 상대일세.",
      "오래전에 만들어진 방음벽 허수아비지. 이 구조물들은 오직 강력한 음파에만 반응하도록 마법이 걸려 있어.",
      "숨을 크게 들이마시고, [닉네임]. 자네 안의 파동을 끌어올려 마음껏 소리쳐 보게!",
      "이 고철 덩어리를 산산조각 내버릴 수 있다면, 그건 자네가 진정으로 '마지막 메아리'라는 뜻일 터.",
    ],
    callToAction: "기합을 질러 허수아비를 파괴하라!",
    position: { x: 50, y: 50 },
  },
  {
    id: "slime",
    name: "비트 슬라임 (Beat Slime)",
    type: "기본 몬스터",
    biome: "The Verdant Whispers",
    requiredLevel: 1,
    visualPrompt:
      "Stylized 2D Fantasy Art of a cute bouncy blue training slime monster wearing tiny musical note accessories.",
    image: "/monsters/slime.png",
    backstory: [
      "속삭임의 숲 외곽에 서식하는 이 푸른 젤리 괴물은 사실 숲의 정령들이 뱉어낸 잘못된 음표 찌꺼기들입니다.",
      "소리를 좋아하며 리듬에 맞춰 통통 튀어다니는 습성이 있죠.",
      "하지만 너무 뭉쳐버리면 숲의 생태계를 파괴하는 불협화음을 만들어냅니다.",
    ],
    callToAction:
      "저 덩어리가 더 큰 잡음을 내기 전에, 네 목소리로 리듬을 산산조각 내야 해!",
    position: { x: 25, y: 25 },
  },
  {
    id: "golem",
    name: "설원의 수호병 (Frost Golem)",
    type: "고급 보스",
    biome: "The Bellowing Tundra",
    requiredLevel: 5,
    visualPrompt:
      "Stylized 2D Fantasy Art of a massive golem made of ice and snow with glowing cyan cracks shaped like soundwaves.",
    image: "/monsters/golem.png",
    backstory: [
      "과거 이 대륙의 가장 아름다운 음악을 연주하던 자들이 세운 얼음 제단의 파수꾼입니다.",
      "악의 세력에게 심장인 '선율의 돌'을 도둑맞은 뒤, 모든 소리를 얼려버리는 저주에 걸렸습니다.",
      "그의 근처에서는 그 어떤 작은 속삭임도 얼음으로 굳어버립니다.",
    ],
    callToAction:
      "너의 가장 폭발적인 목소리만이 녀석의 얼어붙은 귀를 뚫고 저주를 풀 수 있어!",
    position: { x: 50, y: 55 },
  },
  {
    id: "sea_serpent",
    name: "심연의 수룡 (Abyssal Leviathan)",
    type: "정예 몬스터",
    biome: "The Wailing Galleon",
    requiredLevel: 4,
    visualPrompt:
      "Stylized 2D Fantasy Art of a terrifying sea serpent rising from dark waters, scales glowing with cyan sonic energy.",
    image: "/monsters/sea-serpent.png",
    backstory: [
      "통곡의 갤리온 아래 깊은 물보라 속에 똬리를 틀고 있는 바다 괴수입니다.",
      "선원들의 절망적인 비명을 먹고 자라며, 이빨을 부딪혀 내는 마찰음은 배의 돛대를 꺾어버릴 만큼 강력합니다.",
    ],
    callToAction: "거대한 파도 소리보다 더 압도적인 파음을 내질러라!",
    position: { x: 40, y: 65 },
  },
  {
    id: "treant",
    name: "고목의 탄식 (Weeping Treant)",
    type: "정예 몬스터",
    biome: "The Verdant Whispers",
    requiredLevel: 2,
    visualPrompt:
      "Stylized 2D Fantasy Art of a withered ancient treant with glowing green eyes and bark forming the shape of a screaming face.",
    image: "/monsters/treant.png",
    backstory: [
      "속삭이는 신록에서 가장 오래된 고목이었으나, 불협화음의 오염에 삼켜져 괴물이 되었습니다.",
      "바람이 불 때마다 가지들이 부딪히며 소름 끼치는 피리 소리를 냅니다.",
    ],
    callToAction: "뒤틀린 나뭇가지 사이로 정화의 키워드를 꽂아 넣어라!",
    position: { x: 15, y: 35 },
  },
  {
    id: "frost_wyrm",
    name: "서리달 송곳니 (Frost Wyrm)",
    type: "정예 몬스터",
    biome: "The Bellowing Tundra",
    requiredLevel: 6,
    visualPrompt:
      "Stylized 2D Fantasy Art of an icy skeletal dragon roaring, with visible sonic breath freezing the air.",
    image: "/monsters/frost-wyrm.png",
    backstory: [
      "호령하는 설원의 영구동토에 잠들어 있던 빙룡입니다.",
      "이 녀석의 포효는 공기 중의 수분을 순식간에 얼려버려, 듣는 이의 성대마저 마비시킵니다.",
    ],
    callToAction: "얼어붙은 폐부를 뜨거운 샤우팅으로 녹여버려라!",
    position: { x: 85, y: 20 },
  },
  {
    id: "banshee",
    name: "늪지의 절규 (Swamp Banshee)",
    type: "중급 보스",
    biome: "The Muted Marshes",
    requiredLevel: 3,
    visualPrompt:
      "Stylized 2D Fantasy Art of a spectral banshee maiden hovering in a murky purple swamp.",
    image: "/monsters/banshee.png",
    backstory: [
      "묵음의 늪지대를 떠도는 이 유령은 살아생전 세계 최고의 오페라 가수였습니다.",
      "진흙탕 속에서 노래를 부를 수 없게 된 슬픔이 그녀를 끔찍한 괴물로 만들었죠.",
      "그녀가 뿜어내는 비명은 늪지의 독기를 퍼뜨립니다.",
    ],
    callToAction:
      "그녀의 슬픈 비명을 잠재워 줘. 가장 크고 웅장한 메아리로 영혼을 정화해라!",
    position: { x: 75, y: 30 },
  },
  {
    id: "dungeon_1",
    name: "심연의 융합체 (Abyssal Amalgamation)",
    type: "발음 던전",
    biome: "The Muted Marshes",
    requiredLevel: 2,
    visualPrompt: "Deep dark fantasy abyss with glowing ancient runes",
    image: "/monsters/dungeon.png",
    backstory: [
      "세상의 모든 억눌린 짐승들의 울음소리가 뒤섞여 태어난 최악의 괴물. 불분명하고 기괴한 소리만 냅니다.",
      "과거 고대의 마법사들이 침묵의 주문을 연구하던 지하 던전입니다.",
      "정확하고 또렷한 목소리만이 이 던전의 문을 열고 심연을 정화할 수 있습니다.",
    ],
    callToAction:
      "가장 정확하고 긴 주문으로 너의 발음이 얼마나 뚜렷한지 증명해 봐!",
    position: { x: 20, y: 80 },
  },
];
