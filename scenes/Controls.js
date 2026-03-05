class Controls extends Phaser.Scene {
  constructor() {
    super('Controls');
  }

    preload() {
        this.load.image('controls-bg', '/assets/background/MainMenu/Controls.png');
        this.load.image('back-button', '/assets/background/MainMenu/back_button.png');
    }

    create(){
        this.add.image(512, 300, 'controls-bg').setOrigin(0.5, 0.5); // centered

        this.backButton = this.add.image(120, 50, 'back-button').setInteractive().setScale(0.1);
        this.backButton.on('pointerdown', () => {
            console.log('Back button clicked');
            this.scene.start('Menu'); 
        });
    }

}