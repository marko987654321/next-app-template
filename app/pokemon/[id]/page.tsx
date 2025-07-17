'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import type { PokemonDetailResponse } from '../../../types/pokemon';

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pokemon/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Pokemon not found');
        }
        
        const data = await response.json();
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pokemon');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPokemon();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Center h={400}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading Pokemon...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || !pokemon) {
    return (
      <Container size="md" py="xl">
        <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle />}>
          {error || 'Pokemon not found'}
        </Alert>
        <Button 
          leftSection={<IconArrowLeft />} 
          variant="light" 
          onClick={() => router.back()}
          mt="md"
        >
          Back to Pokedex
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Back Button */}
      <Button 
        leftSection={<IconArrowLeft />} 
        variant="light" 
        onClick={() => router.back()}
        mb="xl"
      >
        Back to Pokedex
      </Button>

      {/* Pokemon Header */}
      <Paper shadow="md" p="xl" radius="md" mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack align="center">
              <Image
                src={pokemon.artworkURL}
                fallbackSrc={pokemon.spriteURL}
                alt={pokemon.name}
                height={300}
                fit="contain"
              />
              {pokemon.spriteShinyURL && (
                <Stack align="center" mt="md">
                  <Text size="sm" c="dimmed">Shiny Form</Text>
                  <Image
                    src={pokemon.spriteShinyURL}
                    alt={`${pokemon.name} shiny`}
                    height={80}
                    fit="contain"
                  />
                </Stack>
              )}
            </Stack>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack>
              {/* Name and ID */}
              <Group>
                <Title order={1} style={{ textTransform: 'capitalize' }}>
                  {pokemon.name}
                </Title>
                <Badge size="lg" variant="light">
                  #{pokemon.pokedexId.toString().padStart(3, '0')}
                </Badge>
              </Group>

              {/* Types */}
              <Group>
                <Text fw={600}>Type:</Text>
                {pokemon.types.map(({ type, slot }) => (
                  <Badge
                    key={slot}
                    style={{ backgroundColor: type.color }}
                    size="lg"
                  >
                    {type.name}
                  </Badge>
                ))}
              </Group>

              {/* Description */}
              {pokemon.description && (
                <Stack>
                  <Text fw={600}>Description:</Text>
                  <Text>{pokemon.description}</Text>
                </Stack>
              )}

              {/* Basic Stats */}
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={600}>Height</Text>
                    <Text size="lg">{pokemon.height}m</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text fw={600}>Weight</Text>
                    <Text size="lg">{pokemon.weight}kg</Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              {/* Additional Info */}
              <Group>
                {pokemon.isLegendary && (
                  <Badge color="gold" size="lg">Legendary</Badge>
                )}
                {pokemon.isMythical && (
                  <Badge color="purple" size="lg">Mythical</Badge>
                )}
                <Badge variant="light" size="lg">
                  Gen {pokemon.generation}
                </Badge>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Placeholder sections for future development */}
      {pokemon.stats.length > 0 && (
        <Paper shadow="md" p="xl" radius="md" mb="xl">
          <Title order={3} mb="md">Base Stats</Title>
          {/* Stats will be implemented next */}
          <Text c="dimmed">Stats section coming soon...</Text>
        </Paper>
      )}

      {pokemon.abilities.length > 0 && (
        <Paper shadow="md" p="xl" radius="md" mb="xl">
          <Title order={3} mb="md">Abilities</Title>
          {/* Abilities will be implemented next */}
          <Text c="dimmed">Abilities section coming soon...</Text>
        </Paper>
      )}

      {pokemon.moves.length > 0 && (
        <Paper shadow="md" p="xl" radius="md">
          <Title order={3} mb="md">Moves</Title>
          {/* Moves will be implemented next */}
          <Text c="dimmed">Moves section coming soon...</Text>
        </Paper>
      )}
    </Container>
  );
} 