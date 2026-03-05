class Congratulations extends Phaser.Scene {
  constructor() {
    super('Congratulations');
  }

    preload() {
        this.load.image('congratulations-bg', '/assets/background/Congratulations/congratulations.png');
        this.load.image('playagain-button', '/assets/background/Congratulations/playagain.png');
    }

    create(){
        this.add.image(512, 300, 'congratulations-bg').setOrigin(0.5, 0.5); 

        this.playAgain = this.add.image(500, 360, 'playagain-button').setInteractive().setScale(0.18);
        this.playAgain.on('pointerdown', () => {
            if (this.game.level3Music && this.game.level3Music.isPlaying) {
              this.game.level3Music.stop();
            }
            this.scene.start('Menu'); 
        });
    }

}