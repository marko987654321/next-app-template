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

// Clean up function
export async function cleanup(): Promise<void> {
    await prisma.$disconnect();
}