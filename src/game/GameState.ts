import { World } from './World';

export interface Relic {
    id: string;
    name: string;
    description: string;
    cost: number;
    effect: () => void;
}

export class GameState {
    private currentLevel: number;
    private levelDuration: number; // in seconds
    private timeRemaining: number;
    private coins: number;
    private relics: Relic[];
    private activeRelics: Set<string>;
    private world: World;
    private elapsedTime: number; // Time elapsed since game start in seconds

    constructor(world: World) {
        this.currentLevel = 1;
        this.levelDuration = 60; // 60 seconds for first level
        this.timeRemaining = this.levelDuration;
        this.coins = 0;
        this.world = world;
        this.activeRelics = new Set();
        this.elapsedTime = 0;
        
        // Initialize available relics
        this.relics = [
            {
                id: 'faster_guns',
                name: 'Rapid Fire',
                description: 'Increases fire rate by 20%',
                cost: 5,
                effect: () => { /* Implement fire rate increase */ }
            },
            {
                id: 'faster_rotation',
                name: 'Quick Turn',
                description: 'Increases rotation speed by 25%',
                cost: 4,
                effect: () => { /* Implement rotation speed increase */ }
            },
            {
                id: 'faster_thrust',
                name: 'Boost Power',
                description: 'Increases thrust power by 30%',
                cost: 6,
                effect: () => { /* Implement thrust power increase */ }
            },
            {
                id: 'double_coins',
                name: 'Lucky Charm',
                description: 'Doubles coin drops from enemies',
                cost: 8,
                effect: () => { /* Implement double coins */ }
            },
            {
                id: 'shield',
                name: 'Energy Shield',
                description: 'Grants one extra hit point',
                cost: 7,
                effect: () => { /* Implement shield */ }
            }
        ];
    }

    update(deltaTime: number): void {
        this.timeRemaining -= deltaTime;
        this.elapsedTime += deltaTime;
        
        if (this.timeRemaining <= 0) {
            this.completeLevel();
        }
    }

    addCoins(amount: number): void {
        this.coins += amount;
    }

    completeLevel(): void {
        // Show shop interface
        this.showShop();
        
        // Prepare for next level
        this.currentLevel++;
        this.levelDuration = Math.min(60 + (this.currentLevel - 1) * 15, 180); // Increase duration up to 3 minutes
        this.timeRemaining = this.levelDuration;
    }

    showShop(): void {
        // This would be implemented to show the shop UI
        // For now, we'll just log the available relics
        console.log('Shop opened! Available relics:');
        this.relics.forEach(relic => {
            console.log(`${relic.name} - ${relic.description} (${relic.cost} coins)`);
        });
    }

    purchaseRelic(relicId: string): boolean {
        const relic = this.relics.find(r => r.id === relicId);
        if (!relic || this.coins < relic.cost) {
            return false;
        }

        this.coins -= relic.cost;
        this.activeRelics.add(relicId);
        relic.effect();
        return true;
    }

    getElapsedTime(): number {
        return this.elapsedTime;
    }

    getTimeRemaining(): number {
        return this.timeRemaining;
    }

    getCurrentLevel(): number {
        return this.currentLevel;
    }

    getCoins(): number {
        return this.coins;
    }

    getAvailableRelics(): Relic[] {
        return this.relics;
    }

    getActiveRelics(): string[] {
        return Array.from(this.activeRelics);
    }
} 