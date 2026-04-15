import React from 'react';

const variants = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
  },
  danger: {
    background: 'var(--color-error)',
    color: '#fff',
    border: 'none',
  },
};

const sizes = {
  sm: { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-sm)' },
  md: { padding: '0.625rem 1.25rem', fontSize: 'var(--font-size-base)' },
  lg: { padding: '0.875rem 1.75rem', fontSize: 'var(--font-size-lg)' },
};

export function Button({
  children, variant = 'primary', size = 'md', disabled = false,
  fullWidth = false, onClick, style: styleProp, ...rest
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        ...s,
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        lineHeight: 1.4,
        ...styleProp,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
