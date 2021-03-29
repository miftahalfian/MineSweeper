var Cell = require("Cell");

cc.Class({
    extends: cc.Component,

    properties: {
        cellPrefab: cc.Prefab,
        layout: cc.Node,
        scroll: cc.Node,
        dark: cc.Node,
        panel: cc.Node,
        panel2: cc.Node,
        reloadBtn: cc.Node,
        lblJudul: cc.Label,
        lblTime: cc.Label,
        lblMine: cc.Label,
        lblWinTime: cc.Label,
        lblBestTime: cc.Label,
        cells: {
            default: [],
            type: Cell
        },
        touchAudio: cc.AudioClip
    },

    // LIFE-CYCLE CALLBACKS:

    ctor () {
        this.hasSetupMinefield = false;
        this.safeCellCount = 0;
        this.revealedCellCount = 0;
        this.flaggedCellCount = 0;
        this.finished = false;
        this.started = false;
        this.selectedCol = 0;
        this.selectedRow = 0;
        this.totalCol = 0;
        this.totalRow = 0;
        this.totalMine = 0;
        this.time = 0;
        this.levelName = "beginner";
    },

    onLoad () {
        this.layout.width = this.scroll.width;
        this.layout.height = this.scroll.height;
        this.reloadBtn.active = false;
        cc.log("layout width: " + this.layout.width);
        cc.log("layout height: " + this.layout.height);
    },

    start () {
        this.layout.width = this.scroll.width;
        this.layout.height = this.scroll.height;
        this.reloadBtn.active = false;
        cc.log("layout width: " + this.layout.width);
        cc.log("layout height: " + this.layout.width);
    },

    beginnerClick () {
        this.dark.active = false;
        this.panel.active = false;
        this.levelName = "beginner";
        this.initiateArray(9, 9, 10);
        cc.audioEngine.playEffect(this.touchAudio, false);
    },

    intermediateClick () {
        this.dark.active = false;
        this.panel.active = false;
        this.levelName = "intermediate";
        this.initiateArray(16, 16, 40);
        cc.audioEngine.playEffect(this.touchAudio, false);
    },

    expertClick () {
        this.dark.active = false;
        this.panel.active = false;
        this.levelName = "expert";
        this.initiateArray(25, 25, 99);
        cc.audioEngine.playEffect(this.touchAudio, false);
    },

    initiateArray (total_col, total_row, total_mine) {
        this.reloadBtn.active = true;
        this.totalCol = total_col;
        this.totalRow = total_row;
        this.totalMine = total_mine;

        this.lblMine.string = this.flaggedCellCount + "/" + this.totalMine;

        this.cells = new Array(total_row);

        let cellSize = 100;

        //hitung perkiraan lebar dan tinggi layout
        let w = cellSize * total_col;
        let h = cellSize * total_row;

        //sesuaikan ukuran cell agar pas di layout
        let sw = this.layout.width / w;
        let sh = this.layout.height / h;

        if (sw < sh) {
            cellSize *= sw;
        }
        else {
            cellSize *= sh;
        }

        //atur agar ukuran cell tidak melebihi 100 dan tidak kurang dari 70
        if (cellSize > 100) cellSize = 100;
        else if (cellSize < 70) cellSize = 70;

        //atur ukuran layout
        w = cellSize * total_col;
        h = cellSize * total_row;
        if (w > this.layout.width) this.layout.width = w;
        if (h > this.layout.height) this.layout.height = h;

        let dw = (this.layout.width - w)/2;
        let dh = (this.layout.height - h)/2;

        let left =  (cellSize/2) + dw;
        let top  = -(cellSize/2) - dh;

        cc.log("dw: " + dw);
        cc.log("dh: " + dh);
        cc.log("left: " + left);
        cc.log("top: " + top);

        var counter = 0;

        for (var y = 0; y < total_row; y++) {
            if (y % 2 == 0) counter = 0;
            else counter = 1;

            this.cells[y] = new Array(total_col);
            for (var x = 0; x < total_col; x++) {
                var cellNode = cc.instantiate(this.cellPrefab);

                let dist = Math.sqrt((x * x) + (y * y));

                cellNode.scale = 0;
                cellNode.runAction(cc.sequence(
                    cc.delayTime(dist * 0.1),
                    cc.scaleTo(0.1, 1)
                ));

                cellNode.on("klik", this.cellClick, this);
                cellNode.on("flagged", this.cellFlagged, this);
                this.layout.addChild(cellNode);

                cellNode.x = left + cellSize * x;
                cellNode.y = top - cellSize * y;

                var cell = cellNode.getComponent(Cell);
                cell.x = x;
                cell.y = y;
                cell.setSize(cellSize);
                this.cells[y][x] = cell;

                counter++;

                if (counter % 2 == 0) {
                    let closedColor = cc.Color.WHITE;
                    let openColor = cc.Color.WHITE;

                    cc.Color.fromHEX(closedColor, "#b4d465");
                    cc.Color.fromHEX(openColor, "#e0c3a3");

                    cell.closedColor = closedColor;
                    cell.openColor = openColor;
                }
                else {
                    let closedColor = cc.Color.WHITE;
                    let openColor = cc.Color.WHITE;

                    cc.Color.fromHEX(closedColor, "#acce5e");
                    cc.Color.fromHEX(openColor, "#d2b99d");

                    cell.closedColor = closedColor;
                    cell.openColor = openColor;
                }

                cell.refreshColor();
            }
        }
    },

    setupMineField (x, y) {
        this.started = true;
        for (let mineIndex = 0; mineIndex < this.totalMine;) {
            let randX = Math.floor(Math.random() * this.totalCol);
            let randY = Math.floor(Math.random() * this.totalRow);

            let cell = this.cells[randY][randX];

            let xDist = Math.abs(randX - x);
            let yDist = Math.abs(randY - y);

            if (randX == x && randY == y) continue;
            if (xDist == 1 || yDist == 1) continue;
            if (cell.isMine) continue;

            cell.isMine = true;

            this.addAdjacent(randX - 1, randY + 1);
            this.addAdjacent(randX, randY + 1);
            this.addAdjacent(randX + 1, randY + 1);
            this.addAdjacent(randX - 1, randY);
            //current
            this.addAdjacent(randX + 1, randY);
            this.addAdjacent(randX - 1, randY - 1);
            this.addAdjacent(randX, randY - 1);
            this.addAdjacent(randX + 1, randY - 1);

            ++mineIndex;
        }

        this.safeCellCount = (this.totalRow * this.totalCol) - this.totalMine;

        this.hasSetupMinefield = true;
    },

    addAdjacent(x, y) {
        if (x < 0 || x >= this.totalCol || y < 0 || y >= this.totalRow) {
            return;
        }

        let cell = this.cells[y][x];
        cell.totalMineAdjacent++;
    },

    cellFlagged (value) {
        if (this.finished) return;

        cc.audioEngine.playEffect(this.touchAudio, false);

        if (value) this.flaggedCellCount++;
        else this.flaggedCellCount--;

        this.lblMine.string = this.flaggedCellCount + "/" + this.totalMine;

        if (this.flaggedCellCount == this.totalMine) {
            if (this.isAllFlaggedCellCorrect) {
                this.endGame(true);
            }
        }
    },

    cellClick (cell) {
        if (this.finished) return;

        cc.log(cell);

        let x = cell.x;
        let y = cell.y;

        if (!this.hasSetupMinefield) {
            this.setupMineField(x, y);
        }

        cc.log("clicked on: " + x + "," + y);
        cc.log("isMine? " + cell.isMine);

        if (cell.isFlag) return;

        this.selectedCol = x;
        this.selectedRow = y;

        cell.reveal(0);
        this.revealedCellCount++

        if (cell.isMine) {
            this.endGame(false);
        }
        else {
            if (cell.totalMineAdjacent == 0) {
                this.floodReveal(x, y);
            }

            if (this.revealedCellCount >= this.safeCellCount) {
                this.endGame(true);
            }
        }
    },

    floodReveal (x, y) {
        let cell = this.cells[y][x];

        if (cell.isFlag) {
            return;
        }

        if (!cell.isOpen) {
            let dist = Math.sqrt(Math.pow(x - this.selectedCol, 2) + Math.pow(y - this.selectedRow, 2));

            cell.reveal(dist * 0.15);
            this.revealedCellCount++
        }

        if (cell.totalMineAdjacent != 0) {
            return;
        }

        this.floodRevealAdjacent(x + 1, y + 1);
        this.floodRevealAdjacent(x - 1, y + 1);
        this.floodRevealAdjacent(x + 1, y - 1);
        this.floodRevealAdjacent(x - 1, y - 1);
        this.floodRevealAdjacent(x + 1, y);
        this.floodRevealAdjacent(x - 1, y);
        this.floodRevealAdjacent(x, y + 1);
        this.floodRevealAdjacent(x, y - 1);
    },

    floodRevealAdjacent (x, y) {
        if (x < 0 || x >= this.totalCol || y < 0 || y >= this.totalRow) {
            return;
        }

        let cell = this.cells[y][x];

        if (cell.isMine) return;
        if (cell.isOpen) return;

        this.floodReveal(x, y);
    },

    endGame (isWin) {
        if (!isWin) {
            this.revealAllMines();
        }
        else {
            this.showWin(true);
        }

        this.finished = true;
        this.started = false;
    },

    showWin (isWin) {
        this.dark.active = true;
        this.panel2.active = true;

        if (isWin) this.lblJudul.string = "You Win!";
        else this.lblJudul.string = "You Lose!";
        
        if (isWin) this.lblWinTime.string = this.lblTime.string;
        else this.lblWinTime.string = "--:--";

        let bestTime = cc.sys.localStorage.getItem(this.levelName + "_terbaik");
        cc.log("best time: " + bestTime);

        if (isNaN(bestTime) || bestTime == null) {
            if (isWin) {
                this.lblBestTime.string = this.lblWinTime.string;
                cc.sys.localStorage.setItem(this.levelName + "_terbaik", this.time.toString());
            }
            else this.lblWinTime.string = "--:--";
            return;
        }

        if (isWin && this.time < bestTime) {
            cc.sys.localStorage.setItem(this.levelName + "_terbaik", this.time.toString());
            bestTime = this.time;
        }

        let minute = Math.floor(bestTime / 60);
        let second = Math.floor(bestTime - (minute * 60));

        let minuteStr = minute < 10 ? "0" + minute : minute;
        let secondStr = second < 10 ? "0" + second : second;

        this.lblBestTime.string = minuteStr + ":" + secondStr;
    },

    menuClick () {
        cc.audioEngine.playEffect(this.touchAudio, false);
        cc.director.loadScene("game");
    },

    revealAllMines () {
        var dist = 0;
        for (var y = 0; y < this.totalRow; y++) {
            for (var x = 0; x < this.totalCol; x++) {
                if (this.cells[y][x].isMine && !this.cells[y][x].isFlag) {
                    dist = Math.sqrt(Math.pow(x - this.selectedCol, 2) + Math.pow(y - this.selectedRow, 2));
                    this.cells[y][x].reveal(dist * 0.25);
                }
            }
        }

        this.node.runAction(cc.sequence(
            cc.delayTime(2 + dist * 0.2),
            cc.callFunc(() => {
                this.showWin(false);
            }, this)
        ))
    },

    isAllFlaggedCellCorrect () {
        for (var y = 0; y < this.totalRow; y++) {
            for (var x = 0; x < this.totalCol; x++) {
                if (this.cells[y][x].isFlag && !this.cells[y][x].isMine) {
                    return false;
                }
            }
        }

        return true;
    },

    reloadClick () {
        cc.audioEngine.playEffect(this.touchAudio, false);
        this.started = false;
        this.finished = false;
        this.hasSetupMinefield = false;
        this.time = 0;
        this.safeCellCount = 0;
        this.flaggedCellCount = 0;
        this.revealedCellCount = 0;

        this.dark.active = false;
        this.panel.active = false;
        this.panel2.active = false;

        this.layout.removeAllChildren();
        this.cells.splice(0, this.cells.length);
        this.initiateArray(this.totalCol, this.totalRow, this.totalMine);
    },

    update (dt) {
        if (this.started) {
            this.time += dt;

            let minute = Math.floor(this.time / 60);
            let second = Math.floor(this.time - (minute * 60));

            let minuteStr = minute < 10 ? "0" + minute : minute;
            let secondStr = second < 10 ? "0" + second : second;
            this.lblTime.string = minuteStr + ":" + secondStr;
        }
    },
});
