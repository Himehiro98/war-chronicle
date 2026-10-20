import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { WARS } from '@/lib/wars';
import { TAG_LIST } from '@/lib/tags';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** 照合先はこのサイトに収録された戦争だけ（結果から必ず戦争ページへ飛べるように） */
const WAR_INDEX = WARS.map((w) => `${w.id}\t${w.name}\t${w.year}\t${(w.tags ?? []).join('・')}`).join('\n');
const WAR_NAME: Record<string, string> = Object.fromEntries(WARS.map((w) => [w.id, w.name]));

const SYSTEM_PROMPT = `あなたは戦争史の構造分析の専門家です。ユーザーが説明する現在の地政学的な状況について、下の「収録戦争リスト」の中から構造的に最も似ている戦争を3〜5件選んでください。
表面的な類似（同じ国・同じ地域）ではなく、構造パターンの共通性で判断してください。

構造パターン：${TAG_LIST.join('、')}

出力のルール：
- warId は必ず収録戦争リストの1列目にあるIDをそのまま使う
- score は構造的な類似度（0〜100の整数）
- matchedFactors は上の構造パターンから選ぶ
- reasoning は「なぜ似ているか」を日本語で2〜3文
- warningSign は「最も注意すべき類似点」を日本語で1文
- overallRisk は high / medium / low のいずれか
- summary は全体の分析を日本語で2〜3文。断定を避け、歴史的類似は将来を予言するものではないことを踏まえる

収録戦争リスト（ID・名前・開始年・構造パターン）：
${WAR_INDEX}`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          warId: { type: 'string', enum: WARS.map((w) => w.id) },
          score: { type: 'integer' },
          matchedFactors: { type: 'array', items: { type: 'string' } },
          reasoning: { type: 'string' },
          warningSign: { type: 'string' },
        },
        required: ['warId', 'score', 'matchedFactors', 'reasoning', 'warningSign'],
        additionalProperties: false,
      },
    },
    overallRisk: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
  },
  required: ['matches', 'overallRisk', 'summary'],
  additionalProperties: false,
};

type Result = {
  matches: { warId: string; score: number; matchedFactors: string[]; reasoning: string; warningSign: string }[];
  overallRisk: 'high' | 'medium' | 'low';
  summary: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situation } = body;

    if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
      return NextResponse.json({ error: '状況の説明を入力してください' }, { status: 400 });
    }
    if (situation.length > 5000) {
      return NextResponse.json({ error: '入力が長すぎます（5000文字以内）' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: `次の状況を分析し、構造的に似ている過去の戦争を挙げてください。\n\n${situation.trim()}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'この内容は分析できませんでした。表現を変えてお試しください' }, { status: 422 });
    }
    if (response.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: '分析結果が長くなりすぎました。もう一度お試しください' }, { status: 500 });
    }

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AIからの応答が取得できませんでした' }, { status: 500 });
    }

    let parsed: Result;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json({ error: 'AI応答の読み取りに失敗しました' }, { status: 500 });
    }

    // 念のため収録外のIDを除外し、名前はサイトのデータから付ける
    const matches = parsed.matches
      .filter((m) => WAR_NAME[m.warId])
      .map((m) => ({ ...m, score: Math.max(0, Math.min(100, Math.round(m.score))), warName: WAR_NAME[m.warId] }))
      .sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      return NextResponse.json({ error: '分析結果が不正な形式です' }, { status: 500 });
    }

    return NextResponse.json({ ...parsed, matches });
  } catch (error) {
    console.error('Diagnose API error:', error);
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください' }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'API認証エラーが発生しました' }, { status: 500 });
    }
    return NextResponse.json({ error: 'サーバーエラーが発生しました。もう一度お試しください' }, { status: 500 });
  }
}
