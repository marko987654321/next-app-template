'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';
import type { LoaderProps } from '@mantine/core';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: LoaderProps['size'];
  /** Color of the spinner */
  color?: string;
  /** Loading message to display */
  message?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Minimum height when centered */
  minHeight?: number | string;
  /** Custom className */
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'blue',
  message = 'Loading...',
  centered = true,
  minHeight = 200,
  className
}: LoadingSpinnerProps) {
  const spinner = (
    <Stack align="center" gap="md">
      <Loader size={size} color={color} />
      {message && (
        <Text size="sm" c="dimmed" ta="center">
          {message}
        </Text>
      )}
    </Stack>
  );

  if (centered) {
    return (
      <Center h={minHeight} className={className}>
        {spinner}
      </Center>
    );
  }

  return <div className={className}>{spinner}</div>;
}

// Predefined variants for common use cases
export const PokemonLoadingSpinner = () => (
  <LoadingSpinner
    message="Loading Pokémon..."
    color="var(--mantine-color-blue-6)"
    size="lg"
  />
);

export const SearchLoadingSpinner = () => (
  <LoadingSpinner
    message="Searching..."
    color="var(--mantine-color-grape-6)"
    size="md"
    centered={false}
  />
);

export const PageLoadingSpinner = () => (
  <LoadingSpinner
    message="Loading page..."
    size="xl"
    minHeight="60vh"
  />
); 