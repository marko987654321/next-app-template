import { prisma } from './prisma';

async function verifyData() {
  console.log('🔍 Verifying Pokemon Database...\n');
  
  try {
    // Count records
    const [pokemonCount, typeCount, pokemonTypeCount] = await Promise.all([
      prisma.pokemon.count(),
      prisma.type.count(),
      prisma.pokemonType.count()
    ]);
    
    console.log('📊 Database Counts:');
    console.log(`   Pokemon: ${pokemonCount}`);
    console.log(`   Types: ${typeCount}`);
    console.log(`   Pokemon-Type Relations: ${pokemonTypeCount}\n`);
    
    // Sample Pokemon with types
    console.log('🎮 Sample Pokemon with Types:');
    const samplePokemon = await prisma.pokemon.findMany({
      take: 5,
      include: {
        types: {
          include: {
            type: true
          },
          orderBy: {
            slot: 'asc'
          }
        }
      },
      orderBy: {
        pokedexId: 'asc'
      }
    });
    
    samplePokemon.forEach(pokemon => {
      const types = pokemon.types.map(pt => pt.type.name).join('/');
      const paddedId = pokemon.pokedexId.toString().padStart(3, '0');
      const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      console.log(`   No.${paddedId} ${capitalizedName} (${types})`);
    });
    
    console.log('\n🖼️ Image URL Check:');
    const pokemonWithImages = await prisma.pokemon.findFirst({
      where: {
        spriteUrl: { not: null }
      }
    });
    
    if (pokemonWithImages) {
      console.log(`   ✅ Sprite URLs working: ${pokemonWithImages.spriteUrl}`);
    }
    
    console.log('\n📝 Description Check:');
    const pokemonWithDescription = await prisma.pokemon.findFirst({
      where: {
        description: { not: null }
      }
    });
    
    if (pokemonWithDescription) {
      const shortDesc = pokemonWithDescription.description?.substring(0, 50) || 'No description';
      console.log(`   ✅ Descriptions working: "${shortDesc}..."`);
    }
    
    console.log('\n🎉 Verification Complete!');
    
  } catch (error) {
    console.error('❌ Verification Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();