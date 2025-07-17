'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Title, 
  Pagination, 
  Center, 
  Loader, 
  Alert,
  Group,
  TextInput,
  Select,
  Button
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { PokemonCard } from '../../components/Pokemon/PokemonCard';
import { type Pokemon, type PokemonType } from '../../types/pokemon';

interface PokemonWithTypes extends Pokemon {
  types: { type: PokemonType; slot: number }[];
}

interface PokemonResponse {
  pokemon: PokemonWithTypes[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function PokemonListPage() {
  const [pokemon, setPokemon] = useState<PokemonWithTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const fetchPokemon = async (pageNum: number = page, searchQuery: string = search, typeQuery: string = typeFilter || '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (typeQuery) {
        params.append('type', typeQuery);
      }

      const response = await fetch(`/api/pokemon?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
      }

      const data: PokemonResponse = await response.json();
      setPokemon(data.pokemon);
      setTotalPages(data.pagination.totalPages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPokemon();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchPokemon(1, search, typeFilter || '');
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter(null);
    setPage(1);
    fetchPokemon(1, '', '');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPokemon(newPage, search, typeFilter || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePokemonClick = (pokemon: Pokemon) => {
    // TODO: Navigate to Pokemon detail page
    console.log('Pokemon clicked:', pokemon.name);
  };

  if (loading && pokemon.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" ta="center">
        Generation 1 Pokédex
      </Title>

      {/* Search and Filter Controls */}
      <Group mb="xl" gap="md">
        <TextInput
          placeholder="Search Pokémon by name or number..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          onKeyPress={(event) => event.key === 'Enter' && handleSearch()}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
        />
        
        <Select
          placeholder="Filter by type"
          value={typeFilter}
          onChange={setTypeFilter}
          data={POKEMON_TYPES.map(type => ({ 
            value: type, 
            label: type.charAt(0).toUpperCase() + type.slice(1) 
          }))}
          clearable
          w={200}
        />
        
        <Button onClick={handleSearch} loading={loading}>
          Search
        </Button>
        
        <Button 
          variant="light" 
          onClick={handleClearFilters}
          leftSection={<IconX size={16} />}
        >
          Clear
        </Button>
      </Group>

      {/* Error State */}
      {error && (
        <Alert color="red" mb="xl">
          {error}
        </Alert>
      )}

      {/* Pokemon Grid */}
      {pokemon.length > 0 ? (
        <>
          <Grid gutter="md">
            {pokemon.map((poke) => (
              <Grid.Col key={poke.id} span={{ base: 12, xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                <PokemonCard
                  pokemon={poke}
                  onClick={handlePokemonClick}
                />
              </Grid.Col>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination
                value={page}
                onChange={handlePageChange}
                total={totalPages}
                size="lg"
              />
            </Center>
          )}
        </>
      ) : (
        !loading && (
          <Center>
            <Alert>
              No Pokémon found matching your search criteria.
            </Alert>
          </Center>
        )
      )}
    </Container>
  );
}