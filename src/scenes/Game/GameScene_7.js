import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_7 extends BaseGameScene {
    constructor() {
        super('GameScene_7');
    }

    preload() {
        const path = 'assets/images/Game_7/';
        const player = JSON.parse(localStorage.getItem('player') || '{"gender":"M"}');
        this.genderKey = player.gender === 'M' ? 'boy' : 'girl';

        this.load.image('confirm_button', `${path}game7_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game7_confirm_button_select.png`);

        if (this.genderKey === 'boy') {
            this.load.video('game7_final_video', `${path}game7_final_boy.mp4`);
            this.load.image('game7_final_dialog', `${path}game7_npc_box6_boy.png`);
        } else {
            this.load.video('game7_final_video', `${path}game7_final_girl.mp4`);
            this.load.image('game7_final_dialog', `${path}game7_npc_box6_girl.png`);
        }
        this.load.image('game7_npc_box_win', `${path}game7_npc_box4.png`);
        this.load.image('game7_npc_box_win1', `${path}game7_npc_box5.png`);
        this.load.image('game7_npc_box_tryagain', `${path}game7_npc_box7.png`);

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game7_object${i}`, `${path}game7_object${i}.png`);
        }

        this.load.image('game7_border1', `${path}game7_border1.png`);
        this.load.image('game7_border2', `${path}game7_border2.png`);
        this.load.image('game7_border3', `${path}game7_border3.png`);

        this.load.image('game7_final_preview1', `${path}game7_final_preview1.png`);
        this.load.image('game7_final_preview2', `${path}game7_final_preview2.png`);
    }

    create() {
        // Initialize dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.initGame('game7_bg', 'game7_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: false,
            sceneIndex: 7
        });

        // Create confirm button
        this.confirmBtn = new CustomButton(this, this.centerX, this.height - 100,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });

        this.confirmBtn.setDepth(600).setVisible(false);
    }

    setupGameObjects() {

        this.border1 = this.add.image(this.centerX - 500, this.centerY, 'game7_border1').setDepth(500).setVisible(true);
        this.border2 = this.add.image(this.centerX, this.centerY, 'game7_border2').setDepth(500).setVisible(true);
        this.border3 = this.add.image(this.centerX + 500, this.centerY, 'game7_border3').setDepth(500).setVisible(true);

        // Track which object is at each position
        this.positionObjects = {};

        // Border 1 (left) - 4 positions in a 2x2 grid
        this.snapPositions = [

            { x: this.centerX - 500, y: this.centerY, isOccupied: false },

            { x: this.centerX, y: this.centerY, isOccupied: false },

            { x: this.centerX + 500, y: this.centerY, isOccupied: false },

        ];

        this.snapRadius = 80; // Distance threshold for snapping

        const spawnPositions = [
            { x: this.centerX - 750, y: this.centerY + 260 },

            { x: this.centerX - 200, y: this.centerY + 300 },

            { x: this.centerX + 600, y: this.centerY + 260 },
        ];



        const shuffledPositions = Phaser.Utils.Array.Shuffle([...spawnPositions]);

        this.objects = [];
        for (let i = 1; i <= 3; i++) {
            const pos = shuffledPositions[i - 1];
            const obj = this.add.image(pos.x, pos.y, `game7_object${i}`)
                .setDepth(505)
                .setInteractive({ draggable: true })
                .setVisible(false);

            obj.objectId = i;
            obj.originalX = pos.x;
            obj.originalY = pos.y;

            this.objects.push(obj);
        }
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // Add dragend event for snapping
        this.input.on('dragend', (pointer, gameObject) => {
            const result = this.findNearestSnapPosition(gameObject.x, gameObject.y, gameObject);
            if (result.snapPos) {
                // Snap to position with animation
                this.tweens.add({
                    targets: gameObject,
                    x: result.snapPos.x,
                    y: result.snapPos.y,
                    duration: 150,
                    ease: 'Power2',
                    onComplete: () => {
                        // Check if all border 1 positions are occupied
                        this.checkIfAllOccupied();
                    }
                });
            } else {
                console.log(`[SNAP] No snap position found within ${this.snapRadius}px radius`);
            }
        });

        this.border1_correctObjects = [1];
        this.border2_correctObjects = [2];
        this.border3_correctObjects = [3];
        // this.drawDebug();

    }

    findNearestSnapPosition(x, y, gameObject = null) {
        let nearestPos = null;
        let nearestIndex = -1;
        let minDistance = this.snapRadius;

        for (let i = 0; i < this.snapPositions.length; i++) {
            const pos = this.snapPositions[i];
            // Skip occupied positions unless it's occupied by the same object (moving within its own slot)
            if (pos.isOccupied) {
                const assignedId = this.positionObjects[i];
                if (!gameObject || assignedId !== gameObject.objectId) {
                    continue;
                }
            }

            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPos = pos;
                nearestIndex = i;
            }
        }

        if (nearestPos && gameObject) {
            // Remove this object from any previous position
            Object.keys(this.positionObjects).forEach(key => {
                if (this.positionObjects[key] === gameObject.objectId) {
                    delete this.positionObjects[key];
                    this.snapPositions[key].isOccupied = false;
                }
            });

            // Track this object at the new position
            this.positionObjects[nearestIndex] = gameObject.objectId;
            nearestPos.isOccupied = true;

            // Debug log for snap positions
            if (nearestIndex >= 0 && nearestIndex <= 1) {
                console.log(`[SNAP] Object ${gameObject.objectId} snapped to snapPosition[${nearestIndex}] at border1`);
            } else if (nearestIndex >= 2 && nearestIndex <= 3) {
                console.log(`[SNAP] Object ${gameObject.objectId} snapped to snapPosition[${nearestIndex}] at border2`);
            } else if (nearestIndex >= 4 && nearestIndex <= 5) {
                console.log(`[SNAP] Object ${gameObject.objectId} snapped to snapPosition[${nearestIndex}] at border3`);
            }
        }

        return { snapPos: nearestPos, index: nearestIndex };
    }

    checkIfAllOccupied() {
        // Check if all 6 positions (3 borders) are occupied
        const allPositions = [0, 1, 2];
        const allOccupied = allPositions.every(i => this.positionObjects.hasOwnProperty(i));

        if (allOccupied) {
            console.log('[CHECK] All positions occupied (all 3 borders)!');
            console.log('[CHECK] Current positions:', this.positionObjects);
            console.log('[CHECK] Click confirm button to check answer');
        }
    }

    enableGameInteraction(enable) {
        this.objects.forEach((obj, index) => {
            obj.setVisible(enable);
            obj.setInteractive(enable);
            if (enable) {
                console.log(`[INTERACTION] Object ${obj.objectId} at (${Math.round(obj.x)}, ${Math.round(obj.y)}) - visible: ${obj.visible}, interactive: ${obj.input ? obj.input.enabled : 'no input'}`);
            }
        });
        if (this.confirmBtn) {
            this.confirmBtn.setVisible(enable);
            console.log(`[INTERACTION] Confirm button visibility: ${enable}`);
        }
    }

    checkAnswer() {
        console.log('[ANSWER] Checking answer...');

        const border1Positions = [0];
        const border1Objects = border1Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        const border2Positions = [1];
        const border2Objects = border2Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);
        const border3Positions = [2];
        const border3Objects = border3Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        // Check if border 1 has all correct objects
        const border1Correct = this.border1_correctObjects.every(objId => border1Objects.includes(objId)) &&
            border1Objects.length === this.border1_correctObjects.length;

        // Check if border 2 has all correct objects
        const border2Correct = this.border2_correctObjects.every(objId => border2Objects.includes(objId)) &&
            border2Objects.length === this.border2_correctObjects.length;

        // Check if border 3 has all correct objects
        const border3Correct = this.border3_correctObjects.every(objId => border3Objects.includes(objId)) &&
            border3Objects.length === this.border3_correctObjects.length;

        if (border1Correct && border2Correct && border3Correct) {
            console.log('[ANSWER] ✓ All objects correctly placed in all borders!');
            this.onRoundWin();
        } else {
            console.log('[ANSWER] ✗ Incorrect placement!');
            this.handleLose();
        }
    }

    handleLose() {
        // Prevent multiple entries
        if (this.gameState === 'gameLose') return;

        this.currentFailCount = (this.currentFailCount || 0) + 1; // Increment fail count

        // Standard Logic
        this.isGameActive = false;
        this.gameState = 'lose';

        this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
        if (this.gameTimer) this.gameTimer.stop();
        this.enableGameInteraction(false);
        this.updateRoundUI(false);
        this.showBubble('tryagain');


    }

    resetForNewRound() {
        // Reset position tracking
        this.positionObjects = {};
        this.snapPositions.forEach(pos => pos.isOccupied = false);

        // Reset objects to original positions
        this.objects.forEach(obj => {
            obj.x = obj.originalX;
            obj.y = obj.originalY;
        });
    }

    showWin() {
        this.objects.forEach(obj => obj.setVisible(false));
        if (this.confirmBtn) this.confirmBtn.setVisible(false);

        if (this.gameUI?.roundStates) {
            this.gameUI.roundStates.forEach(state => state.content.setVisible(false));
        }
        if (this.feedbackLabel) {
            this.feedbackLabel.destroy();
        }
        if (this.label) {
            this.label.destroy();
        }

        if (this.gameTimer && this.gameTimer.destroy) {
            this.gameTimer.destroy();
            this.gameTimer = null;
        }
        if (this.border1) this.border1.setVisible(false);
        if (this.border2) this.border2.setVisible(false);
        if (this.border3) this.border3.setVisible(false);

        const centerY = this.cameras.main.height * 0.8;

        const winDialog = this.add.image(this.centerX, centerY, 'game7_npc_box_win1').setDepth(1001);
        winDialog.setInteractive({ useHandCursor: true });
        winDialog.on('pointerdown', () => {
            winDialog.destroy();
            this.playFinalVideo();
        });
    }

    playFinalVideo() {
        const centerY = this.cameras.main.height * 0.8;
        const video = this.add.video(this.centerX, this.centerY, 'game7_final_video').setDepth(999);
        video.play();

        video.on('complete', () => {
            this.time.delayedCall(1000, () => {
                const finalDialog = this.add.image(this.centerX, centerY, 'game7_final_dialog').setDepth(1002);
                finalDialog.setInteractive({ useHandCursor: true });
                finalDialog.on('pointerdown', () => {
                    finalDialog.destroy();
                    this.showWinPreview();
                });
            });
        });
    }

    showWinPreview() {
        this.winPreview = this.add.image(960, 540, 'game7_final_preview1').setDepth(2000).setVisible(true)
            .setInteractive({ useHandCursor: true });
        this.winPreview.on('pointerdown', () => {
            this.winPreview.destroy();

            this.winPreview2 = this.add.image(960, 540, 'game7_final_preview2').setDepth(2000).setVisible(true)
                .setInteractive({ useHandCursor: true });
            this.winPreview2.on('pointerdown', () => {
                this.winPreview2.destroy();
                GameManager.switchToGameScene(this, 'GameResultScene');
            });
        });
    }

    drawDebug() {

        // Debug graphics - draw snap positions
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        this.debugGraphics.fillStyle(0xff0000, 0.2);
        this.snapPositions.forEach(pos => {
            this.debugGraphics.strokeCircle(pos.x, pos.y, 80); // Draw outer circle
            this.debugGraphics.fillCircle(pos.x, pos.y, 5); // Draw center point
        });
        this.debugGraphics.setDepth(999); // Just below borders

    }
}
