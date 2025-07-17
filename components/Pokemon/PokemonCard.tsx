'use client';

import { Badge, Card, CardSection, Group, Image, Stack, Text, Title } from '@mantine/core';
import { type Pokemon, type PokemonType } from '../../types/pokemon';
import classes from './PokemonCard.module.css';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: Pokemon & { 
    types: { type: PokemonType; slot: number }[] 
  };
  variant?: 'default' | 'compact';
  onClick?: (pokemon: Pokemon) => void;
}

export function PokemonCard({ 
  pokemon, 
  variant = 'default', 
  onClick 
}: PokemonCardProps) {
  const handleClick = () => {
    onClick?.(pokemon);
  };

  const formatPokedexNumber = (id: number) => {
    return `#${id.toString().padStart(3, '0')}`;
  };

  const formatHeight = (height: number) => {
    return `${height}m`;
  };

  const formatWeight = (weight: number) => {
    return `${weight}kg`;
  };

  const getTypeColor = (typeName: string) => {
    // Fallback colors if database color is missing
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
      stellar: '#40B5A8'
    };
    return typeColors[typeName] || '#68D391';
  };

  return (
    <Card
      shadow="sm"
      padding={variant === 'compact' ? 'sm' : 'lg'}
      radius="md"
      withBorder
      className={classes.card}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardSection>
        <Image
          src={pokemon.artworkURL || pokemon.spriteURL}
          fallbackSrc={pokemon.spriteURL}
          alt={pokemon.name}
          height={variant === 'compact' ? 120 : 160}
          fit="contain"
          className={classes.image}
        />
      </CardSection>

      <Stack gap={variant === 'compact' ? 'xs' : 'sm'} mt="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              {formatPokedexNumber(pokemon.pokedexId)}
            </Text>
            <Title 
              order={variant === 'compact' ? 4 : 3} 
              className={classes.title}
            >
              {pokemon.name}
            </Title>
          </div>
          {(pokemon.isLegendary || pokemon.isMythical) && (
            <Badge
              color={pokemon.isMythical ? 'violet' : 'yellow'}
              variant="light"
              size="sm"
            >
              {pokemon.isMythical ? 'Mythical' : 'Legendary'}
            </Badge>
          )}
        </Group>

        <Group gap="xs">
          {pokemon.types
            .sort((a, b) => a.slot - b.slot)
            .map(({ type }) => (
              <TypeBadge
                key={type.id}
                type={type}
                size={variant === 'compact' ? 'sm' : 'md'}
              />
            ))}
        </Group>

        {variant === 'default' && (
          <Group justify="space-between" mt="xs">
            <div>
              <Text size="xs" c="dimmed">Height</Text>
              <Text size="sm" fw={500}>
                {formatHeight(pokemon.height)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Weight</Text>
              <Text size="sm" fw={500}>
                {formatWeight(pokemon.weight)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Base EXP</Text>
              <Text size="sm" fw={500}>
                {pokemon.baseExp}
              </Text>
            </div>
          </Group>
        )}

        {variant === 'default' && pokemon.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {pokemon.description}
          </Text>
        )}
      </Stack>
    </Card>
  );
}