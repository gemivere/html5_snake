export default class Snake {
    init(x, y, direction, speed, num_segments) {
        this.x = x;
        this.y = y;
        this.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        this.direction = direction;
        this.speed = speed;
        this.move_delay = 0;

        // reset the segments and add new ones
        this.segments = [];
        this.grow_segments = 0;
        for (let i = 0; i < num_segments; i++) {
            this.segments.push({x:this.x - i * this.directions[direction][0],
                                y:this.y - i * this.directions[direction][1]});
        }
    };

    grow() {
        this.grow_segments++;
    };

    try_move(dt) {
        this.move_delay += dt;
        let max_move_delay = 1 / this.speed;
        if (this.move_delay > max_move_delay) {
            return true;
        }

        return false;
    };

    next_move() {
        let next_x = this.x + this.directions[this.direction][0];
        let next_y = this.y + this.directions[this.direction][1];
        return {x:next_x, y:next_y};
    };

    move() {
        // get the next move and modify the position
        let next_move = this.next_move();
        this.x = next_move.x;
        this.y = next_move.y;

        // get the position of the last segment
        let lastseg = this.segments[this.segments.length - 1]
        let grow_x = lastseg.x;
        let grow_y = lastseg.y;

        // move segments to the position of the previous segment
        for (var i = this.segments.length - 1; i >= 1; i--) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        };

        // grow a segment if needed
        if (this.grow_segments > 0) {
            this.segments.push({x:grow_x, y:grow_y});
            this.grow_segments--;
        }

        // move the head
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;

        // reset move delay
        this.move_delay = 0;
    };
};