import React from 'react';
import { Key, Server } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useUiStore } from '../../store/uiStore';

export function APIModeBadge() {
  const apiMode = useUiStore((s) => s.apiMode);
  return (
    <Badge color={apiMode === 'byok' ? 'primary' : 'default'}>
      {apiMode === 'byok' ? <Key size={12} /> : <Server size={12} />}
      {apiMode === 'byok' ? 'Using Your Key' : 'System AI'}
    </Badge>
  );
}
