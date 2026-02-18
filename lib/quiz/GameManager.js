import { DinoGame } from './games/DinoGame.js';
import { PacManGame } from './games/PacManGame.js';
import { SnakeGame } from './games/SnakeGame.js';
import { BreakoutGame } from './games/BreakoutGame.js';
import { SiegeGame } from './games/SiegeGame.js';
import { DartGame } from './games/DartGame.js';
import { gameData } from './gameData.js';

/**
 * Manages retro game instances and UI
 */
export class GameManager {
    constructor(container, ui) {
        this.container = container;
        this.ui = ui;
        this.currentGame = null;
        this.onGameComplete = null;
    }

    /**
     * Show game for a specific area
     */
    showGame(areaIndex, onComplete) {
        const gameConfig = gameData.find(g => g.area === areaIndex + 1);
        if (!gameConfig) {
            console.warn(`No game configured for area ${areaIndex + 1}`);
            if (onComplete) onComplete(true);
            return;
        }

        this.onGameComplete = onComplete;

        // Show pre-game sarcastic message
        this.ui.showGameMessage(gameConfig.preMessage, () => {
            this._startGame(gameConfig);
        });
    }

    _startGame(gameConfig) {
        const onGameEnd = (won) => {
            this._endGame(gameConfig, won);
        };

        // Create appropriate game instance
        switch (gameConfig.gameType) {
            case 'dino':
                this.currentGame = new DinoGame(this.container, onGameEnd);
                break;
            case 'pacman':
                this.currentGame = new PacManGame(this.container, onGameEnd);
                break;
            case 'snake':
                this.currentGame = new SnakeGame(this.container, onGameEnd);
                break;
            case 'breakout':
                this.currentGame = new BreakoutGame(this.container, onGameEnd);
                break;
            case 'siege':
                this.currentGame = new SiegeGame(this.container, onGameEnd);
                break;
            case 'dart':
                this.currentGame = new DartGame(this.container, onGameEnd);
                break;
            default:
                console.error(`Unknown game type: ${gameConfig.gameType}`);
                if (this.onGameComplete) this.onGameComplete(true);
        }
    }

    _endGame(gameConfig, won) {
        // Show post-game sarcastic message
        const message = won ? gameConfig.postWinMessage : gameConfig.postLoseMessage;

        this.ui.showGameMessage(message, () => {
            if (won) {
                // Determine completion
                if (this.onGameComplete) {
                    this.onGameComplete(true);
                }
                this.currentGame = null;
            } else {
                // Restart game if lost
                this.currentGame = null;
                this._startGame(gameConfig);
            }
        });
    }

    /**
     * Dispose current game
     */
    dispose() {
        if (this.currentGame && this.currentGame.dispose) {
            this.currentGame.dispose();
        }
        this.currentGame = null;
    }
}
