class Level2 extends Phaser.Scene {
  constructor() {
    super('Level2');
  }

    preload() {
    //load json files
    this.load.tilemapTiledJSON('level2', '/assets/tilemaps/level2.json');

    //load images
    this.load.image('dungeon', '/assets/background/lvl2assets/castletileset.png');
    this.load.image('door', '/assets/background/lvl2assets/dungeondoor.png');
    this.load.image('exitdoor', '/assets/background/lvl2assets/dungeondoor.png');
    this.load.image('vprops', '/assets/background/lvl2assets/villageprops.png');
    this.load.image('decor', '/assets/background/lvl2assets/decor.png');
    this.load.image('spikes', '/assets/background/lvl2assets/spikes.png');
    this.load.image('bg1', '/assets/background/lvl3assets/bglayer5.png');
    this.load.image('heart', '/assets/sprites/player/heart.png');


    //load spritesheets
    this.load.spritesheet('player', '/assets/sprites/player/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime', '/assets/sprites/enemies/slime.png', { frameWidth: 32, frameHeight: 32 });

    //load audio
    this.load.audio('level2-music', '/assets/audio/lvl2_music.mp3');
    this.load.audio('swordSlash', '/assets/audio/sfx/sword_slash.mp3');
    this.load.audio('slimeHit', '/assets/audio/sfx/slime_hit.mp3');
    this.load.audio('playerHurt', '/assets/audio/sfx/player_hurt.mp3');
    this.load.audio('jump', '/assets/audio/sfx/jump.mp3');
    this.load.audio('pop', '/assets/audio/sfx/pop.mp3');
    }

    create() {
    this.jumpCount = 0;
    this.maxJumps = 1;

    const map = this.make.tilemap({ key: 'level2', tileWidth: 32, tileHeight: 32 });

    //SFX
    this.sfxSlash = this.sound.add('swordSlash', { volume: 0.5 });
    this.sfxSlime = this.sound.add('slimeHit',   { volume: 0.7 });
    this.sfxHurt = this.sound.add('playerHurt', { volume: 0.5 });
    this.jump = this.sound.add('jump',{ volume: 0.5 });
    this.pop = this.sound.add('pop',{ volume: 0.5 });

    //TILESETS
    const backgroundTileset = map.addTilesetImage('bg', 'bg1');
    const dungeonTileset = map.addTilesetImage('castletileset', 'dungeon');
    const dungeonPropsTileset = map.addTilesetImage('villageprops', 'vprops');
    const dungeonDecorTileset = map.addTilesetImage('decor', 'decor');
    const dungeonDecor2Tileset = map.addTilesetImage('decor', 'decor');

    //LAYERS
    const backgroundLayer = map.createLayer('Background', backgroundTileset);
    const dungeonLayer = map.createLayer('DungeonBackground', dungeonTileset);
    const dungeonPropsLayer = map.createLayer('DungeonProps', dungeonPropsTileset);
    const dungeonFloorLayer = map.createLayer('DungeonFloor', dungeonTileset);
    const dungeonDecor2Layer = map.createLayer('DungeonDecor2', dungeonDecor2Tileset);
    const dungeonDecorLayer = map.createLayer('DungeonDecor', dungeonDecorTileset);

    //OBJECTS
    this.spikes = this.physics.add.staticGroup();
    const spikeObjects = map.getObjectLayer('Spikes').objects;
    spikeObjects.forEach((obj) => {
      const spike = this.spikes.create(obj.x, obj.y - obj.height,'spikes');
      spike.setOrigin(0, 0);
      spike.body.setSize(obj.width, 16);
      spike.body.setOffset(16,16);
    });

    this.updSpikes = this.physics.add.staticGroup();
    const updSpikeObjects = map.getObjectLayer('UpsideDownSpikes').objects;
    updSpikeObjects.forEach((obj) => {
      const updSpike = this.updSpikes.create(obj.x, obj.y - obj.height,'spikes');
      updSpike.setOrigin(1, -1);
      updSpike.body.setSize(obj.width, 16);
      updSpike.body.setOffset(-15,63);
      updSpike.flipY = true
    });

    this.time.addEvent({
      delay: 1100, 
      loop: true,
      callback: () => {
        this.updSpikes.children.iterate(spike => {
          if (!spike) return;
          const isVisible = spike.visible;

          //toggle visibility
          spike.setVisible(!isVisible);

          //toggle collision
          spike.body.enable = !isVisible;
        });
      }
    });

    //ENTRANCE DOOR
    this.door = this.physics.add.staticGroup();
        const doorObjects = map.getObjectLayer('Door').objects;
        doorObjects.forEach((obj) => {
          const door = this.door.create(obj.x, obj.y - obj.height, 'door');
          door.setOrigin(0, 0);
        });

    //EXIT DOOR
    this.exitDoor = this.physics.add.staticGroup();
        const exitDoorObjects = map.getObjectLayer('ExitDoor').objects;
        exitDoorObjects.forEach((obj) => {
          const exitDoor = this.exitDoor.create(obj.x, obj.y - obj.height, 'exitdoor');
          exitDoor.setOrigin(0, 0);
          exitDoor.body.setSize(obj.width, obj.height);
          exitDoor.body.setOffset(16, 16);
        });

    // HP PICKUPS
      this.heartPickups = this.physics.add.staticGroup();
      const heartObjects = map.getObjectLayer('HeartPickups').objects;

      heartObjects.forEach(obj => {
        const heart = this.heartPickups.create(obj.x, obj.y - obj.height, 'heart');
        heart.setOrigin(0, 0);
        heart.setScale(1); 
        heart.refreshBody();
      });
    

    //SPRITES
    this.player = this.physics.add.sprite(50,300, 'player'); //player

    //ENEMY GROUP SETUP
    this.enemies = this.physics.add.group();

    const slimePositions = [
      { x: 600, y: 300 },
      { x: 1000, y: 300 },
      { x: 1760, y: 300 },
      { x: 2195, y: 300 },
      { x: 2520, y: 300 },
      { x: 2903, y: 176 },
      { x: 3271, y: 336 },
      { x: 3823, y: 112 },
      { x: 5282, y: 336 },
      { x: 6016, y: 336 },
      { x: 2215, y: 592 },
      { x: 4624, y: 339 },
      { x: 6016, y: 336 }
    ];


    //SLIME PROPERTIES
    slimePositions.forEach(pos => {
      const slime = this.enemies.create(pos.x, pos.y, 'slime');
      slime.health = 2;
      slime.isDead = false;
      slime.setCollideWorldBounds(true);
      slime.setSize(16,16);
      slime.setOffset(8,16);
      slime.minX = slime.x - 50;
      slime.maxX = slime.x + 50;
      slime.patrolDirection = 'left';
    });

    //CAMERA
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.2);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    //PLAYER COLLISIONS & PROPERTIES
    dungeonFloorLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, dungeonFloorLayer);
    this.physics.add.collider(this.enemies, dungeonFloorLayer);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
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

    //LAYER COLLISIONS
    this.physics.add.overlap(this.player, this.spikes, this.hitSpike, null, this); //spikes collisions
    this.physics.add.overlap(this.player, this.updSpikes, this.hitSpike, null, this); //upside down spikes collisions
    this.physics.add.overlap(this.player, this.exitDoor, this.reachGoal, null, this); // exit door collisions
    this.physics.add.overlap(this.player, this.heartPickups, this.collectHeart, null, this); //hp pickup collision
    dungeonFloorLayer.setCollisionBetween(1,500);

    // ATTACK HITBOX (STATIC)
    this.attackHitbox = this.add.zone(this.player.x, this.player.y, 15, 20);
    this.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);
    this.attackHitbox.body.enable = false;

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
      repeat: 0
    });

    //ENEMY KEY ANIMATIONS
    this.anims.create({
      key: 'walk-slime',
      frames: this.anims.generateFrameNumbers('slime', {frames: [65,66,67,68,69,70]}),
      frameRate: 6,
      repeat: -1
    })

    this.anims.create({
      key: 'idle-slime',
      frames: this.anims.generateFrameNumbers('slime', {frames: [81,82,84,85]}),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'attack-slime',
      frames: this.anims.generateFrameNumbers('slime', {frames: [97,98,99,100,101]}),
      frameRate: 6, 
      repeat: -1
    });
                       
    this.anims.create({
      key: 'death-slime',
      frames: this.anims.generateFrameNumbers('slime', {frames: [112,113,114,115,116,117,118,119,120]}),
      frameRate: 6, 
      repeat: 0
    });

    this.anims.create({
      key: 'hit-slime',
      frames: this.anims.generateFrameNumbers('slime', {frames: [48,50,51]}),
      frameRate: 3, 
      repeat: 0
    });

    //KEYBINDS
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isAttacking = false;
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    //BGM MUSIC
    this.game.level2Music = this.sound.add('level2-music', { loop: true, volume: 0.2 });
    this.game.level2Music.play();
    }

    update() {
      const onGround = this.player.body.onFloor();
      const isFalling = this.player.body.velocity.y > 0;
      const isJumping = this.player.body.velocity.y < 0;
        console.log('Player X:', this.player.x);
        console.log('Player Y:', this.player.y);

      //PLAYER MOVEMENT
      if (this.cursors && this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.flipX = true;
      } else if (this.cursors && this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
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

        this.time.delayedCall(150, () => {
          this.checkAttackHit(); 
        });

        this.player.once("animationcomplete-attack", () => {
          this.attackHitbox.body.enable = false;
          this.attackHitbox.setVisible(false);
          this.isAttacking = false;
        });
    }

  //ENEMY PATROL MOVEMENT
  this.enemies.getChildren().forEach(enemy => {
  if (enemy.isDead) return;

  //PATROL or CHASE depending on player distance
  const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
  const isNear = distance < 125;

  if (!isNear && !enemy.isHit) {
      // PATROL LOGIC
      if (!enemy.patrolDirection) {
        enemy.patrolDirection = 'left';
        enemy.minX = enemy.x - 50;
        enemy.maxX = enemy.x + 50;
      }

      if (enemy.patrolDirection === 'left') {
        enemy.setVelocityX(-50);
        enemy.flipX = false;
        if (enemy.x <= enemy.minX) {
          enemy.patrolDirection = 'right';
        }
      } else {
        enemy.setVelocityX(50);
        enemy.flipX = true;
        if (enemy.x >= enemy.maxX) {
          enemy.patrolDirection = 'left';
        }
      }

      if (enemy.anims.currentAnim?.key !== 'walk-slime') {
        enemy.play('walk-slime', true);
      }
    }

    if (isNear && !enemy.isHit) {
      const direction = this.player.x < enemy.x ? -1 : 1;
      enemy.setVelocityX(60 * direction);
      enemy.flipX = direction === -1;

      if (enemy.anims.currentAnim?.key !== 'walk-slime') {
        enemy.play('walk-slime', true);
      }
    }
});

  //ENEMY CHASING PLAYER WHEN NEAR
  this.enemies.getChildren().forEach(enemy => {
  if (enemy.isDead || enemy.isHit) return;

  const isPlayerNear = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 125;

  if (isPlayerNear) {
    const direction = this.player.x < enemy.x ? -1 : 1;
    enemy.setVelocityX(60 * direction);
    enemy.flipX = direction === 1;
    if (enemy.anims.currentAnim?.key !== 'walk-slime') {
      enemy.play('walk-slime', true);
    }
  } else {
    // Patrol movement
    if (enemy.patrolDirection === 'left') {
      enemy.setVelocityX(-50);
      if (enemy.x <= enemy.minX) {
        enemy.patrolDirection = 'right';
      }
    } else {
      enemy.setVelocityX(50);
      if (enemy.x >= enemy.maxX) {
        enemy.patrolDirection = 'left';
      }
    }

    if (enemy.anims.currentAnim?.key !== 'walk-slime') {
      enemy.play('walk-slime', true);
    }
  }});
    //DEADZONE Y CHECK (FOR ENEMIES FALLING OF THE MAP)
    this.enemies.getChildren().forEach(enemy => {
    if (!enemy.isDead && enemy.y > 621) {
      enemy.isDead = true;
      enemy.destroy(); 
    }
});
}

  checkAttackHit() {
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.isDead) return;

      const hit = Phaser.Geom.Intersects.RectangleToRectangle(
        this.attackHitbox.getBounds(),
        enemy.getBounds()
      );

      if (hit) {
        this.sfxSlash.play();     // slash sound on each hit
        this.sfxSlime.play();     // add slime squish for flavor
        enemy.health--;
    
        //add knockback
        const knockbackForce = 50;
        const direction = (enemy.x < this.player.x) ? -1 : 1;
        enemy.setVelocityX(knockbackForce * direction);
        enemy.isHit = true;

      
        this.time.delayedCall(100, () => {
          if (!enemy.isDead) enemy.clearTint();
        });

    if (enemy.health <= 0) {
      enemy.isDead = true;
      enemy.play('death-slime');
      enemy.body.enable = false;
      enemy.once('animationcomplete-death-slime', () => {
        enemy.destroy();
      });
    } else {
      enemy.play('hit-slime');

      //stop knockback after hit animation
      enemy.once('animationcomplete-hit-slime', () => {
        if (!enemy.isDead) {
          enemy.setVelocityX(0);
          enemy.isHit = false;
        }
      });
    }
  }
});
}
    
  damagePlayer() {
    //player grunt sfx
    if (this.sfxHurt) {
      this.sfxHurt.play();
    }

    if (this.currentHearts > 0) {
      this.currentHearts--;
      this.heartIcons[this.currentHearts].setVisible(false);
    }

    if (this.currentHearts <= 0) {
      this.isDead = true;

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
      if (this.game.level2Music && this.game.level2Music.isPlaying) {
      this.game.level2Music.stop();
      this.game.level2Music = null;
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

  onPlayerHit(player, enemy) {
    if (enemy.isDead || enemy.isHit) return;
    if (this.player.invulnerable) return;
    this.damagePlayer();
    this.player.invulnerable = true;
    this.player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
      this.player.clearTint();
      this.player.invulnerable = false;
    });
  }

  hitSpike(player, spike) {
    //disables player controls and physics
    this.cursors = null;
    this.attackKey.enabled = false;

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    if (this.player.anims) {
      this.player.play('death'); 
    }

    //flash red
    this.player.setTint(0xff0000);

    //fade out effect once player dies
    this.cameras.main.fade(1000, 0, 0, 0);

    if (this.game.level2Music && this.game.level2Music.isPlaying) {
      this.game.level2Music.stop();
      this.game.level2Music = null;
  }

    //restart scene
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOver', { previousLevel: this.scene.key });
    });
  }

  collectHeart(player, heart) {
    if (this.currentHearts < this.maxHearts) {
      // add hp
      this.heartIcons[this.currentHearts].setVisible(true);
      this.currentHearts++;
    }

    // heart pickup dissapears after pickup
    this.pop.play();
    heart.destroy();
  }

reachGoal(player, exitDoor) {
  if (this.game.level2Music && this.game.level2Music.isPlaying) {
    this.game.level2Music.stop();
    this.game.level2Music = null;
  }
    this.scene.start('Level3');
  }
}