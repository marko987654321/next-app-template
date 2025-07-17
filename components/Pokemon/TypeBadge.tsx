'use client';

import { Badge, type BadgeProps } from '@mantine/core';
import { type PokemonType } from '../../types/pokemon';
import classes from './TypeBadge.module.css';

interface TypeBadgeProps extends Omit<BadgeProps, 'color' | 'children'> {
  /** Pokemon type object with name and color */
  type: PokemonType;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant */
  variant?: 'filled' | 'light' | 'outline' | 'transparent';
  /** Show type icon (if available) */
  showIcon?: boolean;
  /** Make the badge clickable */
  onClick?: (type: PokemonType) => void;
  /** Custom className */
  className?: string;
}

// Type icons mapping (you can expand this with actual icons later)
const TYPE_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  psychic: '🔮',
  ice: '❄️',
  dragon: '🐲',
  fairy: '🧚',
  fighting: '👊',
  poison: '☠️',
  ground: '🌍',
  flying: '🦅',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  steel: '🔩',
  dark: '🌙',
  normal: '⚪',
};

export function TypeBadge({
  type,
  size = 'md',
  variant = 'filled',
  showIcon = false,
  onClick,
  className,
  ...props
}: TypeBadgeProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(type);
    }
  };

  const typeIcon = TYPE_ICONS[type.name.toLowerCase()];
  const isClickable = !!onClick;

  return (
    <Badge
      size={size}
      variant={variant}
      style={{
        backgroundColor: variant === 'filled' ? type.color : undefined,
        borderColor: variant === 'outline' ? type.color : undefined,
        color: variant === 'filled' ? '#ffffff' : type.color,
        cursor: isClickable ? 'pointer' : undefined,
        textTransform: 'capitalize',
      }}
      className={`${className || ''} ${classes.typeBadge} ${isClickable ? classes.clickable : ''}`}
      onClick={isClickable ? handleClick : undefined}
      {...props}
    >
      {showIcon && typeIcon && (
        <span className={classes.icon}>{typeIcon}</span>
      )}
      {type.name}
    </Badge>
  );
}

// Predefined type badge variants for common use cases
export const SmallTypeBadge = ({ type, ...props }: Omit<TypeBadgeProps, 'size'>) => (
  <TypeBadge type={type} size="sm" {...props} />
);

export const LargeTypeBadge = ({ type, ...props }: Omit<TypeBadgeProps, 'size'>) => (
  <TypeBadge type={type} size="lg" {...props} />
);

export const OutlineTypeBadge = ({ type, ...props }: Omit<TypeBadgeProps, 'variant'>) => (
  <TypeBadge type={type} variant="outline" {...props} />
);

export const ClickableTypeBadge = ({ 
  type, 
  onTypeClick, 
  ...props 
}: Omit<TypeBadgeProps, 'onClick'> & { onTypeClick: (type: PokemonType) => void }) => (
  <TypeBadge type={type} onClick={onTypeClick} {...props} />
);

// Type effectiveness helpers (for future enhancement)
export const getTypeEffectiveness = (attackingType: string, defendingType: string): number => {
  // This is a simplified version - you can expand with the full type chart
  const typeChart: Record<string, Record<string, number>> = {
    fire: { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
    water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
    grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
    // Add more type effectiveness as needed
  };

  return typeChart[attackingType]?.[defendingType] ?? 1;
};

// Utility function to get contrasting text color
export const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}; 