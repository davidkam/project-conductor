let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let FRAME_RATE = 60;
let MAX_PARTICLES = 1000;
let particles = [];

let kinectronIpAddress = "10.0.75.1"; 
let kinectron = null;

let DELAY = 30;

let song = null;
let timpani = null;
let hihat = null;
let cymbal = null;

function HandStatus(currentHandState, lastUpdated) {
    this.currentHandState = 0;
    this.lastUpdated = 0;
}

function Player(playerNo, colorIndex, soundEffect) {
    this.playerNo = playerNo;
    this.colorIndex = colorIndex;
    this.leftHand = new HandStatus(0,0);
    this.rightHand = new HandStatus(0,0);
    this.soundEffect = soundEffect;
}

let players = [];

function preload() {
    song = loadSound('source/overture.mp3');
    timpani = loadSound('source/timpani.mp3');
    hihat = loadSound('source/hihat.mp3');
    cymbal = loadSound('source/cymbal.mp3');

}

function setup() {
    context = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    frameRate(FRAME_RATE);
    background(0);
    noStroke();

    players = [
        new Player(1, 120, timpani),
        new Player(2, 240, cymbal),
        new Player(3, 360, hihat),
        new Player(4, 60, timpani),
        new Player(5, 180, cymbal),
        new Player(6, 300, hihat)
    ];
  
    initKinectron();
    song.play();
  }

function draw() {

}

function windowResized() {
    if (SCREEN_WIDTH != window.innerWidth) {
        SCREEN_WIDTH = window.innerWidth;
    }
    if(SCREEN_HEIGHT != window.innerHeight) {
        SCREEN_HEIGHT = window.innerHeight;
    }
    resizeCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

function initKinectron() {
    // define and create an instance of kinectron
    kinectron = new Kinectron(kinectronIpAddress);
  
    // connect with application over peer
    kinectron.makeConnection();
  
    // request all tracked bodies and pass data to your callback
    kinectron.startTrackedBodies(bodyTracked);
}

function bodyTracked(body) {
    background(0,50);
  
    drawHand(body.bodyIndex, 'leftHand', body.joints[7], body.leftHandState); 
    drawHand(body.bodyIndex, 'rightHand', body.joints[11], body.rightHandState);

    var existingParticles = [];

    for (var i = 0; i < particles.length; i++) {
        particles[i].update();

        // render and save particles that can be rendered
        if (particles[i].exists()) {
            particles[i].render(drawingContext);
            existingParticles.push(particles[i]);
        }
    }

    // update array with existing particles - old particles should be garbage collected
    particles = existingParticles;

    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
    
}

function drawHand(playerNo, handKey, hand, handState) {
    currentPlayer = players[playerNo];
    if(handState != currentPlayer[handKey].currentHandState) {
        if(handState == 2 && (frameCount - currentPlayer[handKey].lastUpdated) > DELAY) {
            var firework = new Firework(hand.depthX * width, hand.depthY * height, currentPlayer.colorIndex, (Math.random() * 60 + 120));
            firework.explode();
            currentPlayer.soundEffect.play();
            currentPlayer[handKey].lastUpdated = frameCount;
        }
        currentPlayer[handKey].currentHandState = handState;
        
    }

}