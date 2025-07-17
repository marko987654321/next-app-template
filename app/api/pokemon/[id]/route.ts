import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import type { PokemonDetailResponse } from '../../../../types/pokemon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PokemonDetailResponse | { error: string }>> {
  try {
    const pokemonId = parseInt(params.id);

    // Validate ID parameter
    if (isNaN(pokemonId) || pokemonId < 1) {
      return NextResponse.json(
        { error: 'Invalid Pokemon ID' },
        { status: 400 }
      );
    }

    // Fetch Pokemon with all related data
    const pokemon = await prisma.pokemon.findUnique({
      where: { pokedexId: pokemonId },
      include: {
        types: {
          include: { type: true },
          orderBy: { slot: 'asc' }
        },
        stats: {
          include: { stat: true }
        },
        abilities: {
          include: { ability: true },
          orderBy: { slot: 'asc' }
        },
        moves: {
          include: { move: true },
          where: {
            levelLearned: { lte: 100 } // Only moves learnable by level 100
          },
          orderBy: [
            { levelLearned: 'asc' },
            { move: { name: 'asc' } }
          ],
          take: 20 // Limit moves for performance
        }
      }
    });

    if (!pokemon) {
      return NextResponse.json(
        { error: 'Pokemon not found' },
        { status: 404 }
      );
    }

    // Transform the data to match our response type
    const { spriteUrl, spriteShinyUrl, artworkUrl, description, types, stats, abilities, moves, ...pokemonBase } = pokemon;
    
    const response: PokemonDetailResponse = {
      ...pokemonBase,
      // Convert null to undefined to match type definitions
      description: description ?? undefined,
      spriteURL: spriteUrl ?? undefined,
      spriteShinyURL: spriteShinyUrl ?? undefined,
      artworkURL: artworkUrl ?? undefined,
      types: types.map(pt => ({
        type: pt.type,
        slot: pt.slot
      })),
      stats: stats.map(ps => ({
        stat: {
          name: ps.stat.name,
          baseStat: ps.baseStat, // Add the missing properties to match PokemonStat
          effort: ps.effort
        },
        baseStat: ps.baseStat,
        effort: ps.effort
      })),
      abilities: abilities.map(pa => ({
        ability: pa.ability,
        isHidden: pa.isHidden,
        slot: pa.slot
      })),
      moves: moves.map(pm => ({
        move: {
          id: pm.move.id,
          name: pm.move.name,
          type: pm.move.typeId.toString(),
          power: pm.move.power ?? undefined, // Convert null to undefined
          accuracy: pm.move.accuracy ?? undefined, // Convert null to undefined
          pp: pm.move.pp
        },
        level: pm.levelLearned || 0,
        learnMethod: {
          id: 1,
          name: pm.learnMethod
        }
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 