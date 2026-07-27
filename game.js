const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;


// Oyun değişkenleri
let score = 0;
let gameOver = false;


// Kuş
const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 34,
    gravity: 0.25,
    velocity: 0,
    jump: -4.6
};


// Borular
let pipes = [];
const pipeWidth = 50;
const pipeGap = 120;
let frame = 0;


// Zıplama
function flap(e) {

    if (e && e.type === "touchstart") {
        e.preventDefault();
    }

    if (gameOver) {
        resetGame();
        return;
    }

    bird.velocity = bird.jump;
}


// Sıfırlama
function resetGame() {

    bird.y = 150;
    bird.velocity = 0;

    pipes = [];
    score = 0;
    frame = 0;

    gameOver = false;
}


window.addEventListener("keydown", flap);
window.addEventListener("touchstart", flap, { passive:false });


// Oyun döngüsü
function loop() {

    ctx.clearRect(0,0,canvas.width,canvas.height);


    if (!gameOver) {

        frame++;


        // Kuş fiziği
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;


        if (bird.y <= 0) {
            bird.y = 0;
            bird.velocity = 0;
        }


        if (bird.y + bird.height >= canvas.height) {
            gameOver = true;
        }



        // Boru oluşturma
        if (frame % 100 === 0) {

            let topHeight = Math.floor(
                Math.random() * (canvas.height - pipeGap - 100)
            ) + 40;


            pipes.push({
                x: canvas.width,
                top: topHeight,
                passed:false
            });
        }



        // Borular
        for (let i=0; i<pipes.length; i++) {

            let p = pipes[i];

            p.x -= 2;


            let bottomY = p.top + pipeGap;


            ctx.fillStyle = "green";

            ctx.fillRect(
                p.x,
                0,
                pipeWidth,
                p.top
            );

            ctx.fillRect(
                p.x,
                bottomY,
                pipeWidth,
                canvas.height-bottomY
            );



            // Çarpışma

            let hitTop =
            bird.x + bird.width > p.x &&
            bird.x < p.x + pipeWidth &&
            bird.y < p.top;


            let hitBottom =
            bird.x + bird.width > p.x &&
            bird.x < p.x + pipeWidth &&
            bird.y + bird.height > bottomY;


            if (hitTop || hitBottom) {
                gameOver = true;
            }



            // Skor

            if (
                p.x + pipeWidth < bird.x &&
                !p.passed
            ) {
                score++;
                p.passed = true;
            }



            if (p.x + pipeWidth < 0) {
                pipes.splice(i,1);
                i--;
            }
        }

    }



    // 🐤 KUŞ ÇİZİMİ

    // Gövde
    ctx.fillStyle = "yellow";
    ctx.beginPath();

    ctx.arc(
        bird.x + 17,
        bird.y + 17,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Göz
    ctx.fillStyle = "black";

    ctx.beginPath();

    ctx.arc(
        bird.x + 24,
        bird.y + 10,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Gaga
    ctx.fillStyle = "orange";

    ctx.fillRect(
        bird.x + 30,
        bird.y + 15,
        10,
        7
    );


    // Kanat
    ctx.fillStyle = "gold";

    ctx.fillRect(
        bird.x + 7,
        bird.y + 20,
        12,
        6
    );



    // Skor

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    ctx.fillText(
        "Skor: " + score,
        10,
        30
    );



    // Game Over

    if (gameOver) {

        ctx.fillStyle = "red";
        ctx.font = "30px Arial";

        ctx.fillText(
            "Game Over",
            85,
            220
        );


        ctx.fillStyle = "white";
        ctx.font = "14px Arial";

        ctx.fillText(
            "CLICK TO RESTART",
            100,
            250
        );
    }



    requestAnimationFrame(loop);
}

        // Borular yerine kullanılacak görsel (20260314_205553.png)
        const pipeImg = new Image();
        pipeImg.src = "20260314_205553";

loop();
