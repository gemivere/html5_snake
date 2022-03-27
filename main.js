import Level from "./Level.js"
import Snake from "./Snake.js"
import { randRange } from "./randRange.js"

const canvas = document.getElementById("viewport");
const context = canvas.getContext("2d");

// timing and fps
let last_frame = 0;
let fps_time = 0;
let frame_count = 0;
let fps = 0;

let images = []
let tile_image;

// create objects
let snake = new Snake();
let level = new Level(20, 15, 32, 32);

// variables
let score = 0;
let game_over = false;
let game_over_time = 1;
let game_over_delay = 0.5;
let load_count = 0
let preloaded = false
let image_files = ["snake-graphics.png"]
let load_total = image_files.length

let initialized = false

window.onload = main();

function main() {
    // initialize the game
    init();
}

function key_down(e) {
    if (game_over) {
        try_new_game();
    } else {
        switch (e.keyCode) {
            case 37: case 65:
                // Left or A
                if (snake.direction != 1) {
                    snake.direction = 3;
                }
                break;
            case 38: case 87:
                // Up or W
                if (snake.direction != 2) {
                    snake.direction = 0;
                }
                break;
            case 39: case 68:
                // Right or D
                if (snake.direction != 3) {
                    snake.direction = 1;
                }
                break;
            case 40: case 69:
                // Down or S
                if (snake.direction != 0) {
                    snake.direction = 2;
                }
                break;
            default:
                console.log("Something is borked")
        }
    }
}

function init() {
    images = load_images()
    tile_image = images[0]

    // add keydown events
    window.addEventListener("keydown", key_down);

    game_over = true;
    new_game(snake, level);

    loop(0);
}

function load_images() {
    load_count = 0;
    load_total = image_files.length;
    preloaded = false;

    function on_load() {
        load_count++;
        if (load_count == load_total) {
            preloaded = true;
        }
    }

    //load the images
    let loaded_images = []
    for (let i = 0; i < image_files.length; i++) {
        let image = new Image();

        image.onload = on_load()

        image.src = image_files[i];
        loaded_images[i] = image;
    }
    
    return loaded_images
}

function loop(tframe) {
    window.requestAnimationFrame(loop);

    if (!initialized) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // draw a progress bar
        let load_percentage = load_count / load_total;
        context.strokeStyle = "#ff8080";
        context.lineWidth = 3;
        context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width - 37, 32);
        context.fillStyle = "#ff8080"
        context.fillRect(18.5, 0.5 + canvas.height - 51, load_percentage * (canvas.width-37), 32);

        // draw the progress text
        let load_text = "Loaded " + load_count + "/" + load_total + " images";
        context.fillStyle = "#000000";
        context.font = "16px Verdana";
        context.fillText(load_text, 18, 0.5 + canvas.height - 63);

        if (preloaded) {
            initialized = true;
        }
    } else {
        update(tframe, last_frame);
        render()
    }
}

function try_new_game() {
    if (game_over_time > game_over_delay) {
        new_game(snake, level, score, game_over);
        game_over = false;
    }
}

export function update_fps(dt) {
    if (fps_time > 0.25) {
        fps = Math.round(frame_count / fps_time);

        fps_time = 0;
        frame_count = 0;
    }

    fps_time += dt;
    frame_count++;
}

function update(tframe, last_frame) {
    const dt = (tframe - last_frame) / 1000;
    last_frame = tframe;

    update_fps(dt);

    if (!game_over) {
        update_game(dt);
    } else {
        game_over_time += dt;
    }
}

function update_game(dt) {
    // move the snake
    if (snake.try_move(dt)) {
        // check snake collisions
        const next_move = snake.next_move();
        const nx = next_move.x;
        const ny = next_move.y;

        if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
            if (level.tiles[nx][ny] == 1) {
                // collision with the wall
                game_over = true;
            }

            for (let i = 0; i < snake.segments.length; i++) {
                // collision with the snake itself
                const sx = snake.segments[i].x;
                const sy = snake.segments[i].y;

                if (nx == sx && ny == sy) {
                    game_over = true;
                    break;
                }
            }

            if (!game_over) {
                // the snake is allowed to move
                snake.move();

                // check collision with apple
                if (level.tiles[nx][ny] == 2) {
                    levels.tiles[nx][ny] == 0;

                    add_apple();
                    snake.grow();
                    score++;
                }
            }
        } else {
            // out of bounds
            game_over = true;
        }

        if (game_over) {
            game_over_time = 0;
        }
    }
}

function draw_level() {
    for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
            let tile = level.tiles[i][j];
            let tile_x = i * level.tile_width
            let tile_y = j * level.tile_height

            if (tile == 0) {
                // empty space
                context.fillStyle = "#f7e697";
                context.fillRect(tile_x, tile_y, level.tile_width, level.tile_height);
            } else if (tile == 1) {
                // Wall
                context.fillStyle = "#bcae76";
                context.fillRect(tile_x, tile_y, level.tile_width, level.tile_height)
            } else if (tile == 2) {
                // Apple
                context.fillStyle = "#f7e697";
                context.fillRect(tile_x, tile_y, level.tile_width, level.tile_height);

                const tx = 0
                const ty = 3;
                const tilew = 64
                const tileh = 64
                context.drawImage(tile_image, tx*tilew, ty*tileh, tilew, tileh, tile_x, tile_y, level.tile_width, level.tile_height);
            }
        }
    }
}

function draw_snake() {
    // loop over every snake segment
    for (let i = 0; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        const seg_x = segment.x;
        const seg_y = segment.y;
        const tile_x = seg_x * level.tile_width;
        const tile_y = seg_y * level.tile_height;

        // sprite column and row that gets calculated
        let tx = 0
        let ty = 0

        if (i == 0) {
            // Head, determine the correct image
            const next_seg = snake.segments[i+1];
            if (seg_y < next_seg.y) {
                // snake is moving up
                tx = 3; ty = 0;
            } else if (seg_x > next_seg.x){
                // snake is moving right
                tx = 4; ty = 0;
            } else if (seg_y > next_seg.y) {
                // snake is moving down
                tx = 4; ty = 1;
            } else if (seg_x < next_seg.x) {
                // snake is moving left
                tx = 3; ty = 1;
            }
        } else if (i == snake.segments.length - 1) {
            // Tail, determine the correct image
            const prev_seg = snake.segments[i - 1];

            if (prev_seg.y < seg_y) {
                // Up
                tx = 3; ty = 2;
            } else if (prev_seg.x > seg_x) {
                // Right
                tx = 4; ty = 2;
            } else if (prev_seg.y > seg_y) {
                // Down
                tx = 4; ty = 3;
            } else if (prev_seg.x < seg_x) {
                // Left
                tx = 3; ty = 3;
            }
        } else {
            // Body, determine the correct image
            const prev_seg = snake.segments[i - 1]
            const next_seg = snake.segments[i + 1]

            if (prev_seg.x < seg_x && next_seg.x > seg_x || next_seg.x < seg_x && prev_seg.x > seg_x) {
                // Horizontal Left-Right
                tx = 1; ty = 0;
            } else if (prev_seg.x < seg_x && next_seg.y > seg_y || next_seg.x < seg_x && prev_seg.y > seg_y) {
                // Angle Left-Down
                tx = 2; ty = 0;
            } else if (prev_seg.y < seg_y && next_seg.y > seg_y || next_seg.y < seg_y && prev_seg.y > seg_y) {
                // Vertical Up-Down
                tx = 2; ty = 1;
            } else if (prev_seg.y < seg_y && next_seg.x < seg_x || next_seg.y < seg_y && prev_seg.x < seg_x) {
                // Angle Top-Left
                tx = 2; ty = 2;
            } else if (prev_seg.x > seg_x && next_seg.y < seg_y || next_seg.x > seg_x && prev_seg.y < seg_y) {
                // Angle Right-Up
                tx = 0; ty = 1;
            } else if (prev_seg.y > seg_y && next_seg.x > seg_x || next_seg.y > seg_y && prev_seg.x > seg_x) {
                // Angle Down-Right
                tx = 0; ty = 0;
            }
        }

        context.drawImage(tile_image, tx*64, ty*64, 64, 64, tile_x, tile_y, level.tile_width, level.tile_height);
    };
};

function drawCenterText(text, x, y, width) {
    var textdim = context.measureText(text);
    context.fillText(text, x + (width-textdim.width)/2, y);
}

function render() {
    context.fillStyle = "#577ddb";
    context.fillRect(0, 0, canvas.width, canvas.height);

    draw_level();
    draw_snake();

    // Game over
    if (game_over) {
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "#fff";
        context.font = "24px Verdana";
        drawCenterText("Press any key to start!", 0, canvas.height/2, canvas.width);
    }
}

function new_game(snake, level) {
    // initialize the snake
    snake.init(10, 10, 1, .05, 4);

    // generate the default level
    level.generate();

    // add an apple
    add_apple(snake, level);

    // initialize variables
    score = 0;
    game_over = false;
}

function add_apple(snake, level) {
    // loop until we have a valid apple
    let valid = false;
    while (!valid) {
        // get a random position
        const ax = randRange(0, level.columns - 1);
        const ay = randRange(0, level.rows - 1);

        // make sure the snake doesn't overlap the new apple
        let overlap = false;
        for (let i = 0; i < snake.segments.length; i++) {
            // get the position of the current snake segment
            const sx = snake.segments[i].x;
            const sy = snake.segments[i].y;

            // check overlap
            if (ax == sx && ay == sy) {
                overlap = true;
                break;
            }
        }

        if (!overlap && level.tiles[ax][ay] == 0) {
            // add an apple at the tile position
            level.tiles[ax][ay] = 2;
            valid = true;
        }
    }
}