class Point {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `${this.x},${this.y}`;
    }
    
    /**
    *   @param {string} str
    *   @return {Point} 
    */
    static fromString(str) {
        const [x, y] = str.split(',');
        return new Point(+x, +y);
    }
    
    /**
     * 获取相邻的4个点，注意，最左点的左边是最右点，最上点的上边是最下点。
    * @return {Point[]}
    */
    
    getNeighbor() {
        const nb = new Array(4);
        nb[0] = new Point(this.x>0 ? this.x-1 : 18, this.y);
        nb[1] = new Point(this.x, (this.y+1)%19);
        nb[2] = new Point((this.x+1)%19, this.y);
        nb[3] = new Point(this.x, this.y>0 ? this.y-1 : 18);
        return nb;
    }
}

const Player = Object.freeze({
   Black: 1,
    White: -1,
   other: function (p) {
       return p===1 ? Player.White : Player.Black;
   }
});

/**
 * s1 & s2 (交集)
 * @param{Set} s1
 * @param{Set} s2
 * @return {Set}
 */
function intersection(s1, s2) {
    return new Set([...s1].filter(x => s2.has(x)));
}

/**
 * s1 | s2 (并集)
 * @param{Set} s1
 * @param{Set} s2
 * @return {Set}
 */
function union(s1, s2) {
    return new Set([...s1, ...s2]);
}

/**
 * s1 - s2 (差集)
 * @param{Set} s1
 * @param{Set} s2
 * @return {Set}
 */
function minus(s1, s2) {
    return new Set([...s1].filter(x => !s2.has(x)));
}

class GoString {
    /**
     *
     * @param color {number}
     * @param stones {Set<String>} 棋子
     * @param liberties {Set<String>} 气
     */
    constructor(color, stones, liberties) {
        this.color = color;
        this.stones = stones;
        this.liberties = liberties;
    }

    remove_liberty(point) {
        this.liberties.delete(point.toString());
    }

    add_liberty(point) {
        this.liberties.add(point.toString());
    }

    merge_with(go_string) {
        console.assert(go_string.color===this.color, "必须合并同色棋子串");
        const combined_stones = union(this.stones, go_string.stones);
        const combined_liberties = minus(union(this.liberties, go_string.liberties), combined_stones);
        return new GoString(this.color, combined_stones, combined_liberties);
    }

    deep_copy() {
        const new_stones = new Set(this.stones);
        const new_liberties = new Set(this.liberties);
        return new GoString(this.color, new_stones, new_liberties);
    }
}

class Board {
    constructor() {
        /** @type {Map<string, GoString>} */
        this.grid = new Map();
    }

    _remove_string(go_string) {
        go_string.stones.forEach((pt_str) => {
           const pt = Point.fromString(pt_str);
           pt.getNeighbor().forEach((nb_pt)=>{
              const neighbor_go_str = this.grid.get(nb_pt.toString());
              if (neighbor_go_str!==undefined && neighbor_go_str!==go_string) {
                    neighbor_go_str.add_liberty(pt);
              }
           });
           this.grid.delete(pt_str);
        });
    }

    deep_copy() {
        const new_board = new Board();
        for (const [pt_str, go_string] of this.grid) {
            if (new_board.grid.has(pt_str)) continue;
            const new_go_string = go_string.deep_copy();
            for (const stone of go_string.stones) {
                new_board.grid.set(stone, new_go_string);
            }
        }
        return new_board;
    }

    /**
     * 落子 (若落子无效则返回false)
     * @param player {number}
     * @param point {Point}
     */
    place_stone(player, point) {
        if (this.grid.get(point.toString())!==undefined) return false;

        /** @type {Array<GoString>}*/
        const adjacent_same_color = []
        /** @type {Array<GoString>}*/
        const adjacent_opposite_color = []
        /** @type {Array<string>}*/
        const liberties = []

        for (const nb_pt of point.getNeighbor()) {
            const nb_pt_str = nb_pt.toString();
            const neighbor_go_str = this.grid.get(nb_pt_str);
            if (neighbor_go_str===undefined) liberties.push(nb_pt_str);
            else if (neighbor_go_str.color===player) {
                if (!adjacent_same_color.includes(neighbor_go_str)) {
                    adjacent_same_color.push(neighbor_go_str);
                }
            }
            else {
                if (!adjacent_opposite_color.includes(neighbor_go_str)) {
                    adjacent_opposite_color.push(neighbor_go_str);
                }
            }
        }
        let new_go_str = new GoString(player, new Set([point.toString()]), new Set(liberties));
        this.grid.set(point.toString(), new_go_str);

        for (const other_color_string of adjacent_opposite_color) {
            other_color_string.remove_liberty(point);
        }
        for (const other_color_string of adjacent_opposite_color) {
            if (other_color_string.liberties.size===0) {
                this._remove_string(other_color_string);
            }
        }

        for (const sameColorString of adjacent_same_color) {
            new_go_str = new_go_str.merge_with(sameColorString);
        }
        if (new_go_str.liberties.size===0) {
            for (const other_color_string of adjacent_opposite_color) {
                other_color_string.add_liberty(point);
            }
            this.grid.delete(point.toString());
            return false;
        }
        for (const new_str_pt_str of new_go_str.stones) {
            this.grid.set(new_str_pt_str, new_go_str);
        }

        return true;
    }

    isEqualWith(other) {
        if (this.grid.size!==other.grid.size) return false;
        for (const [pt_str, go_string] of this.grid) {
            const other_go_string = other.grid.get(pt_str);
            if (other_go_string===undefined || other_go_string.color!==go_string.color) {
                return false;
            }
        }

        return true;
    }
}

// export {Point,Player, Board};



