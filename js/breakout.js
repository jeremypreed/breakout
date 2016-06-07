/* 

CONSTANTS
VARIABLES

*/

var TITLE='Breakout';
var WIDTH=640, HEIGHT=600, pi=Math.PI;
var KEY_ENTER=13, KEY_SHIFT=16, KEY_CTRL=17, KEY_ESC=27, KEY_SPACE=32, LeftArrow=37, RightArrow=39, KEY_C=67, KEY_F=70;
var canvas, ctx, keystate, mouse, mouse_pos={x:null,y:null};
var paddle, ball, blocks;
var block_sp;
var fps = 15;
var SFX=['res/sfx_1.wav','res/sfx_2.wav','res/sfx_3.wav']
var event=window.event;
var isPaused=true;
	
/*

OBJECTS

*/
	
// game
var game = {
	
	screen: 'intro',
	fps: null,
	score: null,
	blocks: null,
	level: null,
	lives: null,
	
	update: function() {
		
		//this.blocks = blocks.length;
		
		if (this.blocks==0) {
			this.screen = 'clear';
		}
		
		if (this.lives < 0) {
			this.lives = 0;
			this.screen = 'over';
		}
			
		document.getElementById('fps').innerHTML = 'FPS: '+this.fps;
		document.getElementById('level').innerHTML = 'Level: '+this.level;
		document.getElementById('lives').innerHTML = 'Lives: '+this.lives;
		document.getElementById('score').innerHTML = 'Score: '+this.score;
		document.getElementById('blocks').innerHTML = 'Blocks: '+this.blocks;
		document.getElementById('paddle').innerHTML = 'Paddle X: '+paddle.x;
		document.getElementById('ball').innerHTML = 'Ball X: '+ball.x+', Ball Y: '+ball.y;
		document.getElementById('mouse').innerHTML = 'Mouse X: '+mouse_pos.x+', Mouse Y: '+mouse_pos.y;
		if (keystate[KEY_CTRL]&&keystate[KEY_SHIFT]&&keystate[KEY_F]) {
			if (document.getElementById("dev").style.display == "block") {
				document.getElementById("dev").style.display = "none";
			} else {
				document.getElementById("dev").style.display = "block";
			}
		}
		// CLEAR STAGE CHEAT
		if (keystate[KEY_C]&&keystate[KEY_SHIFT]&&keystate[KEY_CTRL]) {
			blocks = [];
			game.blocks = 0;
		}
	}
}

// scoreboard
scoreboard = {
	width: WIDTH,
	height: 75,
	x: 0,
	y: HEIGHT-this.height,
	
	update: function() {},
	draw: function() {
		
		screen.ctx.fillStyle = '#222';
		screen.ctx.fillRect(0, HEIGHT-this.height, WIDTH, this.height);
		
		Text('LEVEL '+game.level,'#fff','900','30px','left',10,(HEIGHT-this.height)+30);
		Text('SCORE '+game.score,'#fff','500','20px','left',10,HEIGHT-10);
		
		Text('Lives '+game.lives,'#fff','900','30px','right',WIDTH-10,(HEIGHT-this.height)+30);
		Text(game.blocks+' Blocks','#fff','500','20px','right',WIDTH-10,HEIGHT-10);
	}
}

// paddle
paddle = {
	x: null,
	y: null,
	width: 150,
	height: 20,
	
	update: function() {
		if (this.x > 0) if (keystate[LeftArrow]) this.x -= 5;
		if (this.x+this.width < WIDTH) if (keystate[RightArrow]) this.x += 5;
		
		/*
		
		mouse/touch controls arent ready yet
		
		if (mouse) {
			this.x = mouse_pos.x-(this.width/2);
		}
		*/
		
	},
	draw: function() {
		screen.ctx.fillRect(this.x, this.y, this.width, this.height);
	}
};

// ball
ball = {
	x: null,
	y: null,
	vel: null,
	side: 20,
	speed: null,
	
	update: function() {
		this.x += this.vel.x;
		this.y += this.vel.y;
		
		// ceiling collison
		if (0 > this.y) {
		
			Sfx(1);
			var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
			this.y += 2*offset;
			this.vel.y *= -1;
		}
		// left & right wall collison
		if (0 > this.x || this.x+this.side > WIDTH) {

			Sfx(1);
			this.vel.x *= -1;
		}
	
		// paddle misses ball
		if (this.y > HEIGHT-scoreboard.height) {
			game.lives -= 1;
			init();
		}	
		
		var AABBintersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		};
		
		// paddle collison
		if (AABBintersect(paddle.x,paddle.y,paddle.width,paddle.height,
			this.x, this.y, this.side, this.side)) {
			
			Sfx(2);
			var n = (this.x+this.side - paddle.x)/(paddle.width+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45 degrees
			var spike = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
			
			this.vel.x = Math.floor(this.speed*Math.sin(phi));
			this.vel.y = -1*Math.floor(this.speed*Math.cos(phi));
		}
		
		// block collison
		for (var i=0, len=blocks.length; i < len; i++) {
			var b = blocks[i];
			
			if (AABBintersect(b.x,b.y,b.w,b.h,
				this.x, this.y, this.side, this.side)) {
				
				
				if (b.t==1) {
					// hard block
					Sfx(2);
					this.vel.y *= -1;			
				} else {
					// normal block
					Sfx(0);
					this.vel.y *= -1;
					blocks.splice(i,1);
					i--;
					len--;
					game.score += 10;
					game.blocks -= 1;

				}
			}
		}

	},
	draw: function() {

		var ball_sp = new Image();
		ball_sp.src = 'res/ball.png';
		
		if (game.screen=='pause') {
			screen.ctx.drawImage(ball_sp, 0, 20, this.side, this.side, this.x, this.y, this.side, this.side);
		} else {
			screen.ctx.drawImage(ball_sp, 0, 0, this.side, this.side, this.x, this.y, this.side, this.side);
		}
	}
};



/*

FUNCTIONS

*/

function init() {

	// stage setup
	paddle.x = ((WIDTH - paddle.width)/2)-30;
	paddle.y = HEIGHT - scoreboard.height - paddle.height;
	
	ball.x = ((WIDTH - ball.side)/2)-30;
	ball.y = HEIGHT - scoreboard.height - 50;
	
	ball.vel = {
		x: ball.speed/4,
		y: -ball.speed
	}

}

function main() {

	screen = new Screen(WIDTH, HEIGHT);
	Clear('#111');
	Text('Loading...','#555','700','40px','left',10, HEIGHT-10);
		
	// sprites
	var img = new Image();
	img.addEventListener('load', function() {
		
		block_sp = [
			[new Sprite(this,  0, 0, 80, 20)],
			[new Sprite(this,  0, 0, 80, 20)],
			[new Sprite(this, 80, 0, 80, 20)],
			[new Sprite(this, 160, 0, 80, 20)],
			[new Sprite(this, 240, 0, 80, 20)],
			[new Sprite(this, 320, 0, 80, 20)],
			[new Sprite(this, 400, 0, 80, 20)],
			[new Sprite(this, 480, 0, 80, 20)],
			[new Sprite(this, 0, 20, 80, 20)]
		];

		new_game();
		init();
		loop();
		
	});
	img.src = 'res/blocks.png';
	
	// controls
	// key press
	keystate = {};
	document.addEventListener('keydown', function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener('keyup', function(evt) {
		delete keystate[evt.keyCode];
	});

	function getMousePos(canvas, evt) {
		var rect = screen.canvas.getBoundingClientRect();
		return {
		  x: evt.clientX - rect.left,
		  y: evt.clientY - rect.top
		};
	}
	
	//mouse/touch controls arent ready yet
	document.addEventListener('mousemove', function(evt) {
		//if (0 < paddle.x && paddle.x+paddle.width < WIDTH) {
		//	mouse = true;
			mouse_pos = getMousePos(canvas, evt);			
		//} else { mouse = false; }
	});
}

function update() {
	
	if (game.screen == 'play') {
	
		ball.update();
		paddle.update();
		game.update();
		if (keystate[KEY_ESC]) game.screen = 'pause';

	} else if (game.screen == 'intro') {
	
		game.update();
		new_game();
		if (keystate[KEY_ENTER]) game.screen = 'play';
	
	} else if (game.screen == 'pause') {
	
		game.update();
		if (keystate[KEY_SPACE]) game.screen = 'play';

	} else if (game.screen == 'over') {
	
		game.update();
		if (keystate[KEY_SPACE]) game.screen = 'intro';
	
	}  else if (game.screen == 'thanks') {
 
	
	} else if (game.screen == 'clear') {
	
		game.update();
		if (isPaused) {
			isPaused=false;
		}
		if (keystate[KEY_SPACE]) {
			if(level[game.level+1]) {
				new_stage();
			} else {
				game.screen='thanks';
			};
			isPaused=true;
		}
	}
}

function draw() {
		
	screen.ctx.save();
	
	if (game.screen == 'play') {
		game.fps = 60;
		// game
		Clear('#000');
		//blocks
		for (var i = 0, len = blocks.length; i < len; i++) {
			var a = blocks[i];
			screen.drawSprite(a.sprite[0], a.x, a.y);
		}
		// ball and paddle
		screen.ctx.fillStyle = '#fff';
		ball.draw();
		paddle.draw();
		scoreboard.draw();
		
	} else if (game.screen == 'intro') {
		game.fps = 15;
		// intro screen
		Clear('#111');
		Text(TITLE,'#f1f','700','100px','center',WIDTH/2, HEIGHT/2);
		Text('Press ENTER to play','#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+50);
		
	} else if (game.screen == 'pause') {
		game.fps = 15;	
		// pause menu
		Clear('#111');
		scoreboard.draw();
		//redraw ball & paddle
		screen.ctx.fillStyle = '#444';
		ball.draw();
		paddle.draw();
		
		Text('PAUSED','#f1f','700','80px','center',WIDTH/2, HEIGHT/2);
		Text('Press SPACE to resume','#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+50);
				
	} else if (game.screen == 'over') {
		game.fps = 15;	
		// game over
		Clear('#000');
		Text('GAME OVER','#f00','700','80px','center',WIDTH/2, HEIGHT/2);
		Text('SCORE '+game.score,'#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+60);
		Text('Press SPACE to continue','#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+100);

	} else if (game.screen == 'clear') {
		game.fps = 15;	
		// stage clear
		Clear('#111');
		
		Text('LEVEL '+game.level,'#fff','700','40px','center',WIDTH/2, (HEIGHT/2)-50);
		Text('CLEAR','#1f1','700','80px','center',WIDTH/2, (HEIGHT/2));
		Text('SCORE '+game.score,'#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+60);
		Text('Press SPACE to continue','#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+100);
		
	} else if (game.screen == 'thanks') {
		game.fps = 15;	
		// beat game
		Clear('#111');
		Text('THANKS FOR PLAYING!','#1f1','700','60px','center',WIDTH/2, (HEIGHT/2));
		Text('www.jeremypreed.com','#fff','500','40px','center',WIDTH/2, (HEIGHT/2)+100);
		
	}
	screen.ctx.restore();

}

function loop() {

	function run() {
		setTimeout(function() {
			requestAnimationFrame(run);
 
			update();
			draw();
 
		}, 1000 / game.fps);
	}
 
	run();
}

document.title = TITLE;
main();