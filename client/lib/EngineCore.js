/**
 * Created by Devyn on 3/25/2015.
 */
var canvases = document.getElementsByTagName("canvas");
games = [];
init = function(){
    for(var i = 0; i < canvases.length; i++){
        games[games.length] = new Game(canvases[i]);

    }
};

//Rotation Function; takes vec (Vector3) and rot (Quaternion) and returns a rotated Vector3.
rotation = function(vec, rot){
    //if(Math.acos((vec.x + vec.y + vec.z -1)/2) === 0) { return vec; }
    var qVec = new Quaternion(vec.x, vec.y, vec.z, 0);
    qVec = Quaternions.multiply(rot, qVec);
    qVec = Quaternions.multiply(qVec, rot.conjugate());
    return new Vector3(qVec.x, qVec.y, qVec.z);
};

//Project Function; takes camera (Camera), and vec (Vector3) and returns a shifted Vector3.
Project = function(camera, vec){
  if(camera.position.magnitude() + camera.rotation.magnitude() === 0){ return vec }
  vec = Rotation(vec, camera.rotation);
  return new Vector2(((camera.position.z / vec.z) * vec.x) - camera.plane.position.x,
                     ((camera.position.z / vec.z) * vec.y) - camera.plane.position.y);
};

//GameObject constructor; takes Position  (number), Rotation (number), Camera (camera), Type (number) to represent GameObjects.
GameObject = function(Name, Position, Rotation, Camera, Type){
    this.name = Name;
    this.position = Position;
    this.rotation = Rotation;
    this.camera = Camera;
    this.velocity = new Vector3(0,0,0);
    this.type = Type;
    this.mesh = [];
};

// Camera constructor; takes Position(Vector3), Rotation (Quaternion), RenderDistance (number) and projects the scene onto a viewing face.
Camera = function(Position, Rotation, RenderDistance, Game){
  this.position = Position;
  this.rotation = Rotation;
  this.renderDistance = RenderDistance;
  this.active = true;
  this.fov = 90;
  this.plane = new Plane(new Vector3(0,0,0), new Rect(this.position.x-Game.width, this.position.y-Game.height));
};

//Plane constructor; takes Position(Vector3), Rect(Rect) and represents a 2D plane.
Plane = function(Position, Rect){
  this.position = Position;
  this.rect = Rect;
};

//Rect constructor; takes Height (number), Width (number) to represent a plane.
Rect = function(Height, Width){
  this.xx = new Vector3(Height/2, Width/2, 0);
  this.xy = new Vector3(Height/2, -Width/2, 0);
  this.yy = new Vector3(-Height/2, -Width/2, 0);
  this.yx = new Vector3(-Height/2, Width/2, 0);
};

//Vector4 constructor; takes x (number), y (number), z (number), w (number) to represent a coordinate in Four dimensional space.
Vector4 = function (X,Y,Z,W) {
    this.x = X;
    this.y = Y;
    this.z = Z;
    this.w = W;
    this.magnitude = function(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w));
    };
    this.sqrMagnitude = function(){
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    };
    this.normalize = function(){
        return new Vector4(this.x/this.magnitude(), this.y/this.magnitude(), this.z/this.magnitude(), this.w/this.magnitude());
    };
};

//Vector3 constructor; takes x (number), y (number), z (number) to represent a coordinate in Three dimensional space.
Vector3 = function(X,Y,Z) {
    this.x = X;
    this.y = Y;
    this.z = Z;
    this.magnitude = function(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    };
    this.sqrMagnitude = function(){
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    };
    this.normalize = function(){
        return new Vector3(this.x/this.magnitude(), this.y/this.magnitude(), this.z/this.magnitude());
    };
}

//Vector2 constructor; takes x (number), y (number) to represent a coordinate in Two dimensional space.
Vector2 = function(X,Y) {
    this.x = X;
    this.y = Y;
    this.magnitude = function(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };
    this.sqrMagnitude = function(){
        return (this.x * this.x) + (this.y * this.y);
    };
    this.normalize = function(){
        return new Vector2(this.x/this.magnitude(), this.y/this.magnitude());
    };
};

//Vectors Object; contains many different classes useful for Vector3.
var Vectors = Vectors || {};
Vectors.angle = function(from, to){
    return Math.acos(Vectors.dotProduct(from.normalize(), to.normalize())) * (180 / Math.PI);
};
Vectors.dotProduct = function(VecA, VecB){
    return ((VecA.x * VecB.x) + (VecA.y * VecB.y) + (VecA.z * VecB.z));
};
Vectors.distance = function(VecA, VecB) {
    return new Vector3(VecA.x - VecB.x, VecA.y - VecB.y, VecA.z - VecB.z).magnitude();
};

//Quaternion Constructor; takes a x (number), y (number), z (number), w (number) to represent rotation.
Quaternion = function(x, y, z, w){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    this.magnitude = function(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w));
    };
    this.sqrMagnitude = function(){
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
    };
    this.normalize = function(){
        return new Quaternion(this.x/this.magnitude(), this.y/this.magnitude(), this.z/this.magnitude(), this.w/this.magnitude());
    };
    this.eulerAngles = function(){
        var thisQua = this, heading = 0, attitude = 0, bank = 0;
        attitude = Math.asin((2 * thisQua.x * thisQua.y) + (2 * thisQua.z * thisQua.w));
        bank = Math.atan2((2 * thisQua.x * thisQua.w) - (2 * thisQua.y * thisQua.z), 1 - (2 * (thisQua.x * thisQua.x)) - (2 * (thisQua.z * thisQua.z)));
        if(thisQua.x * thisQua.y + thisQua.y * thisQua.z === .5){
          heading = 2 * Math.atan2(thisQua.x, thisQua.w);
          bank = 0;
        } else if(thisQua.x * thisQua.y + thisQua.y * thisQua.z === -.5){
          heading = -2 * Math.atan2(thisQua.x, thisQua.w);
          bank = 0;
        } else {
          heading = Math.atan2((2 * thisQua.y * thisQua.w) - (2 * thisQua.x * thisQua.z), 1 - 2*(thisQua.z * thisQua.z));
        }
        return new Vector3(heading, attitude, bank);
    };
    this.conjugate = function(){
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    };
};
//Quaternions Objects; contains many different classes useful for Quaternion.
var quaternions = quaternions || {};
quaternions.identity = function(){
  return quaternions.euler(new Vector3(0,0,0));
};
quaternions.euler = function(Vec){
    var c1 = Math.cos(Vec.x/2), c2 = Math.cos(Vec.y/2), c3 = Math.cos(Vec.z/2);
    var s1 = Math.sin(Vec.x/2), s2 = Math.sin(Vec.y/2), s3 = Math.sin(Vec.z/2);
    return new Quaternion((c1 * c2 * c3) - (s1 * s2 * s3), (s1 * s2 * c3) + (c1 * c2 * s3),
        (s1 * c2 * c3) + (c2 * s1 * s3), (c1 * s2 * c3) - (s1 * c2 * s3));
};
quaternions.multiply = function(Qua1, Qua2){
    return new Quaternion(Qua1.w * Qua2.w - Qua1.x * Qua2.x - Qua1.y * Qua2.y - Qua1.z * Qua2.z,
                          Qua1.w * Qua2.x + Qua1.x * Qua2.w + Qua1.y * Qua2.z - Qua1.z * Qua2.y,
                          Qua1.w * Qua2.y + Qua1.y * Qua2.w + Qua1.z * Qua2.w - Qua1.x * Qua2.z,
                          Qua1.w * Qua2.z + Qua1.z * Qua2.w + Qua1.x * Qua2.y - Qua1.y * Qua2.x);
};
Quaternions = quaternions;
//Converter Object; contains many different classes useful for Converter.
var Converter = Converter || {};
Converter.radToDeg = function(rad){
    return rad * (180 / Math.PI);
};
Converter.degToRad = function(deg){
    return deg * (Math.PI / 180);
};