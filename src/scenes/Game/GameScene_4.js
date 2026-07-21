import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_4 extends BaseGameScene {
    constructor() {
        super('GameScene_4');
    }

    preload() {
        const path = 'assets/images/Game_4/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game4_card_back', `${path}game4_card_cover.png`);

        ``
        for (let i = 1; i <= 4; i++) {
            this.load.image(`game4_card${i}_img`, `${path}game4_card${i}_large_img.png`);
            this.load.image(`game4_card${i}_text`, `${path}game4_card${i}_large_text.png`);
        }
        this.load.image('game4_npc_box_win', `${path}game4_npc_box2.png`);
        this.load.image('game4_npc_box_tryagain', `${path}game4_npc_box3.png`);
        this.load.image('game4_preview', `${path}game4_success_preview.png`);

        this.load.image('game4_object_description', `${path}game4_object_description.png`);

    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 + 50;

        // Initialize game data before initGame (which calls setupGameObjects)
        this.isChecked = false;
        this.totalPairs = 4;

        this.spawnCardPositions = [
            { x: centerX - 500, y: centerY - 100 },
            { x: centerX - 200, y: centerY - 100 },
            { x: centerX + 150, y: centerY - 100 },
            { x: centerX + 500, y: centerY - 100 },
            { x: centerX - 500, y: centerY + 240 },
            { x: centerX - 200, y: centerY + 240 },
            { x: centerX + 150, y: centerY + 240 },
            { x: centerX + 500, y: centerY + 240 }
        ];

        this.cardTypes = [
            'game4_card1_img',
            'game4_card2_img',
            'game4_card3_img',
            'game4_card1_text',
            'game4_card2_text',
            'game4_card3_text',
            'game4_card4_img',
            'game4_card4_text'
        ];

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;

        // Now call initGame which will call setupGameObjects
        this.initGame('game4_bg', 'game4_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 4
        });
    }

    setupGameObjects() {
        const shuffledTypes = Phaser.Utils.Array.Shuffle([...this.cardTypes]);
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);

        console.log('Creating cards at positions:', shuffledPositions);

        // Create cards at random positions in random order
        shuffledTypes.forEach((cardType, index) => {
            const pos = shuffledPositions[index];

            // Create card container
            const card = this.add.container(pos.x, pos.y).setDepth(500);

            // Card back (initially visible)
            const cardBack = this.add.image(0, 0, 'game4_card_back')
                .setInteractive({ useHandCursor: true })
                .setVisible(true)
                .setScale(1.2);

            // Card front (hidden initially) - scale to match card back size
            const cardFront = this.add.image(0, 0, cardType)
                .setVisible(false)
                .setScale(0.7);

            card.add([cardBack, cardFront]);

            // Store card data
            card.cardType = cardType;
            card.cardBack = cardBack;
            card.cardFront = cardFront;
            card.isFlipped = false;
            card.isMatched = false;

            cardBack.on('pointerover', () => {
                cardBack.setScale(1.4);
            });

            cardBack.on('pointerout', () => {
                cardBack.setScale(1.2);
            });

            // Add click handler
            cardBack.on('pointerdown', () => this.onCardClick(card));

            this.cards.push(card);
        });

        console.log(`Created ${this.cards.length} cards`);
    }

    onCardClick(card) {
        if (!this.isGameActive || this.isChecking || card.isFlipped || card.isMatched) {
            return;
        }

        // Flip the card
        this.flipCard(card, true);
        this.flippedCards.push(card);

        for (let i = 1; this.flippedCards >= 0; i--) {
            this.flippedCards[i].setDepth(500 + i); // Ensure flipped cards are on top
        }

        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.isChecking = true;
            this.checkMatch();
        }
    }

    flipCard(card, faceUp) {
        card.isFlipped = faceUp;
        card.cardBack.setVisible(!faceUp);
        card.cardFront.setVisible(faceUp);


        // Optional: Add flip animation
        this.tweens.add({
            targets: card,
            scaleX: faceUp ? 0.7 : 1,
            scaleY: faceUp ? 0.7 : 1,
            duration: 150,
            ease: 'Linear'
        });
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        // Extract pair number (e.g., "card1_img" and "card1_text" are a match)
        const type1 = card1.cardType.replace(/_(img|text)$/, '');
        const type2 = card2.cardType.replace(/_(img|text)$/, '');

        if (type1 === type2) {
            // Match found!
            this.time.delayedCall(500, () => {
                card1.isMatched = true;
                card2.isMatched = true;

                // Make cards disappear with animation
                this.tweens.add({
                    targets: [card1, card2],
                    alpha: 0,
                    scale: 0.5,
                    duration: 300,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        card1.destroy();
                        card2.destroy();
                    }
                });

                // Increment matched pairs count
                this.matchedPairs++;
                console.log(`Matched pairs: ${this.matchedPairs}/${this.totalPairs}`);

                // Check if all 4 pairs matched - WIN!
                if (this.matchedPairs === this.totalPairs) {
                    console.log('All pairs matched! You win!');
                    this.time.delayedCall(500, () => {
                        this.onRoundWin();
                    });
                }

                this.flippedCards = [];
                this.isChecking = false;
            });
        } else {
            // No match, flip back
            this.time.delayedCall(1000, () => {
                this.flipCard(card1, false);
                this.flipCard(card2, false);
                this.flippedCards = [];
                this.isChecking = false;
            });
        }
    }



    enableGameInteraction(enabled) {
        this.cards.forEach(card => {
            // Skip if card is destroyed or matched
            if (!card || card.isMatched || !card.cardBack) return;

            if (enabled) {
                card.cardBack.setInteractive();
            } else {
                card.cardBack.disableInteractive();
            }
        });
    }

    resetForNewRound() {
        // Destroy existing cards
        if (this.cards) {
            this.cards.forEach(card => card.destroy());
        }

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isChecking = false;

        // Recreate cards
        this.setupGameObjects();
    }

    showWin() {
        this.winPreview = this.add.image(this.centerX, this.centerY + 100, 'game4_preview').setDepth(1000)
            .setInteractive({ useHandCursor: true }).setScale(1.3)
            .on('pointerdown', () => {
                this.winPreview.destroy();
                this.showObjectPanel();
            });

    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game4_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

}
