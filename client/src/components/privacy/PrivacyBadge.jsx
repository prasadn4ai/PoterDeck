import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useDeckStore } from '../../store/deckStore';
import { getMaskCount } from '../../services/apiService';

export function PrivacyBadge() {
  const sessionId = useDeckStore((s) => s.sessionId);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (sessionId) {
      getMaskCount(sessionId).then((d) => setCount(d.maskedCount)).catch(() => {});
    }
  }, [sessionId]);

  if (!count) return null;
  return (
    <Badge color="default">
      <Shield size={12} /> {count} fields masked
    </Badge>
  );
}
