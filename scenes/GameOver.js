class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

    preload() {
        this.load.image('gameover-bg', '/assets/background/GameOver/gameover.png');
        this.load.image('mainmenu-button', '/assets/background/GameOver/mainmenu.png');
        this.load.image('restart-button', '/assets/background/GameOver/restart.png');
    }

    create(data){
        this.previousLevel = data.previousLevel || 'Level1'; 

        this.add.image(512, 300, 'gameover-bg').setOrigin(0.5, 0.5); // centered

        this.mainMenu = this.add.image(500, 400, 'mainmenu-button').setInteractive().setScale(0.15);
        this.mainMenu.on('pointerdown', () => {
            this.scene.start('Menu'); 
        });

        this.restart = this.add.image(500, 500, 'restart-button').setInteractive().setScale(0.15);
        this.restart.on('pointerdown', () => {
            this.scene.start(this.previousLevel); 
        });
    }

}