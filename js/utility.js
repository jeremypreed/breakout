//screen
function Screen(width, height) {
	this.canvas = document.createElement('canvas');
	this.canvas.width = WIDTH = width;
	this.canvas.height = HEIGHT = height;
	this.ctx = this.canvas.getContext('2d');
	document.body.appendChild(this.canvas);
}

Screen.prototype.drawSprite = function(sp, x, y) {
	this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
}

//sprite
function Sprite(img, x, y, w, h) {
	this.img = img;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

//sfx
function Sfx(x) {
	var sound = new Audio();
	sound.src = SFX[x];
	sound.play();
}

//clear canvas
function Clear(color) {
	screen.ctx.fillStyle = color;
	screen.ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

//text
function Text(txt,color,weight,size,align,x,y) {
		screen.ctx.font = weight +' '+ size +' Arcade Classic';
		screen.ctx.textAlign = align; 
		screen.ctx.fillStyle = color;
		screen.ctx.fillText(txt, x, y);
}

