import { seedPokemonTypes, seedPokemon, cleanup } from '../lib/seed-utils';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Step 1: Seed Pokemon Types
    await seedPokemonTypes();
    
    // Step 2: Seed Pokemon (First 151)
    await seedPokemon(151);
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

main();
