import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { warName, years, theater } = await req.json();

  const prompt = `あなたは歴史学者です。「${warName}（${years}、${theater}）」について、以下のJSON形式で詳細な解説を生成してください。

必ず以下の形式のJSONのみ返してください（コードブロック不要）：

{
  "digest": {
    "background": "背景の説明（150字程度、HTMLのstrongタグ可）",
    "actors": "主要関係者と動機（150字程度、HTMLのstrongタグ可）",
    "structural": "構造的要因（150字程度）",
    "aftermath": "その後の連鎖（150字程度）"
  },
  "detail": {
    "title": "詳説タイトル",
    "kicker": "サブタイトル（年代・地域・執筆者情報）",
    "lead": "リード文（150字程度、印象的な一文から）",
    "sections": [
      { "heading": "セクション見出し1", "body": "本文（200字程度）" },
      { "heading": "セクション見出し2", "body": "本文（200字程度）" }
    ]
  },
  "perspectives": [
    { "flag": "🇺🇸", "nation": "国名（史観）", "text": "その国の歴史観（100字）", "wide": false },
    { "flag": "🇬🇧", "nation": "国名", "text": "その国の歴史観（100字）", "wide": false },
    { "flag": "🇫🇷", "nation": "国名", "text": "その国の歴史観（100字）", "wide": false },
    { "flag": "⚠️", "nation": "批判的視点", "text": "批判的史観（150字）", "wide": true }
  ],
  "structure": {
    "summary": "この戦争の構造的必然性の総括（100字）",
    "factors": [
      { "title": "第一の構造的要因", "body": "説明（100字）" },
      { "title": "第二の構造的要因", "body": "説明（100字）" },
      { "title": "第三の構造的要因", "body": "説明（100字）" }
    ]
  },
  "legacy": [
    { "label": "直接的連鎖", "color": "#8b3a1e", "text": "直接的な歴史的影響（100字）" },
    { "label": "中期的波及", "color": "#1a4a42", "text": "中期的な歴史的波及（100字）" },
    { "label": "長期的構造", "color": "#b8860b", "text": "長期的な構造的影響（100字）" }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
