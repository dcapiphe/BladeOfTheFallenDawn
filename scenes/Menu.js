class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
    this.load.image('menu-bg', '/assets/background/MainMenu/MainMenu.png');
    this.load.image('start-button', '/assets/background/MainMenu/start_button.png');
    this.load.image('controls-button', '/assets/background/MainMenu/controls_button.png');
    this.load.image('about-button', '/assets/background/MainMenu/about_button.png');
    this.load.spritesheet('player', '/assets/sprites/player/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.audio('bgMusic', '/assets/audio/menu_music.mp3');
  }

  create() {
    this.add.image(512, 300, 'menu-bg').setOrigin(0.5, 0.5); 
    this.player = this.add.sprite(650,300, 'key');
    this.player.setScale(5); 

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {frames: [0,1,2,3,4,5,6,7]}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {frames: [14,16,17,18,19,20,21]}),
      frameRate: 10,
      repeat: -1
    });

    this.player.play('idle');
    this.cursors = this.input.keyboard.createCursorKeys();


    // Start Button
    const startBtn = this.add.image(234, 230, 'start-button').setInteractive().setScale(0.17);
    startBtn.on('pointerdown', () => {
      this.scene.start('Level1'); 
    });

    // Controls Button 
    const controlsBtn = this.add.image(234, 340, 'controls-button').setInteractive().setScale(0.17);
    controlsBtn.on('pointerdown', () => {
      console.log('Controls button clicked');
      this.scene.start('Controls'); 
    });

    // About Button 
    const aboutBtn = this.add.image(234, 453, 'about-button').setInteractive().setScale(0.17);
    aboutBtn.on('pointerdown', () => {
      console.log('About button clicked');
      this.scene.start('About');
    });

    if (!this.sound.get('bgMusic')) {
    const music = this.sound.add('bgMusic', {
        loop: true,
        volume: 0.8
    });
    music.play();

    // Store globally
    this.game.bgMusic = music;
    }
}

    update() {
    if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
    if (this.player.anims.currentAnim.key !== 'run') {
        this.player.play('run');
    }

      // Flip based on direction
      this.player.flipX = this.cursors.left.isDown;
    } else {
      if (this.player.anims.currentAnim.key !== 'idle') {
        this.player.play('idle');
      }
    }
  }
}
