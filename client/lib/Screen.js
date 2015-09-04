/**
 * Created by Devyn on 6/3/2015.
 */

Game = function(canvas) {
    this.thisGame = this;
    
    this.c = canvas;
    this.ctx = this.c.getContext("2d");
    
    this.width = this.c.width, this.height = this.c.height;
    this.cWidth = this.width/2, this.cHeight = this.height/2;
    
    this.aspectRatio = 16/10;
    
    this.mainCamera = new Camera(new Vector3(0,0,0), new Quaternion(0,0,0,0), 25, this);
    
    this.FPS = 60;
    this.frames = 0;
   
    //Array that holds all GameObjects in the game.
    this.gameObjects = [];
    
    //resizeCanvas Function; resize's the screen to fit the browser.
    this.resizeCanvas = function(){
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.c.width = canvas.width;
        this.c.height = canvas.height;
        
        this.width = this.c.width;
        this.height = this.c.height;
    
        this.cWidth = this.width/2;
        this.cHeight = this.height/2;
    
        this.ctx.translate(this.cWidth,this.cHeight);
    };
    
    this.init = function(){
        var blueColors = ['rgb(70, 130, 160)', 'rgb(70, 130, 160)'];
        var darkBlueColors = ['rgb(14, 35, 55)', 'rgb(14, 35, 55)'];
        var pinkColors = ['rgb(170, 70, 109)', 'rgb(170, 70, 109)'];
        var cyanColors = ['rgb(112, 196, 188)', 'rgb(93, 160, 152)'];
        var grayColors = ['rgb(132, 132, 132)', 'rgb(132, 132, 132)'];
        var blackColors = ['rgb(45, 45, 45)', 'rgb(45, 45, 45)'];
        var tanColors = ["rgb(234, 230, 214)", "rgb(234, 230, 214)"];
        var colorPalettes = [grayColors, cyanColors];
        this.resizeCanvas();

        window.onresize = this.resizeCanvas();

        var screenArea = this.width/this.height;
        for(var k = 0; k < 75*screenArea; k++) {
            this.gameObjects[this.gameObjects.length] = new GameObject("poly-"+k, new Vector3((Math.random()*this.width+100)-this.cWidth, (Math.random()*this.height+100)-this.cHeight, 0), Quaternions.identity(), this.mainCamera, new this.Polygon(250, (Math.random()*6) + 3));
        }
    
        for(var i = 0; i < this.gameObjects.length; i++){
            this.gameObjects[i].velocity = new Vector3((Math.random() -.5), (Math.random() -.5), 0);
    
            var corners = [];
            for(var j = 0; j < this.gameObjects[i].type.pointCount; j++){
                corners[corners.length]= new Vector3(Math.random() -.5, Math.random() -.5, 0);
            }
            this.gameObjects[i].type.corners = corners;
            this.gameObjects[i].type.palette = colorPalettes[Math.floor(Math.random()*colorPalettes.length)].slice(0);
        }
    };
    
    //physics function; A core function that handles the physics engine.
    this.physics = function(){
        for(var i = 0; i < this.gameObjects.length; i++){
            var pos = this.gameObjects[i].position;
            var vel = this.gameObjects[i].velocity;
    
            this.gameObjects[i].position = new Vector3(pos.x + vel.x, pos.y + vel.y, pos.z + vel.z);
        }
    };
    
    //draw Function; A core function that draws the screen.
    this.draw = function(){
        this.ctx.clearRect(-this.cWidth, -this.cHeight, this.width, this.height);
    
        for(var i = 0; i < this.gameObjects.length; i++){
            this.gameObjects[i].type.render(this.gameObjects[i]);
        }
    };
    
    this.update = function(){
        for(var i = 0; i < this.gameObjects.length; i++){
            var pos = this.gameObjects[i].position;
            var vel = this.gameObjects[i].velocity;
            if(pos.x < -this.cWidth || pos.x > this.cWidth){vel.x = -vel.x}
            if(pos.y < -this.cHeight || pos.y > this.cHeight){vel.y = -vel.y}
            this.gameObjects[i].velocity = vel;
        }
    };
    
    this.animloop = function(){
      this.update();
      this.physics();
      this.draw();
      requestAnimationFrame(this.animloop);
      //frames++;
    }.bind(this);
    
    var thisGame = this;
    
    this.Polygon = function(size, pointCount){
        this.size = size;
        this.pointCount = pointCount;
        this.corners = [];
        this.palette = [];
    
        this.render = function (GameObject) {
            thisGame.makePolygon(GameObject, this.size, this.corners);
        };
    };
    
    this.makePolygon = function(GameObject, size, corners){
    
        for(var j = 0; j < corners.length; j++){
            GameObject.mesh[j] = new Vector3((corners[j].x * size) + (GameObject.position.x - (size / 2)), (corners[j].y * size) + (GameObject.position.y - (size / 2)), (corners[j].z * size) + (GameObject.position.z - (size / 2)));
        }
    
        //for(var k = 0; k < GameObject.mesh.length; k++){
            //if(GameObject.camera.active){
                //var rotV = Rotation(GameObject.mesh[k], GameObject.rotation);
                //rotV = Project(GameObject.camera, rotV);
                //GameObject.mesh[k] = new Vector2(rotV.x, rotV.y);
            //}
        //}
    
        if(corners.length > 0) {
    
            this.ctx.globalAlpha = .25;
            this.ctx.fillStyle = GameObject.type.palette[1];
            this.ctx.beginPath();
            this.ctx.moveTo(GameObject.mesh[0].x, GameObject.mesh[0].y);
    
            for (var v = 1; v < GameObject.mesh.length; v++) {
                this.ctx.lineTo(GameObject.mesh[v].x, GameObject.mesh[v].y);
            }
            
            this.ctx.lineTo(GameObject.mesh[0].x, GameObject.mesh[0].y);
    
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.fillStyle = GameObject.type.palette[0];
            this.ctx.globalAlpha = .9;
            this.ctx.beginPath();
            this.ctx.moveTo(GameObject.mesh[0].x-10, GameObject.mesh[0].y-10);
    
            for (var w = 1; w < GameObject.mesh.length; w++) {
                this.ctx.lineTo(GameObject.mesh[w].x-10, GameObject.mesh[w].y-10);
            }
            
            this.ctx.lineTo(GameObject.mesh[0].x-10, GameObject.mesh[0].y-10);
            this.ctx.closePath();
            this.ctx.fill();
        }else{console.log("ERR: Corners is empty on GameObject "+GameObject.name);}
    
    };
    
    this.init();
    requestAnimationFrame(this.animloop);
};