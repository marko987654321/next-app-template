// Core Pokemon Types Based on Prisma Schema
export interface Pokemon {
    id: number
    pokedexId: number
    name: string
    slug: string
    description?: string
    height: number
    weight: number
    baseExp: number
    captureRate: number
    isLegendary: boolean
    isMythical: boolean
    generation: number
    spriteURL?: string
    spriteShinyURL?: string
    artworkURL?: string
    createdAt: Date
    updatedAt: Date
}

export interface PokemonType {
    id: number
    name: string
    color: string
}

export interface PokemonStat {
    name: string
    baseStat: number
    effort: number
}

export interface PokemonAbility {
    name: string
    description: string
    isHidden: boolean
}

export interface PokemonListResponse {
    pokemon: (Pokemon & {
        types: { type: PokemonType }[]
    })[]
    total: number
    page: number
    limit: number
}

export interface PokemonDetailResponse extends Pokemon {
    types: { type: PokemonType; slot: number }[]
    stats: { stat: PokemonStat; baseStat: number; effort: number }[]
    abilities: { ability: PokemonAbility; isHidden: boolean; slot: number }[]
    moves: { 
        move: { 
            id: number
            name: string
            type: string
            power?: number
            accuracy?: number
            pp: number
        }
        level: number
        learnMethod: {
            id: number
            name: string
        }
    }[]
}

export interface SearchResponse {
    results: (Pokemon & {
        types: { type: PokemonType }[]
    })[]
    total: number
    page: number
    limit: number
}

export interface PokemonListResponse {
    pokemon: (Pokemon & {
        types: { type: PokemonType }[]
    })[]
    total: number
}