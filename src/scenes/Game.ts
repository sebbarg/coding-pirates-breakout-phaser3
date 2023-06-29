import Phaser from 'phaser';

// Phaser3 port of https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser

export default class BreakOut extends Phaser.Scene {
  private ball!: Phaser.Physics.Arcade.Sprite;
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private bricks!: Phaser.GameObjects.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private livesText!: Phaser.GameObjects.Text;
  private lifeLostText!: Phaser.GameObjects.Text;
  private lives = 0;
  private playing = false;
  private startButton!: Phaser.GameObjects.Sprite;

  //

  constructor() {
    super('GameScene');
  }

  //

  preload(): void {
    this.load.image('ball', 'assets/ball.png');
    this.load.image('paddle', 'assets/paddle.png');
    this.load.image('brick', 'assets/brick.png');
    this.load.spritesheet('wobble', 'assets/wobble.png', { frameWidth: 20, frameHeight: 20 });
    this.load.spritesheet('button', 'assets/button.png', { frameWidth: 120, frameHeight: 40 });
  }

  //

  create(): void {
    this.physics.world.checkCollision.down = false;

    //
    // Ball
    //
    this.ball = this.physics.add.sprite(
      this.physics.world.bounds.width * 0.5,
      this.physics.world.bounds.height - 25,
      'ball',
    );

    this.ball.setCollideWorldBounds(true);
    this.ball.body.bounce.set(1);

    //
    // Ball collision animation
    //
    // const frames = this.anims.generateFrameNumbers('wobble', { start: 0, end: 2 });
    const frames = [0, 1, 0, 2, 0, 1, 0, 2, 0].map((index) => ({ key: 'wobble', frame: index }));
    const frameRate = 24;
    this.anims.create({
      key: 'wobble',
      frames,
      frameRate,
      repeat: 2,
    });

    //
    // Paddle
    //
    this.paddle = this.physics.add.sprite(
      this.physics.world.bounds.width * 0.5,
      this.physics.world.bounds.height - 5,
      'paddle',
    );
    this.paddle.body.immovable = true;

    //
    // Bricks
    //

    this.initBricks();

    const textStyle = { font: '18px Arial', fill: '#0095DD' };

    //
    // Score
    //
    this.score = 0;
    this.scoreText = this.add.text(5, 5, 'Points: 0', textStyle);

    //
    // Lives
    //
    this.lives = 3;
    this.livesText = this.add.text(this.physics.world.bounds.width - 5, 5, `Lives: ${this.lives}`, textStyle);
    this.livesText.setOrigin(1, 0);

    this.lifeLostText = this.add.text(
      this.physics.world.bounds.width * 0.5,
      this.physics.world.bounds.height * 0.5,
      'Life lost, click to continue',
      textStyle,
    );
    this.lifeLostText.setOrigin(0.5, 0.5);
    this.lifeLostText.visible = false;

    //
    // Start button
    //
    this.startButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'button', 1);
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', () => {
      this.startGame();
    });
    this.startButton.setFrame(0);
    this.startButton.setOrigin(0.5);
    this.startButton.on('pointerover', () => {
      this.startButton.setFrame(1);
    });
    this.startButton.on('pointerout', () => {
      this.startButton.setFrame(0);
    });
  }

  //

  initBricks(): void {
    const brickInfo = {
      width: 50,
      height: 20,
      count: {
        row: 3,
        col: 12,
      },
      offset: {
        top: 50,
        left: 70,
      },
      padding: 10,
    };

    this.bricks = this.add.group();

    for (let c = 0; c < brickInfo.count.col; c++) {
      for (let r = 0; r < brickInfo.count.row; r++) {
        const brickX = c * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
        const brickY = r * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
        const newBrick = this.physics.add.sprite(brickX, brickY, 'brick');
        newBrick.body.immovable = true;
        this.bricks.add(newBrick);
      }
    }
  }

  //

  update(): void {
    if (this.playing) {
      this.paddle.x = this.input.x > 0 ? this.input.x : this.physics.world.bounds.width * 0.5;
    }

    if (this.ball.active) {
      // Ball / paddle collision
      this.physics.collide(this.ball, this.paddle, (_ball, _paddle) => {
        this.ball.play('wobble');
        this.ball.body.velocity.x = -5 * (this.paddle.x - this.ball.x);
      });

      // Ball / brick collision
      this.physics.collide(this.ball, this.bricks, (ball, brick) => {
        this.handleBrickCollision(ball, brick);
      });

      //
      // Check ball out of bounds
      //
      if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, this.ball.getBounds())) {
        this.ballLeaveScreen();
      }
    }
  }

  //

  handleBrickCollision(
    _ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    brick: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    // Brick hit animation
    this.tweens.add({
      targets: brick,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => {
        brick.destroy();
      },
    });

    this.score += 10;
    this.scoreText.setText(`Points: ${this.score}`);

    let countAlive = 0;
    for (const brick of this.bricks.children.entries) {
      if (brick.active) {
        countAlive++;
      }
    }

    if (countAlive === 0) {
      this.ball.destroy();
      alert('You won the game, congratulations!');
    }
  }

  //

  ballLeaveScreen(): void {
    this.lives--;
    this.ball.body.velocity.set(0);
    if (this.lives > 0) {
      this.livesText.setText(`Lives: ${this.lives}`);
      this.lifeLostText.visible = true;
      this.ball.setPosition(this.physics.world.bounds.width * 0.5, this.physics.world.bounds.height - 25);
      this.paddle.setPosition(this.physics.world.bounds.width * 0.5, this.physics.world.bounds.height - 5);
      this.input.once('pointerdown', () => {
        this.lifeLostText.visible = false;
        this.ball.body.velocity.set(150, -150);
      });
    } else {
      this.ball.destroy();
      alert('You lost, game over!');
    }
  }

  //

  startGame(): void {
    this.startButton.destroy();
    this.ball.body.velocity.set(150, -150);
    this.playing = true;
  }

  //
}
