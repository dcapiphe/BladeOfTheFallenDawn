class Level3 extends Phaser.Scene {
  constructor() {
    super('Level3');
  }

  preload() {
    //load json files
    this.load.tilemapTiledJSON('level3', '/assets/tilemaps/level3.json');

    //load images
    this.load.image('bg1', '/assets/background/lvl3assets/bglayer5.png');
    this.load.image('bgl2', '/assets/background/lvl3assets/bglayer1.png');
    this.load.image('floor', '/assets/background/lvl3assets/floortiles.png');
    this.load.image('snowflake', '/assets/particles/snowflake.png');
    this.load.image('heart', '/assets/sprites/player/heart.png');
    this.load.image('fireball', '/assets/particles/fireball.png');
    
    //load spritesheets
    this.load.spritesheet('player', '/assets/sprites/player/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('boss', '/assets/sprites/enemies/boss.png', { frameWidth: 224, frameHeight: 240 });

    //load audio
    this.load.audio('level3-music', '/assets/audio/lvl3_music.mp3');
    this.load.audio('playerHurt', '/assets/audio/sfx/player_hurt.mp3');
    this.load.audio('bossVFX', '/assets/audio/sfx/boss_vfx.mp3');
    this.load.audio('bossShoot', '/assets/audio/sfx/boss_shoot.mp3');
    this.load.audio('jump', '/assets/audio/sfx/jump.mp3');
    this.load.audio('swordSlash', '/assets/audio/sfx/sword_slash.mp3');
  }


  create() {
    this.jumpCount = 0;
    this.maxJumps = 1;
    
    const map = this.make.tilemap({ key: 'level3', tileWidth: 32, tileHeight: 32 });

    //SFX
    this.sfxHurt = this.sound.add('playerHurt', { volume: 0.5 });
    this.sfxBossVFX = this.sound.add('bossVFX', { volume: 0.5 });
      this.sfxBossVFX.play();
    this.sfxBossShoot = this.sound.add('bossShoot', { volume: 1 });
    this.jump = this.sound.add('jump',{ volume: 0.5 });
    this.sfxSlash = this.sound.add('swordSlash', { volume: 0.5 });

    //TILESETS
    const backgroundTileset = map.addTilesetImage('bg', 'bg1');
    const backgroundTileset2 = map.addTilesetImage('bg2', 'bgl2');
    const floorTileset = map.addTilesetImage('floor1', 'floor');

    //LAYERS
    const backgroundLayer = map.createLayer('Background', backgroundTileset);
    const backgroundLayer2 = map.createLayer('BG2', backgroundTileset2);
    const groundLayer = map.createLayer('Ground', floorTileset);
   
    //PLAYER COLLISIONS & PROPERTIES
    this.player = this.physics.add.sprite(25,300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setOffset(2, 2);
    this.player.setSize(9, 25);

    //PLAYER HEALTH
    this.maxHearts = 5;
    this.currentHearts = this.maxHearts;
    this.heartIcons = [];
    for (let i = 0; i < this.maxHearts; i++) {
      const heart = this.add.image(30 + i * 40, 30, 'heart').setScrollFactor(0);
      heart.setScale(1);
      heart.setOrigin(-2,-0.6);
      this.heartIcons.push(heart);
    }

    //BOSS
    this.boss = this.physics.add.sprite(500, 300, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.setImmovable(true);
    this.boss.setSize(40, 150);
    this.boss.setOffset(92, 80);
    this.boss.body.setAllowGravity(false);
    
    //BOSS HEALTH
    this.boss.health = 30;
    this.maxBossHealth = 30;
    this.boss.health = this.maxBossHealth;
    this.bossHealthBarBG = this.add.graphics().setScrollFactor(0);
    this.bossHealthBarBG.fillStyle(0x000000, 0.8);
    this.bossHealthBarBG.fillRect(400, 80, 200, 20); // background bar
  
    this.bossHealthBar = this.add.graphics().setScrollFactor(0);
    this.updateBossHealthBar(); // draw the red health bar

    this.bossLabel = this.add.text(443, 50, 'ENIGMA', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: 'black',
      padding: { x: 10, y: 5 },
      align: 'center'
    }).setScrollFactor(0);

    //FIREBALL
    this.bossAttackRange = 300;
    this.fireballs = this.physics.add.group();

    //FIREBALL LOOP
    this.time.addEvent({
      delay: 2000, // every 2 seconds
      callback: () => this.shootFireball(),
      loop: true
    });

    //PLAYER COLLISIONS & PROPERTIES
    groundLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, groundLayer);
    this.physics.add.collider(this.boss, groundLayer);
    this.physics.add.overlap(this.player, this.fireballs, this.onFireballHit, null, this); //Player and fireball collision
    
    //LAYER COLLISIONS
    groundLayer.setCollisionBetween(50,1000);
 
    // ATTACK HITBOX (STATIC)
    this.attackHitbox = this.add.zone(this.player.x, this.player.y, 15, 20);
    this.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);
    this.attackHitbox.body.enable = false;
    this.attackHitbox.setVisible(false); // Set to true for debugging
    this.attackHitbox.setSize(10, 20);
    
    //PLAYER KEY ANIMATIONS
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {frames: [14,16,17,18,19,20,21]}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {frames: [0,1,2,3,4,5,6,7]}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('player', {frames: [42,43,44]}),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', {frames: [56,57,58,59]}),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'fall',
      frames: this.anims.generateFrameNumbers('player', {frames: [70,71,72,73]}),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'ghit',
      frames: this.anims.generateFrameNumbers('player', {frames: [84,85]}),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('player', {frames: [98,100,101,102,103,104,105,106,107,108,109,110,111]}),
      frameRate: 6,
      repeat: -1
    });

    //BOSS KEY ANIMATIONS
    this.anims.create({
      key: 'idle-boss',
      frames: this.anims.generateFrameNumbers('boss', {frames: [0,1,2,3,4,5,6,7]}),
      frameRate: 5,
      repeat: -1
    });
    this.boss.play('idle-boss');
  
    //SNOW PARTICLES
    this.snowParticles = this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: this.scale.width },
      y: 0,
      lifespan: 5000,
      speedY: { min: 25, max: 90 },
      scale: { start: 0.05, end: 0.1 },
      alpha: { start: 1, end: 0 },
      quantity: 3,
      frequency: 100,
      blendMode: 'NORMAL'
    });
    this.snowParticles.setScrollFactor(0);

    //CAMERA
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.2);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //KEYBINDS
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isAttacking = false;
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    //BGM MUSIC
    this.game.level3Music = this.sound.add('level3-music', { loop: true, volume: 0.1 });
    this.game.level3Music.play();
  }

  update() {
  const onGround = this.player.body.onFloor();
  const isFalling = this.player.body.velocity.y > 0;
  const isJumping = this.player.body.velocity.y < 0;
  
  //PLAYER MOVEMENT
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-160);
    this.player.flipX = true;
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(160);
    this.player.flipX = false;
  } else {
    this.player.setVelocityX(0);
  } 
  if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
    if (onGround || this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(-400);
      this.jump.play();
      this.jumpCount++;
    }
}
  //JUMP COUNTER
  if (onGround) {
    this.jumpCount = 0;
  }

  if (!this.isAttacking) {
  if (!onGround) {
    if (isJumping && this.player.anims.currentAnim?.key !== "jump") {
      this.player.play("jump", true);
    } else if (isFalling && this.player.anims.currentAnim?.key !== "fall") {
      this.player.play("fall", true);
    }
  } else {
    if (this.player.body.velocity.x !== 0 && this.player.anims.currentAnim?.key !== "run") {
      this.player.play("run", true);
    } else if (this.player.body.velocity.x === 0 && this.player.anims.currentAnim?.key !== "idle") {
      this.player.play("idle", true);
    }
  }
}
  //ATTACK
  if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
    this.isAttacking = true;
    this.player.setVelocityX(0);
    this.player.play("attack");
    this.sfxSlash.play();

    const offsetX = this.player.flipX ? -30 : 30;
    this.attackHitbox.setPosition(this.player.x + offsetX, this.player.y);
    this.attackHitbox.body.enable = true;
    this.attackHitbox.setVisible(true);
    this.attackHitbox.setPosition(this.player.x + offsetX, this.player.y + 5);

    this.time.delayedCall(150, () => {
      this.checkAttackHit(); // Call hit check mid-animation
    });

    this.player.once("animationcomplete-attack", () => {
      this.attackHitbox.body.enable = false;
      this.attackHitbox.setVisible(false);
      this.isAttacking = false;
    });
  }

  //BOSS MOVEMENT 
  if (this.boss && this.boss.active) {
  const time = this.time.now / 1000;

  //HOVER
  const baseY = 250;
  const amplitude = 20;
  this.boss.y = baseY + Math.sin(time * 2) * amplitude;

  //BOSS PATROL
  if (!this.bossDirection) {
    this.boss.minX = this.boss.x - 50;
    this.boss.maxX = this.boss.x + 50;
    this.bossDirection = 'left';
  }

  if (this.bossDirection === 'left') {
    this.boss.setVelocityX(-30);
    if (this.boss.x <= this.boss.minX) this.bossDirection = 'right';
  } else {
    this.boss.setVelocityX(30);
    if (this.boss.x >= this.boss.maxX) this.bossDirection = 'left';
  }
}

  //FIREBALL ROTATION
  this.fireballs.getChildren().forEach(fireball => {
    fireball.rotation += 0.05; 
  });
}

checkAttackHit() {
  const hitBoss = Phaser.Geom.Intersects.RectangleToRectangle(
  this.attackHitbox.getBounds(),
  this.boss.getBounds()
);

  if (hitBoss && this.boss.active && this.boss.health > 0) {
    this.cameras.main.shake(150, 0.005); //camera shake when hit
    this.boss.health--;
    this.updateBossHealthBar();
    this.sfxBossVFX.play();

    this.boss.setTint(0xff9999);
    this.time.delayedCall(100, () => {
      this.boss.clearTint();
    });

  if (this.boss.health <= 0) {
    this.physics.world.timeScale = 0.3;
    this.cameras.main.shake(200, 0.01);

    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      duration: 800,
      ease: 'Linear',
      onComplete: () => {
        this.boss.destroy();
        this.physics.world.timeScale = 1;

        this.time.delayedCall(500, () => {
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Congratulations');
          });
        });
      }
    });
  }
}
}

updateBossHealthBar() {
  const healthRatio = this.boss.health / this.maxBossHealth;
  this.bossHealthBar.clear();
  this.bossHealthBar.fillStyle(0xff0000); // red bar
  this.bossHealthBar.fillRect(400, 80, 200 * healthRatio, 20);
}


damagePlayer() {
    //camera shake when hit
    this.cameras.main.shake(200, 0.01); 

    //player grunt sfx
    if (this.sfxHurt) {
      this.sfxHurt.play();
    }
    //minus hearts
    if (this.currentHearts > 0) {
      this.currentHearts--;
      this.heartIcons[this.currentHearts].setVisible(false);
    }

    if (this.currentHearts <= 0) {
      // disabled movement
      this.player.setVelocity(0, 0);
      this.player.body.enable = false;

      // play death animation
      if (this.player.anims) {
        this.player.play('death');
      }

      // flash red
      this.player.setTint(0xff0000);

      // fade out effect
      this.cameras.main.fade(1000, 0, 0, 0);

      // stop level music
      if (this.game.level3Music && this.game.level3Music.isPlaying) {
      this.game.level3Music.stop();
      this.game.level3Music = null;
  }

      // restart scene
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOver', { previousLevel: this.scene.key });
      });
    } else {
      this.player.setTint(0xff0000);
      this.time.delayedCall(300, () => {
        this.player.clearTint();
      });
    }
}

shootFireball() {
  if (!this.boss.active || !this.player.active) return;

  const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
  if (distance > this.bossAttackRange) return;

  const baseAngle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
  const speed = 200;

  const fireBullet = (angleOffset = 0) => {
    const angle = baseAngle + angleOffset;
    const fireball = this.fireballs.create(this.boss.x, this.boss.y, 'fireball');
    fireball.setScale(0.415 / 2);
    fireball.body.setAllowGravity(false);
    fireball.body.setCircle(50,70,70); // smaller hitbox for fairness
    fireball.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  };

  this.sfxBossShoot.play();

  if (this.boss.health > 20) {
    // PHASE 1: 1 FIREBALL
    fireBullet();
  } else if (this.boss.health > 10) {
    // PHASE 2: 2 FIREBALLS
    fireBullet(Phaser.Math.DegToRad(10)); 
    fireBullet(Phaser.Math.DegToRad(-10)); 
  } else {
    // PHASE 3: 3 FIREBALLS
    fireBullet(); 
    fireBullet(Phaser.Math.DegToRad(20)); 
    fireBullet(Phaser.Math.DegToRad(-20)); 
  }
}

onFireballHit(player, fireball) {
  fireball.destroy(); 
  this.damagePlayer(); 
}

  
reachGoal(player, door) {
    if (this.game.level3Music && this.game.level3Music.isPlaying) {
      this.game.level3Music.stop();
      this.game.level3Music = null;
}
    this.scene.start('Congratulations');
  }
}


