// import {Point,Player, Board} from "./board_type.js";

/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = 760;
const BOARD_SIZE = 19;
const CELL_SIZE = CANVAS_WIDTH/BOARD_SIZE;

const grid_line = new Path2D();
for (let i=0;i<BOARD_SIZE;++i) {
    grid_line.moveTo(20+i*CELL_SIZE, 0);
    grid_line.lineTo(20+i*CELL_SIZE, 760);
}
for (let i=0;i<BOARD_SIZE;++i) {
    grid_line.moveTo(0, 20+i*CELL_SIZE);
    grid_line.lineTo(760, 20+i*CELL_SIZE);
}

const board_img = new Image();
board_img.src = "imgs/board_bcg.jpg";
board_img.onload = ()=>{
    ctx.drawImage(board_img, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    ctx.stroke(grid_line);
};

const black_stone = new Image();
black_stone.src = "imgs/shell_stb1.png";

const white_stone = new Image();
white_stone.src = "imgs/shell_stw1.png";

const translucent_black_stone = new Image();
translucent_black_stone.src = "imgs/translucent_b.png";

const translucent_white_stone = new Image();
translucent_white_stone.src = "imgs/translucent_w.png";

let stepNum = 0;

let [x, y, baseX, baseY] = [0, 0, 0, 0];
canvas.addEventListener("click", (e)=>{
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    ctx.drawImage(board_img, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    ctx.stroke(grid_line);
    x = Math.floor(e.offsetX/CELL_SIZE);
    y = Math.floor(e.offsetY/CELL_SIZE);

    const move_pos = new Point(((x-baseX)%19+19)%19, ((y-baseY)%19+19)%19);
    let isValid = board.place_stone(stepNum%2===0 ? Player.Black:Player.White, move_pos);

    if (isValid) {
        // 判断劫争
        if (stepNum>3 && board.isEqualWith(historyBoards[stepNum-1])) {
            board = historyBoards[stepNum].deep_copy();
        }
        else {
            stepNum ++;
            historyBoards.push(board.deep_copy());
        }
    }
    drawBoard(board);

});

canvas.addEventListener("contextmenu", (e)=>{
   e.preventDefault();
   if (stepNum>=1) {
       historyBoards.pop();
       stepNum --;

       clearBoard();

       board = historyBoards[stepNum].deep_copy();
       drawBoard(board);

   }
});

canvas.addEventListener("mousemove", (e)=>{
    clearBoard();
    drawBoard(board);
    x = Math.floor(e.offsetX/CELL_SIZE);
    y = Math.floor(e.offsetY/CELL_SIZE);
    const move_pos = new Point(((x-baseX)%19+19)%19, ((y-baseY)%19+19)%19);

    if (board.grid.get(move_pos.toString())===undefined) {
        if (stepNum%2===0) {
            ctx.drawImage(translucent_black_stone, x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        else {
            ctx.drawImage(translucent_white_stone, x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
});

document.addEventListener("keydown", (e)=>{
    clearBoard();
    if (e.key==='a') {
        baseX --;
    }
    else if (e.key==='d') {
        baseX ++;
    }
    else if (e.key==='w') {
        baseY ++
    }
    else if (e.key==='s') {
        baseY --;
    }

    drawBoard(board);
});


let board = new Board();

/** @type {Array<Board>}*/
const historyBoards = [board.deep_copy()];

/**
 *  绘制盘面
 * @param board {Board}
 */
function drawBoard(board) {
    let  [x, y] = ['', ''];
    for (const [pt_str, go_string] of board.grid) {
        [x, y] = pt_str.split(',');
        let posX = ((baseX*CELL_SIZE+x*CELL_SIZE)%CANVAS_WIDTH+CANVAS_WIDTH)%CANVAS_WIDTH;
        let posY = ((baseY*CELL_SIZE+y*CELL_SIZE)%CANVAS_WIDTH+CANVAS_WIDTH)%CANVAS_WIDTH;
        if (go_string.color===Player.Black) {
            ctx.drawImage(black_stone, posX, posY, CELL_SIZE, CELL_SIZE);
        }
        else {
            ctx.drawImage(white_stone, posX, posY, CELL_SIZE, CELL_SIZE);
        }
    }
}

function clearBoard() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    ctx.drawImage(board_img, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    ctx.stroke(grid_line);
}
