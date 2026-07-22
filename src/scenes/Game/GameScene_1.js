
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_1 extends BaseGameScene {
    constructor() {
        super('GameScene_1');
    }

    preload() {

        const path = 'assets/images/Game_1/';

        this.load.image('game1_npc_box_win', `${path}game1_npc_box2.png`);
        this.load.image('game1_npc_box_tryagain', `${path}game1_npc_box3.png`);
        // UI buttons
        this.load.image('game1_confirm_button', `${path}game1_confirm_button.png`);
        this.load.image('game1_confirm_button_select', `${path}game1_confirm_button_select.png`);


        for (let i = 1; i <= 5; i++) {
            this.load.image(`game1_q${i}`, `${path}game1_q${i}.png`);
            this.load.image(`game1_q${i}_description`, `${path}game1_q${i}_description.png`);
            this.load.image(`game1_q${i}_a_button`, `${path}game1_q${i}_a_button.png`);
            this.load.image(`game1_q${i}_b_button`, `${path}game1_q${i}_b_button.png`);
            this.load.image(`game1_q${i}_c_button`, `${path}game1_q${i}_c_button.png`);
            this.load.image(`game1_q${i}_d_button`, `${path}game1_q${i}_d_button.png`);

            this.load.image(`game1_q${i}_a_button_select`, `${path}game1_q${i}_a_button_select.png`);
            this.load.image(`game1_q${i}_b_button_select`, `${path}game1_q${i}_b_button_select.png`);
            this.load.image(`game1_q${i}_c_button_select`, `${path}game1_q${i}_c_button_select.png`);
            this.load.image(`game1_q${i}_d_button_select`, `${path}game1_q${i}_d_button_select.png`);
        }

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game1_q${i}_title`, `${path}game1_q${i}_title.png`);
        }
    }

    create() {

        // Pass null for bgKey since using video background
        this.initGame('game1_bg', 'game1_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 30,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 1
        });
    }

    setupGameObjects() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
            this.questionPanel = null;
        }

        const allQuestions = [
            {
                question: 'game1_q1',
                description: 'game1_q1_description',
                options: ['game1_q1_a_button', 'game1_q1_b_button', 'game1_q1_c_button', 'game1_q1_d_button'],
                answer: 1,

            },
            {
                question: 'game1_q2',
                description: 'game1_q2_description',
                options: ['game1_q2_a_button', 'game1_q2_b_button', 'game1_q2_c_button', 'game1_q2_d_button'],
                answer: 2,

            },
            {
                question: 'game1_q3',
                description: 'game1_q3_description',
                options: ['game1_q3_a_button', 'game1_q3_b_button', 'game1_q3_c_button', 'game1_q3_d_button'],
                answer: 1,

            }, {
                question: 'game1_q4',
                description: 'game1_q4_description',
                options: ['game1_q4_a_button', 'game1_q4_b_button', 'game1_q4_c_button', 'game1_q4_d_button'],
                answer: 3,
            },
            {
                question: 'game1_q5',
                description: 'game1_q5_description',
                options: ['game1_q5_a_button', 'game1_q5_b_button', 'game1_q5_c_button', 'game1_q5_d_button'],
                answer: 2,
            }
        ]

        this.questionPanel = new QuestionPanel(this, allQuestions, () => {
        });
        this.questionPanel.setDepth(559).setVisible(false);
    }

    enableGameInteraction(enable) {
        if (this.questionPanel) {
            this.questionPanel.setVisible(enable);
        }
    }

    resetForNewRound() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
        }
        this.setupGameObjects(); // 重新抽題並建立 Panel
        this.questionPanel.setVisible(true);
        this.video?.destroy();
    }

    showWin() {
        this.questionPanel.setVisible(false);

    }
    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game1_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }
}
