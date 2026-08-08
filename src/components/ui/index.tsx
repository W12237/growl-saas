'use client';

import React from 'react';

// ============================================================
// Button Component — Growl Design System
// ============================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[#B6FF2E] text-[#0A0A0A] font-extrabold
    hover:bg-[#a8ef28] active:bg-[#9ade22]
    shadow-[0_0_25px_rgba(182,255,46,0.35)]
    hover:shadow-[0_0_35px_rgba(182,255,46,0.5)]
    border border-white/20
  `,
  secondary: `
    bg-[#664893] text-white font-bold
    hover:bg-[#7a58a8] active:bg-[#5a3f82]
    shadow-[0_0_20px_rgba(102,72,147,0.25)]
    hover:shadow-[0_0_30px_rgba(102,72,147,0.4)]
    border border-white/10
  `,
  ghost: `
    bg-transparent text-white/70 font-medium
    hover:bg-white/5 hover:text-white
    active:bg-white/10
  `,
  outline: `
    bg-transparent text-white font-bold
    border border-white/15 hover:border-white/30
    hover:bg-white/5 active:bg-white/10
  `,
  danger: `
    bg-[#F87171]/15 text-[#F87171] font-bold
    border border-[#F87171]/20
    hover:bg-[#F87171]/25 hover:border-[#F87171]/40
    active:bg-[#F87171]/30
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-sm rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-out
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
    </button>
  );
}

// ============================================================
// Input Component
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-white/80 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-white/[0.04] border border-white/10 rounded-xl
            px-4 py-2.5 text-sm text-white placeholder:text-white/25
            transition-all duration-200
            focus:outline-none focus:border-[#B6FF2E]/50 focus:ring-1 focus:ring-[#B6FF2E]/25
            focus:bg-white/[0.06]
            hover:border-white/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-[#F87171]/50 focus:border-[#F87171]/70 focus:ring-[#F87171]/25' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-[#F87171]">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-white/30">{hint}</p>}
    </div>
  );
}

// ============================================================
// Card Component — Glassmorphism
// ============================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'lime' | 'purple' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  hover = false,
  glow = 'none',
  padding = 'md',
  onClick,
  style,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-white/[0.06] bg-white/[0.02]
        backdrop-blur-xl
        ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-lg cursor-pointer' : ''}
        ${glow === 'lime' ? 'hover:shadow-[0_0_30px_rgba(182,255,46,0.1)]' : ''}
        ${glow === 'purple' ? 'hover:shadow-[0_0_30px_rgba(102,72,147,0.15)]' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      {children}
    </div>
  );
}

// ============================================================
// Badge Component
// ============================================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'lime' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70 border-white/10',
  success: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/20',
  warning: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/20',
  error: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/20',
  info: 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/20',
  lime: 'bg-[#B6FF2E]/15 text-[#B6FF2E] border-[#B6FF2E]/20',
  purple: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/20',
};

export function Badge({ children, variant = 'default', size = 'sm', dot = false, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border rounded-full
      ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
      ${badgeVariants[variant]}
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-[#34D399]' :
          variant === 'warning' ? 'bg-[#FBBF24]' :
          variant === 'error' ? 'bg-[#F87171]' :
          variant === 'info' ? 'bg-[#60A5FA]' :
          variant === 'lime' ? 'bg-[#B6FF2E]' :
          variant === 'purple' ? 'bg-[#8B5CF6]' :
          'bg-white/50'
        }`} />
      )}
      {children}
    </span>
  );
}

// ============================================================
// Avatar Component
// ============================================================

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const statusColors = {
  online: 'bg-[#34D399]',
  offline: 'bg-white/30',
  busy: 'bg-[#F87171]',
  away: 'bg-[#FBBF24]',
};

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    'from-[#B6FF2E]/30 to-[#664893]/30',
    'from-[#8B5CF6]/30 to-[#B6FF2E]/30',
    'from-[#664893]/40 to-[#8B5CF6]/30',
    'from-[#D0FA2C]/30 to-[#664893]/30',
  ];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img src={src} alt={name} className={`${avatarSizes[size]} rounded-full object-cover border border-white/10`} />
      ) : (
        <div className={`
          ${avatarSizes[size]} rounded-full border border-white/10
          bg-gradient-to-br ${colors[colorIndex]}
          flex items-center justify-center font-bold text-white/90
        `}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`
          absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#0A0A0A]
          ${statusColors[status]}
          ${size === 'xs' || size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
        `} />
      )}
    </div>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5
        bg-[length:200%_100%]
        ${variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded-md' : 'rounded-xl'}
        ${variant === 'text' && !height ? 'h-4' : ''}
        ${className}
      `}
      style={{
        width: width,
        height: height,
        animation: 'shimmer 2s ease-in-out infinite',
      }}
    />
  );
}

// ============================================================
// Modal / Dialog
// ============================================================

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const isModalOpen = open ?? isOpen ?? false;
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fade-in 200ms ease-out' }}
      />
      <div
        className={`
          relative w-full ${modalSizes[size]}
          bg-[#161616] border border-white/10 rounded-2xl
          shadow-[0_25px_60px_rgba(0,0,0,0.5)]
          overflow-hidden
        `}
        style={{ animation: 'scale-in 200ms ease-out' }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// Tabs Component
// ============================================================

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }
          `}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#B6FF2E]/20 text-[#B6FF2E] text-[10px] font-bold px-1">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Tooltip Component
// ============================================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const posStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div className={`
        absolute ${posStyles[position]} z-50
        px-2.5 py-1.5 text-xs font-medium text-white
        bg-[#1E1E1E] border border-white/10 rounded-lg
        opacity-0 group-hover:opacity-100 pointer-events-none
        transition-opacity duration-150 whitespace-nowrap
        shadow-lg
      `}>
        {content}
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#664893]/10 border border-[#664893]/20 flex items-center justify-center text-[#8B5CF6] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
