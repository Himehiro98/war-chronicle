import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a war history analyst. Given a current geopolitical situation, identify the 3-5 most structurally similar historical wars from your knowledge. Focus on structural patterns (structural tags), not superficial similarities.

When analyzing, consider these structural tags:
ナショナリズム, 経済危機, 安全保障ジレンマ, 資源争奪, 帝国衰退, 宗教対立, 革命, 情報戦・プロパガンダ, 同盟暴走, 核抑止, 冷戦構造, 植民地解放, 民族浄化, 権力真空, 誤算・誤認知, 指導者個人要因

Return valid JSON only, no markdown code blocks, no explanation outside the JSON. Use this exact format:
{
  "matches": [
    {
      "warId": "kebab-case-id",
      "warName": "戦争名（日本語）",
      "score": <integer 0-100>,
      "matchedFactors": ["タグ1", "タグ2", "タグ3"],
      "reasoning": "なぜこの戦争と似ているか（2-3文）",
      "warningSign": "最も注意すべき類似点（1文）"
    }
  ],
  "overallRisk": "high|medium|low",
  "summary": "全体的な分析（2-3文）"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situation } = body;

    if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
      return NextResponse.json(
        { error: '状況の説明を入力してください' },
        { status: 400 }
      );
    }

    if (situation.length > 5000) {
      return NextResponse.json(
        { error: '入力が長すぎます（5000文字以内）' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下の現在の地政学的状況を分析し、歴史上の戦争との構造的類似性を特定してください：\n\n${situation.trim()}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'AIからの応答が取得できませんでした' },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      // JSONのパースに失敗した場合、テキストからJSONを抽出を試みる
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: 'AI応答のパースに失敗しました' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'AI応答のパースに失敗しました' },
          { status: 500 }
        );
      }
    }

    // バリデーション
    if (!parsed.matches || !Array.isArray(parsed.matches) || parsed.matches.length === 0) {
      return NextResponse.json(
        { error: '分析結果が不正な形式です' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Diagnose API error:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API認証エラーが発生しました' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'リクエストが多すぎます。しばらく待ってから再試行してください' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
