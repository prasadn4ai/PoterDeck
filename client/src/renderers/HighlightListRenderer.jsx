import React from 'react';
import { Star, Target, Zap, Shield, Award, TrendingUp, Users, Globe, Heart, CheckCircle } from 'lucide-react';

const ICON_MAP = { Star, Target, Zap, Shield, Award, TrendingUp, Users, Globe, Heart, CheckCircle };

export function HighlightListRenderer({ slide, typo, spacing, colors }) {
  const items = slide.items || [];
  const cols = items.length <= 3 ? items.length : items.length <= 4 ? 2 : 3;
  return (
    <div style={{ width: '100%', height: '100%', padding: spacing.outerPad, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: typo.headingSize, fontWeight: typo.headingWeight, color: colors.primary, marginBottom: spacing.gap }}>
        {slide.title}
      </h2>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', alignContent: 'center' }}>
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || CheckCircle;
          return (
            <div key={i} style={{
              background: colors.surface, borderRadius: '12px', padding: '20px',
              border: `1px solid ${colors.primary}15`,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${colors.primary}15`, color: colors.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
              }}>
                <Icon size={20} />
              </div>
              <div style={{ fontWeight: 600, fontSize: typo.bodySize, marginBottom: '6px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.5 }}>{item.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
