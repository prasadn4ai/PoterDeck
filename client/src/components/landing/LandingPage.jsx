import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Activity, Briefcase, Rocket, RefreshCw, Layout, Sparkles, ArrowRight, Shield, Settings } from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { useUiStore } from '../../store/uiStore';
import { useDeckStore } from '../../store/deckStore';
import { recommendDecks, getRecommendedStyle, getRecommendedColor } from '../../engine/intentEngine';

const DECK_TYPES = [
  { id: 'q_report',       label: 'Quarterly Report',      icon: BarChart3,  description: 'Full quarterly business report with financials, KPIs and outlook', slides: 30 },
  { id: 'sales_pitch',    label: 'Sales Pitch',           icon: TrendingUp, description: 'Compelling sales deck with problem-solution narrative', slides: 12 },
  { id: 'monthly_kpi',    label: 'Monthly KPI Report',    icon: Activity,   description: 'Operations dashboard with KPIs, trends and action items', slides: 10 },
  { id: 'board_update',   label: 'Board Update',          icon: Briefcase,  description: 'Executive board update with strategic priorities', slides: 14 },
  { id: 'product_launch', label: 'Product Launch',        icon: Rocket,     description: 'Product launch deck with roadmap and go-to-market', slides: 14 },
  { id: 'qbr',            label: 'QBR',                   icon: RefreshCw,  description: 'Customer-facing quarterly business review', slides: 14 },
  { id: 'portfolio',      label: 'Portfolio / Capability', icon: Layout,     description: 'Company portfolio with credentials and case studies', slides: 12 },
];

const MIN_INTENT_LENGTH = 10;

export function LandingPage() {
  const [intent, setIntent] = useState('');
  const [showAllDecks, setShowAllDecks] = useState(false);

  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const setDeckType = useDeckStore((s) => s.setDeckType);
  const setStoreIntent = useDeckStore((s) => s.setIntent);
  const setStyle = useDeckStore((s) => s.setStyle);
  const setColorTheme = useDeckStore((s) => s.setColorTheme);
  const user = useDeckStore((s) => s.user);

  const recommendations = useMemo(() => recommendDecks(intent), [intent]);
  const intentValid = intent.trim().length >= MIN_INTENT_LENGTH;

  const handleSelectDeck = (deckId) => {
    if (!intentValid) return;
    setStoreIntent(intent.trim());
    setDeckType(deckId);
    setStyle(getRecommendedStyle(deckId));
    setColorTheme(getRecommendedColor(deckId));
    setAppPhase('style-select');
  };

  const recommendedIds = new Set(recommendations);
  const displayedDecks = showAllDecks ? DECK_TYPES : DECK_TYPES.filter((d) => recommendedIds.has(d.id));
  const hasRecommendations = recommendations.length > 0;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-4) var(--space-8)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
          PoterDeck
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Badge color="default">
            <Shield size={12} /> Data is masked before AI
          </Badge>
          {user && (
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {user.email}
            </span>
          )}
          <button onClick={() => setAppPhase('settings')} aria-label="Settings"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'var(--space-16) var(--space-8)',
        maxWidth: '900px', margin: '0 auto', width: '100%',
      }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, lineHeight: 1.2, marginBottom: 'var(--space-4)' }}>
            Describe your presentation.
            <br />
            <span style={{ color: 'var(--color-primary)' }}>AI builds it for you.</span>
          </h2>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            From intent to finished deck in 10-15 minutes. McKinsey-quality slides, zero manual editing.
          </p>
        </div>

        {/* Intent Input */}
        <div style={{ width: '100%', maxWidth: '700px', marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'flex', gap: 'var(--space-3)',
            padding: 'var(--space-2)',
            background: 'var(--color-surface)',
            border: '2px solid ' + (intentValid ? 'var(--color-primary)' : 'var(--color-border)'),
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'var(--transition-base)',
          }}>
            <Sparkles size={20} style={{ margin: 'auto var(--space-2)', color: 'var(--color-primary)', flexShrink: 0 }} />
            <input
              type="text"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="e.g., Q1 2025 board report for our SaaS company..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.75rem 0', fontSize: 'var(--font-size-lg)',
                background: 'transparent', color: 'var(--color-text)',
              }}
            />
          </div>
          {intent.length > 0 && !intentValid && (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
              Please describe your presentation in at least {MIN_INTENT_LENGTH} characters.
            </p>
          )}
        </div>

        {/* Deck Recommendations */}
        {intentValid && (
          <div style={{ width: '100%', maxWidth: '700px' }}>
            {hasRecommendations && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Recommended deck types for your intent:
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {(hasRecommendations ? displayedDecks : DECK_TYPES).map((deck) => {
                const Icon = deck.icon;
                const isRecommended = recommendedIds.has(deck.id);
                return (
                  <button
                    key={deck.id}
                    onClick={() => handleSelectDeck(deck.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: 'var(--space-5)', gap: 'var(--space-3)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      transition: 'var(--transition-fast)', textAlign: 'left',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {isRecommended && (
                      <Badge color="primary" style={{ position: 'absolute', top: '-8px', right: '8px' }}>
                        Recommended
                      </Badge>
                    )}
                    <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{deck.label}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {deck.slides} slides
                      </div>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {deck.description}
                    </p>
                    <ArrowRight size={16} style={{ color: 'var(--color-primary)', marginTop: 'auto' }} />
                  </button>
                );
              })}
            </div>

            {hasRecommendations && !showAllDecks && (
              <button
                onClick={() => setShowAllDecks(true)}
                style={{
                  display: 'block', margin: 'var(--space-6) auto 0',
                  background: 'none', border: 'none', color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                View all 7 deck types
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!intentValid && (
          <div style={{
            textAlign: 'center', padding: 'var(--space-12)',
            color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
          }}>
            <p>Start typing to see deck type recommendations.</p>
            <p style={{ marginTop: 'var(--space-2)' }}>
              7 master deck types available: Quarterly Report, Sales Pitch, Monthly KPI, Board Update, Product Launch, QBR, Portfolio
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
