'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionIcon,
  Badge,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Progress,
  Stack,
  Text,
  Title,
  Alert,
  BackgroundImage,
  Center
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import type { PokemonDetailResponse } from '@/types/pokemon';

interface PokemonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { id } = await params;
        const response = await fetch(`/api/pokemon/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Pokemon not found');
          } else {
            setError('Failed to load Pokemon');
          }
          return;
        }
        
        const data = await response.json();
        setPokemon(data);
      } catch (err) {
        setError('Something went wrong');
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [params]);

  // Loading state
  if (loading) {
    return (
      <Container size="md" py="xl">
        <LoadingSpinner
          size="lg"
          message="Loading Pokemon details..."
          centered
          minHeight="60vh"
        />
      </Container>
    );
  }

  // Error state
  if (error || !pokemon) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error || 'Pokemon not found'}
        </Alert>
        <ActionIcon
          variant="light"
          size="lg"
          mt="md"
          onClick={() => router.push('/pokemon')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
      </Container>
    );
  }

  // Helper function to get stat color
  const getStatColor = (value: number) => {
    if (value >= 150) return 'red';
    if (value >= 120) return 'orange';
    if (value >= 90) return 'yellow';
    if (value >= 60) return 'lime';
    return 'blue';
  };

  // Helper function to format type color
  const getTypeColor = (color: string) => {
    return color.startsWith('#') ? color : `#${color}`;
  };

  return (
    <Container size="lg" py="xl">
      {/* Back Navigation */}
      <Group mb="xl">
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => router.push('/pokemon')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Text size="sm" c="dimmed">
          Back to Pokédex
        </Text>
      </Group>

      {/* Main Pokemon Card */}
      <Card shadow="md" radius="lg" withBorder>
        <Grid>
          {/* Left Side - Images */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack align="center" gap="md">
              {/* Main Artwork */}
              <Image
                src={pokemon.artworkURL || pokemon.spriteURL}
                fallbackSrc={pokemon.spriteURL}
                alt={pokemon.name}
                h={200}
                fit="contain"
              />
              
              {/* Sprite Images */}
              <Group gap="sm">
                <Image
                  src={pokemon.spriteURL}
                  alt={`${pokemon.name} sprite`}
                  h={80}
                  fit="contain"
                />
                {pokemon.spriteShinyURL && (
                  <Stack align="center" gap={4}>
                    <Image
                      src={pokemon.spriteShinyURL}
                      alt={`${pokemon.name} shiny sprite`}
                      h={80}
                      fit="contain"
                    />
                    <Badge size="xs" color="yellow">
                      Shiny
                    </Badge>
                  </Stack>
                )}
              </Group>
            </Stack>
          </Grid.Col>

          {/* Right Side - Pokemon Info */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {/* Header */}
              <Group justify="space-between" align="start">
                <Stack gap={4}>
                  <Group gap="sm" align="baseline">
                    <Title order={1} size="h1">
                      {pokemon.name}
                    </Title>
                    <Text size="lg" c="dimmed">
                      #{pokemon.pokedexId.toString().padStart(3, '0')}
                    </Text>
                  </Group>
                  
                  {/* Types */}
                  <Group gap="xs">
                    {pokemon.types.map(({ type, slot }) => (
                      <Badge
                        key={type.id}
                        size="lg"
                        style={{
                          backgroundColor: getTypeColor(type.color),
                          color: 'white'
                        }}
                      >
                        {type.name}
                      </Badge>
                    ))}
                  </Group>
                </Stack>

                {/* Status Badges */}
                <Stack gap="xs" align="end">
                  {pokemon.isLegendary && (
                    <Badge size="sm" color="gold" variant="filled">
                      Legendary
                    </Badge>
                  )}
                  {pokemon.isMythical && (
                    <Badge size="sm" color="purple" variant="filled">
                      Mythical
                    </Badge>
                  )}
                </Stack>
              </Group>

              {/* Description */}
              {pokemon.description && (
                <Text size="md" lh={1.6}>
                  {pokemon.description}
                </Text>
              )}

              {/* Physical Stats */}
              <Group gap="xl">
                <Stack gap={4} align="center">
                  <Text size="sm" c="dimmed" fw={500}>
                    Height
                  </Text>
                  <Text size="lg" fw={600}>
                    {pokemon.height} m
                  </Text>
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="sm" c="dimmed" fw={500}>
                    Weight
                  </Text>
                  <Text size="lg" fw={600}>
                    {pokemon.weight} kg
                  </Text>
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="sm" c="dimmed" fw={500}>
                    Generation
                  </Text>
                  <Text size="lg" fw={600}>
                    {pokemon.generation}
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Stats Section */}
      <Card shadow="md" radius="lg" withBorder mt="xl">
        <Title order={2} mb="md">
          Base Stats
        </Title>
        <Stack gap="md">
          {pokemon.stats.map(({ stat, baseStat }) => (
            <div key={stat.name}>
              <Group justify="space-between" mb={4}>
                <Text fw={500}>{stat.name}</Text>
                <Text fw={600}>{baseStat}</Text>
              </Group>
              <Progress
                value={(baseStat / 255) * 100}
                size="lg"
                color={getStatColor(baseStat)}
              />
            </div>
          ))}
          
          {/* Total Stats */}
          <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '12px' }}>
            <Group justify="space-between">
              <Text fw={600} size="lg">
                Total
              </Text>
              <Text fw={600} size="lg">
                {pokemon.stats.reduce((sum, { baseStat }) => sum + baseStat, 0)}
              </Text>
            </Group>
          </div>
        </Stack>
      </Card>

      {/* Abilities Section */}
      {pokemon.abilities && pokemon.abilities.length > 0 && (
        <Card shadow="md" radius="lg" withBorder mt="xl">
          <Title order={2} mb="md">
            Abilities
          </Title>
          <Group gap="md">
            {pokemon.abilities.map((abilityData) => (
              <Badge
                key={abilityData.slot}
                size="lg"
                variant="light"
                color="blue"
              >
                {abilityData.ability.name}
              </Badge>
            ))}
          </Group>
        </Card>
      )}

      {/* Moves Section (if available) */}
      {pokemon.moves && pokemon.moves.length > 0 && (
        <Card shadow="md" radius="lg" withBorder mt="xl">
          <Title order={2} mb="md">
            Moves ({pokemon.moves.length})
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Showing recent moves learned
          </Text>
          <Grid>
            {pokemon.moves.slice(0, 12).map((pokemonMove) => (
              <Grid.Col key={`${pokemonMove.move.id}-${pokemonMove.level}`} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder radius="md" p="sm">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        {pokemonMove.move.name}
                      </Text>
                      <Badge size="xs" variant="light">
                        Lv. {pokemonMove.level}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Badge size="xs" color="grape">
                        {pokemonMove.move.type}
                      </Badge>
                      {pokemonMove.move.power && (
                        <Text size="xs" c="dimmed">
                          Power: {pokemonMove.move.power}
                        </Text>
                      )}
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Card>
      )}
    </Container>
  );
} 