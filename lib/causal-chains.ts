/**
 * 因果の大河「ドミノを辿る」
 *
 * 各戦争の causes / influences（因果ネットワーク）から、
 * 厳選した「読める一本道」を物語として再構成する。
 * すべて実在の因果エッジ（wars データの causes/influences）に基づく。
 *
 * 各ノード：warId と connector（次の戦争へ「なぜ繋がるか」の一文）。
 * 最後のノードには connector を置かない（=連鎖の終端）。
 */

export interface ChainNode {
  id: string;          // war ID
  connector?: string;  // 次のノードへ「なぜ繋がったか」（最終ノードは省略）
}

export interface CausalChain {
  id: string;
  title: string;
  thesis: string;      // この大河が示すこと（一言）
  emoji: string;
  accent: string;
  nodes: ChainNode[];
}

export const CAUSAL_CHAINS: CausalChain[] = [
  {
    id: 'modern-river',
    title: '革命と世界大戦の150年',
    thesis: '一つの革命が次の戦争を呼び、勝者の講和が次の大戦の火種になった——近代ヨーロッパは因果の連鎖そのものだった。',
    emoji: '🗽',
    accent: '#b91c1c',
    nodes: [
      { id: 'french-revolution', connector: '革命が生んだ国民軍と「自由の輸出」が、周辺の王政国家との全面戦争を不可避にした。' },
      { id: 'napoleonic-wars', connector: 'ナポレオンが各地に撒いたナショナリズムの種が、半世紀後に「国民国家の統一」運動として芽吹いた。' },
      { id: 'italian-unification', connector: '統一の過程で台頭したプロイセンが、ドイツ統一の総仕上げにフランスとの対決を選んだ。' },
      { id: 'franco-prussian-war', connector: 'ドイツ帝国の誕生とフランスの復讐心が、二大陣営の同盟対立を固定化した。' },
      { id: 'world-war-1', connector: '勝者が課したヴェルサイユ体制の屈辱と経済破綻が、次の独裁者を生む土壌になった。' },
      { id: 'world-war-2-europe', connector: '欧州での戦いがアジア・世界に波及し、戦後は米ソ二極の冷戦秩序へ再編された。' },
      { id: 'korean-war', connector: '冷戦が初めて熱戦になった「代理戦争」の型が、次のアジアの戦場へ受け継がれた。' },
      { id: 'vietnam-war' },
    ],
  },
  {
    id: 'middle-east-river',
    title: 'パレスチナの宿命',
    thesis: 'ホロコーストの罪悪感から生まれた建国が、75年に及ぶ戦争の連鎖を生んだ。一つの未解決が、次の戦争を呼び続ける。',
    emoji: '🕊️',
    accent: '#0891b2',
    nodes: [
      { id: 'world-war-2-europe', connector: 'ホロコーストへの罪悪感が国際社会をユダヤ人国家樹立へ動かし、現地住民との衝突が始まった。' },
      { id: 'first-arab-israeli-war', connector: 'イスラエルの勝利と70万人の難民化（ナクバ）が、アラブ諸国の報復の連鎖を起動した。' },
      { id: 'suez-crisis', connector: 'スエズでの英仏の退場とナセルの台頭が、アラブ・ナショナリズムを過熱させた。' },
      { id: 'six-day-war', connector: '6日間の占領（西岸・ガザ・ゴラン）が、「占領地」という今日まで続く問題を固定した。' },
      { id: 'yom-kippur-war', connector: '奇襲と石油危機を経た和平交渉もパレスチナ問題は積み残され、封じ込めが続いた。' },
      { id: 'gaza-war' },
    ],
  },
  {
    id: 'terror-river',
    title: '冷戦後の連鎖（対テロ戦争の大河）',
    thesis: '冷戦の一手が次の世代のテロを生み、その報復が中東全体を不安定化させ、ついに大国間競争へ回帰した。',
    emoji: '📡',
    accent: '#1d4ed8',
    nodes: [
      { id: 'soviet-afghan-war', connector: '米国が支援したムジャヒディンが、ソ連撤退後にタリバン・アルカイダの温床になった。' },
      { id: 'afghanistan-war', connector: '9.11への報復で始まった戦争が、「対テロ戦争」の論理を中東全域へ拡張した。' },
      { id: 'iraq-war', connector: '占領の失敗とスンニ派の排除が、ISISの台頭と地域の宗派対立を激化させた。' },
      { id: 'syrian-civil-war', connector: 'ロシアのアサド支援介入が、米露の代理対決を中東に持ち込み、大国間競争を再燃させた。' },
      { id: 'ukraine-war' },
    ],
  },
  {
    id: 'early-modern-river',
    title: '主権国家の産声（近世ヨーロッパの大河）',
    thesis: '小国の独立戦争が大宗教戦争へ拡大し、その終結が「主権国家」という近代の戦争の主体を生んだ。',
    emoji: '⚓',
    accent: '#6d28d9',
    nodes: [
      { id: 'dutch-revolt', connector: 'スペイン帝国への反乱が新旧両派の対立と結びつき、ヨーロッパ規模の宗教戦争へ拡大した。' },
      { id: 'thirty-years-war', connector: 'ドイツを荒廃させた戦争の終結（ウェストファリア条約）が、主権国家体制と次の継承戦争の枠組みを作った。' },
      { id: 'war-of-spanish-succession' },
    ],
  },
];
