'use client';

import { useCallback, useEffect, useState } from 'react';

/** 読み上げ・Claudeに質問・リンクコピー */
export default function WarActions({ name, period, theater, speakText }: {
  name: string;
  period: string;
  theater: string;
  speakText: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [copied, setCopied] = useState<'link' | 'claude' | null>(null);

  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const toggleSpeak = useCallback(() => {
    if (!canSpeak) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(speakText);
    utter.lang = 'ja-JP';
    utter.rate = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  }, [canSpeak, speaking, speakText]);

  const flash = (k: 'link' | 'claude') => {
    setCopied(k);
    setTimeout(() => setCopied(null), 2500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      flash('link');
    } catch { /* noop */ }
  };

  const askClaude = async () => {
    const template = `「${name}」（${period}、${theater}）について質問します。\n質問：`;
    try { await navigator.clipboard.writeText(template); } catch { /* noop */ }
    flash('claude');
    window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="war-actions">
      {canSpeak && (
        <button type="button" className="btn btn--ghost-dark btn--sm" onClick={toggleSpeak} aria-pressed={speaking}>
          {speaking ? '■ 読み上げを停止' : '▶ 概要を読み上げ'}
        </button>
      )}
      <button type="button" className="btn btn--ghost-dark btn--sm" onClick={copyLink}>
        {copied === 'link' ? 'コピーしました' : 'リンクをコピー'}
      </button>
      <button type="button" className="btn btn--ghost-dark btn--sm" onClick={askClaude} title="質問の書き出しをコピーして Claude を開きます">
        {copied === 'claude' ? '質問文をコピーしました' : 'Claudeに質問する'}
      </button>
    </div>
  );
}
