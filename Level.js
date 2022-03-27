// Level Properties
export default class Level {
    constructor(columns, rows, cell_width, cell_height) {
        this.columns = columns;
        this.rows = rows;
        this.tile_width = cell_width;
        this.tile_height = cell_height;

        // initialize tiles array
        this.tiles = [];
        for (let i = 0; i < this.columns; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };

    generate() {
        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (i == 0 || i == this.columns - 1 ||
                    j == 0 || j == this.rows - 1) {
                        // add walls
                        this.tiles[i][j] = 1;
                    } else {
                        this.tiles[i][j] = 0;
                    }
            }
        }
    };
};