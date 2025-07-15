import { prisma } from './prisma';

// PokeAPI Response Types
interface PokeAPITypeResponse {
    id: number;
    name: string;
    damage_relations: {
        double_damage_to: Array<{ name: string; url: string }>;
        half_damage_to: Array<{ name: string; url: string }>;
        no_damage_to: Array<{ name: string; url: string }>;
    };
}

interface PokeAPIListResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface PokeAPIPokemonResponse {
    id: number;
    name: string;
    height: number;        // in decimeters - convert to meters
    weight: number;        // in hectograms - convert to kg
    base_experience: number;
    order: number;
    species: {
        name: string;
        url: string;
    };
    types: Array<{
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }>;
    sprites: {
        front_default: string | null;
        front_shiny: string | null;
        other: {
            'official-artwork': {
                front_default: string | null;
            };
        };
    };
}

interface PokeAPISpeciesResponse {
    id: number;
    name: string;
    flavor_text_entries: Array<{
        flavor_text: string;
        language: { name: string };
        version: { name: string };
    }>;
    capture_rate: number;
    is_legendary: boolean;
    is_mythical: boolean;
    generation: {
        name: string;
        url: string;
    };
}

// Rate limiting utility
export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with rate limiting
export async function fetchFromPokeAPI<T>(url: string): Promise<T> {
  const rateLimit = parseInt(process.env.POKEAPI_RATE_LIMIT_DELAY || '100');
  await delay(rateLimit);
  
  console.log(`🌐 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Pokedex-App/1.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    throw error;
  }
}

// Color mapping for Pokemon types
const TYPE_COLORS: Record<string, string> = {
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
};

// Seed Pokemon Types
export async function seedPokemonTypes(): Promise<void> {
    console.log('🎨 Seeding Pokemon Types...');
    
    const baseUrl = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
    const typesResponse = await fetchFromPokeAPI<PokeAPIListResponse<{ name: string; url: string }>>(
        `${baseUrl}/type`
    );
    
    for (const typeData of typesResponse.results) {
        // Skip unknown type
        if (typeData.name === 'unknown' || typeData.name === 'shadow') continue;
        
        const typeDetails = await fetchFromPokeAPI<PokeAPITypeResponse>(typeData.url);
        
        console.log(`  📝 Creating type: ${typeDetails.name}`);
        
        await prisma.type.upsert({
            where: { name: typeDetails.name },
            update: {},
            create: {
                name: typeDetails.name,
                color: TYPE_COLORS[typeDetails.name] || '#68A090',
            },
        });
    }
    
    console.log('✅ Pokemon Types seeded successfully!');
}

// Replace the existing seedPokemon function with this complete implementation
export async function seedPokemon(limit: number = 151): Promise<void> {
  console.log(`🎮 Seeding first ${limit} Pokemon...`);
  
  const baseUrl = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
  
  for (let i = 1; i <= limit; i++) {
    try {
      console.log(`  📦 Fetching Pokemon #${i}...`);
      
      // Fetch basic Pokemon data
      const pokemonData = await fetchFromPokeAPI<PokeAPIPokemonResponse>(
        `${baseUrl}/pokemon/${i}`
      );
      
      // Fetch species data for additional info
      const speciesData = await fetchFromPokeAPI<PokeAPISpeciesResponse>(
        pokemonData.species.url
      );
      
      // Get English description
      const englishEntry = speciesData.flavor_text_entries.find(
        (entry) => entry.language.name === 'en' && entry.version.name === 'red'
      ) || speciesData.flavor_text_entries.find(
        (entry) => entry.language.name === 'en'
      );
      
      const description = englishEntry 
        ? englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim()
        : null;
      
      // Extract generation number from URL (e.g., "generation-i" -> 1)
      const generationMatch = speciesData.generation.name.match(/generation-(\w+)/);
      const romanToNumber: Record<string, number> = {
        'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 
        'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9
      };
      const generation = generationMatch 
        ? romanToNumber[generationMatch[1]] || 1 
        : 1;
      
      // Create slug from name
      const slug = pokemonData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      console.log(`  📝 Creating Pokemon: ${pokemonData.name}`);
      
      // Create Pokemon record
      const pokemon = await prisma.pokemon.upsert({
        where: { pokedexId: pokemonData.id },
        update: {},
        create: {
          pokedexId: pokemonData.id,
          name: pokemonData.name,
          slug: slug,
          description: description,
          height: pokemonData.height / 10, // Convert decimeters to meters
          weight: pokemonData.weight / 10, // Convert hectograms to kg
          baseExp: pokemonData.base_experience || 0,
          captureRate: speciesData.capture_rate,
          isLegendary: speciesData.is_legendary,
          isMythical: speciesData.is_mythical,
          generation: generation,
          spriteUrl: pokemonData.sprites.front_default,
          spriteShinyUrl: pokemonData.sprites.front_shiny,
          artworkUrl: pokemonData.sprites.other['official-artwork'].front_default,
        },
      });
      
      // Add Pokemon types
      for (const typeData of pokemonData.types) {
        // Find the type in our database
        const type = await prisma.type.findUnique({
          where: { name: typeData.type.name }
        });
        
        if (type) {
          await prisma.pokemonType.upsert({
            where: {
              pokemonId_slot: {
                pokemonId: pokemon.id,
                slot: typeData.slot
              }
            },
            update: {},
            create: {
              pokemonId: pokemon.id,
              typeId: type.id,
              slot: typeData.slot,
            },
          });
          
          console.log(`    🏷️  Added type: ${type.name} (slot ${typeData.slot})`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error seeding Pokemon #${i}:`, error);
      // Continue with next Pokemon instead of failing entirely
    }
  }
  
  console.log(`✅ Pokemon seeding completed! Added ${limit} Pokemon.`);
}

// Clean up function
export async function cleanup(): Promise<void> {
    await prisma.$disconnect();
}