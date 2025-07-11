# Database Schema Design

## Overview
This document outlines the database schema for the Pokedex application using Prisma ORM. The schema is designed to store comprehensive Pokemon data while maintaining performance and data integrity.

## Database Choice
- **Development**: SQLite (for ease of setup)
- **Production**: PostgreSQL (for scalability and features)

## Core Entities

### 1. Pokemon
The main entity representing individual Pokemon.

```prisma
model Pokemon {
  id          Int      @id @default(autoincrement())
  pokedexId   Int      @unique // National Pokedex number
  name        String   @unique
  slug        String   @unique // URL-friendly name
  description String?  // Pokedex description
  height      Float    // in meters
  weight      Float    // in kilograms
  baseExp     Int      // Base experience
  captureRate Int      // Capture rate (0-255)
  isLegendary Boolean  @default(false)
  isMythical  Boolean  @default(false)
  generation  Int      // Pokemon generation (1-9)
  
  // Images
  spriteUrl      String? // Default sprite
  spriteShinyUrl String? // Shiny sprite
  artworkUrl     String? // Official artwork
  
  // Relationships
  types       PokemonType[]
  abilities   PokemonAbility[]
  stats       PokemonStat[]
  moves       PokemonMove[]
  evolutions  Evolution[] @relation("FromPokemon")
  evolutionsTo Evolution[] @relation("ToPokemon")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("pokemon")
}
```

### 2. Type System
Pokemon types (Fire, Water, Grass, etc.) with effectiveness relationships.

```prisma
model Type {
  id         Int    @id @default(autoincrement())
  name       String @unique
  color      String // Hex color for UI
  
  // Relationships
  pokemon    PokemonType[]
  strongAgainst TypeEffectiveness[] @relation("AttackingType")
  weakAgainst   TypeEffectiveness[] @relation("DefendingType")
  
  @@map("types")
}

model PokemonType {
  id        Int     @id @default(autoincrement())
  pokemonId Int
  typeId    Int
  slot      Int     // Primary (1) or Secondary (2) type
  
  pokemon   Pokemon @relation(fields: [pokemonId], references: [id], onDelete: Cascade)
  type      Type    @relation(fields: [typeId], references: [id])
  
  @@unique([pokemonId, slot])
  @@map("pokemon_types")
}

model TypeEffectiveness {
  id              Int   @id @default(autoincrement())
  attackingTypeId Int
  defendingTypeId Int
  effectiveness   Float // 0.5 = not very effective, 1.0 = normal, 2.0 = super effective
  
  attackingType Type @relation("AttackingType", fields: [attackingTypeId], references: [id])
  defendingType Type @relation("DefendingType", fields: [defendingTypeId], references: [id])
  
  @@unique([attackingTypeId, defendingTypeId])
  @@map("type_effectiveness")
}
```

### 3. Abilities System
Pokemon abilities with descriptions and effects.

```prisma
model Ability {
  id          Int    @id @default(autoincrement())
  name        String @unique
  description String
  effect      String? // Detailed effect description
  isHidden    Boolean @default(false)
  
  // Relationships
  pokemon PokemonAbility[]
  
  @@map("abilities")
}

model PokemonAbility {
  id        Int     @id @default(autoincrement())
  pokemonId Int
  abilityId Int
  slot      Int     // 1, 2, or 3 (hidden ability)
  isHidden  Boolean @default(false)
  
  pokemon Pokemon @relation(fields: [pokemonId], references: [id], onDelete: Cascade)
  ability Ability @relation(fields: [abilityId], references: [id])
  
  @@unique([pokemonId, slot])
  @@map("pokemon_abilities")
}
```

### 4. Stats System
Pokemon base stats (HP, Attack, Defense, etc.).

```prisma
model Stat {
  id   Int    @id @default(autoincrement())
  name String @unique // hp, attack, defense, special-attack, special-defense, speed
  
  // Relationships
  pokemon PokemonStat[]
  
  @@map("stats")
}

model PokemonStat {
  id        Int @id @default(autoincrement())
  pokemonId Int
  statId    Int
  baseStat  Int // Base stat value
  effort    Int @default(0) // EV yield
  
  pokemon Pokemon @relation(fields: [pokemonId], references: [id], onDelete: Cascade)
  stat    Stat    @relation(fields: [statId], references: [id])
  
  @@unique([pokemonId, statId])
  @@map("pokemon_stats")
}
```

### 5. Moves System
Pokemon moves with type, power, accuracy, and other attributes.

```prisma
model Move {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  typeId      Int
  category    String  // physical, special, status
  power       Int?    // null for status moves
  accuracy    Int?    // percentage (null for moves that never miss)
  pp          Int     // Power Points
  priority    Int     @default(0)
  
  type    Type @relation(fields: [typeId], references: [id])
  pokemon PokemonMove[]
  
  @@map("moves")
}

model PokemonMove {
  id           Int    @id @default(autoincrement())
  pokemonId    Int
  moveId       Int
  learnMethod  String // level-up, machine, tutor, egg
  levelLearned Int?   // null if not learned by level-up
  
  pokemon Pokemon @relation(fields: [pokemonId], references: [id], onDelete: Cascade)
  move    Move    @relation(fields: [moveId], references: [id])
  
  @@unique([pokemonId, moveId, learnMethod])
  @@map("pokemon_moves")
}
```

### 6. Evolution System
Pokemon evolution chains and requirements.

```prisma
model Evolution {
  id           Int     @id @default(autoincrement())
  fromPokemonId Int
  toPokemonId   Int
  trigger      String  // level-up, use-item, trade, etc.
  minLevel     Int?
  item         String? // Required item name
  location     String? // Required location
  timeOfDay    String? // day, night
  condition    String? // Additional conditions
  
  fromPokemon Pokemon @relation("FromPokemon", fields: [fromPokemonId], references: [id])
  toPokemon   Pokemon @relation("ToPokemon", fields: [toPokemonId], references: [id])
  
  @@unique([fromPokemonId, toPokemonId])
  @@map("evolutions")
}
```

### 7. User System (Optional for Future Features)
User accounts for favorites, teams, etc.

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String @unique
  
  // Relationships
  favorites UserFavorite[]
  teams     Team[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}

model UserFavorite {
  id        Int @id @default(autoincrement())
  userId    Int
  pokemonId Int
  
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  pokemon Pokemon @relation(fields: [pokemonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, pokemonId])
  @@map("user_favorites")
}

model Team {
  id          Int    @id @default(autoincrement())
  userId      Int
  name        String
  description String?
  
  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  members TeamMember[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("teams")
}

model TeamMember {
  id        Int     @id @default(autoincrement())
  teamId    Int
  pokemonId Int
  nickname  String?
  position  Int     // 1-6 for team position
  
  team    Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  pokemon Pokemon @relation(fields: [pokemonId], references: [id])
  
  @@unique([teamId, position])
  @@map("team_members")
}
```

## Indexes for Performance

```prisma
// Add these to improve query performance
@@index([name]) // on Pokemon
@@index([pokedexId]) // on Pokemon
@@index([generation]) // on Pokemon
@@index([isLegendary]) // on Pokemon
@@index([typeId]) // on PokemonType
@@index([pokemonId, slot]) // on PokemonType
@@index([attackingTypeId, defendingTypeId]) // on TypeEffectiveness
```

## Data Seeding Strategy

### 1. Core Data Sources
- **PokeAPI** (https://pokeapi.co/) - Primary data source
- **Pokemon Database** - Backup/verification
- **Official Pokemon assets** - Images and sprites

### 2. Seeding Order
1. Types
2. Stats (hp, attack, defense, etc.)
3. Abilities
4. Moves
5. Pokemon (basic data)
6. Pokemon relationships (types, abilities, stats, moves)
7. Type effectiveness
8. Evolutions

### 3. Data Validation
- Ensure all Pokemon have required fields
- Validate type effectiveness relationships
- Check evolution chain consistency
- Verify image URLs are accessible

## Query Patterns

### 1. Common Queries
```typescript
// Get Pokemon with types and abilities
const pokemon = await prisma.pokemon.findUnique({
  where: { pokedexId: 1 },
  include: {
    types: { include: { type: true } },
    abilities: { include: { ability: true } },
    stats: { include: { stat: true } }
  }
});

// Search Pokemon by name or type
const results = await prisma.pokemon.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { types: { some: { type: { name: { contains: searchTerm, mode: 'insensitive' } } } } }
    ]
  },
  include: { types: { include: { type: true } } }
});

// Get type effectiveness
const effectiveness = await prisma.typeEffectiveness.findMany({
  where: { attackingTypeId: typeId },
  include: { defendingType: true }
});
```

### 2. Performance Considerations
- Use `select` to limit returned fields
- Implement pagination for large result sets
- Cache frequently accessed data
- Use database indexes on commonly queried fields

## Migration Strategy

### 1. Development
- Use Prisma migrations for schema changes
- Reset database when needed during development
- Keep migration files in version control

### 2. Production
- Always run migrations before deployment
- Backup database before major schema changes
- Test migrations on staging environment first

## Future Enhancements

### 1. Potential Additions
- **Regions** - Different Pokemon regions/games
- **Items** - Pokeballs, berries, evolution items
- **Locations** - Where Pokemon can be found
- **Movesets** - Recommended competitive movesets
- **Breeding** - Egg groups and breeding mechanics
- **Forms** - Alternate Pokemon forms (Alolan, Galarian, etc.)

### 2. Performance Optimizations
- **Materialized views** for complex queries
- **Full-text search** for Pokemon and move descriptions
- **Caching layer** (Redis) for frequently accessed data
- **Read replicas** for scaling read operations 