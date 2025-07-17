import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { pokedexId: parseInt(search) || undefined }
      ];
    }

    if (type) {
      where.types = {
        some: {
          type: {
            name: type
          }
        }
      };
    }

    // Fetch Pokemon with relationships and count
    const [pokemon, total] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { pokedexId: 'asc' },
        include: {
          types: {
            include: {
              type: true
            },
            orderBy: { slot: 'asc' }
          }
        }
      }),
      prisma.pokemon.count({ where })
    ]);

    return NextResponse.json({
      pokemon,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Pokemon API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon data' },
      { status: 500 }
    );
  }
} 