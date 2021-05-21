var Cell = cc.Class({
    extends: cc.Component,

    properties: {
        x: 0,
        y: 0,
        isOpen: false,
        isMine: false,
        isFlag: false,
        totalMineAdjacent: 0,
        mine: cc.Node,
        flag: cc.Node,
        label: cc.Label,
        explosionParticle: cc.ParticleSystem,
        closedColor: cc.Color.WHITE,
        openColor: cc.Color.GRAY,
        explosionSound: cc.AudioClip,
        flipSound: cc.AudioClip
    },

    ctor () {
        this.isClick = false;
        this.clickTime = 0;
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        /*var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This node is the node to which your event handler code component belongs
        clickEventHandler.component = "Cell";// This is the code file name
        clickEventHandler.handler = "buttonClick";

        var button = this.node.getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);*/

        if (cc.sys.isMobile) {
            this.node.on("touchstart", this.onTouchStart, this, true);
            this.node.on("touchend", this.onTouchEnd, this, true);
        }
        else {
            this.node.on("mouseup", this.onMouseUp, this, true);
        }

        this.node.color = this.closedColor;
    },

    refreshColor () {
        if (this.isOpen) {
            this.node.color = this.openColor;
        }
        else this.node.color = this.closedColor;
    },

    start () {

    },

    onTouchStart (event) {
        if (this.isOpen) return;

        this.isClick = true;
    },

    onTouchEnd (event) {
        if (this.clickTime < 0.3) {
            this.singleTap();
        }
        
        this.clickTime = 0;
        this.isClick = false;
    },

    onMouseUp (event) {
        if (event.getButton() == cc.Event.EventMouse.BUTTON_LEFT) {
            this.singleTap();
        }
        else if (event.getButton() == cc.Event.EventMouse.BUTTON_RIGHT) {
            this.longPress();
        }
    },

    singleTap () {
        this.node.emit("klik", this);
    },

    longPress () {
        if (!this.isOpen) {
            this.setFlag(!this.isFlag);
        }
    },

    reveal (time) {
        if (this.isOpen) return;
        this.isOpen = true;

        if (this.isMine) {
            this.node.runAction(cc.sequence(
                cc.delayTime(time),
                cc.tintTo(0.2, 255, 0, 0),
                cc.callFunc(() => {
                    if (!cc.sys.isMobile) this.explosionParticle.resetSystem();
                    cc.audioEngine.playEffect(this.explosionSound, false);
                }, this)
            ));

            this.mine.active = true;
            this.mine.scale = 0;

            this.mine.runAction(cc.sequence(
                cc.delayTime(time + 0.1),
                cc.scaleTo(0.2, this.node.width / 100).easing(cc.easeBackOut())
            ));
        }
        else {
            this.node.runAction(cc.sequence(
                cc.delayTime(time),
                cc.callFunc(() => {
                    cc.audioEngine.playEffect(this.flipSound, false);
                }, this),
                cc.tintTo(0.2, this.openColor.r, this.openColor.g, this.openColor.b)
            ));

            if (this.totalMineAdjacent > 0) {
                this.label.node.active = true;
                this.label.string = this.totalMineAdjacent;
                this.label.node.scale = 0;

                this.label.node.runAction(cc.sequence(
                    cc.delayTime(time + 0.1),
                    cc.scaleTo(0.2, this.node.width / 100).easing(cc.easeBackOut())
                ));
            }
        }
    },

    setFlag (value) {
        this.isFlag = value;

        this.flag.active = value;
        this.node.emit("flagged", value);

        this.flag.stopAllActions();

        this.flag.scale = 0;

        if (value) {
            this.flag.runAction(cc.scaleTo(0.2, this.node.width / 100).easing(cc.easeBackOut()));
        }
        else {
            this.flag.runAction(cc.scaleTo(0.2, 0).easing(cc.easeBackOut()));
        }
    },

    setSize (size) {
        this.node.width = size;
        this.node.height = size;

        let scale = size/100;
        this.flag.scale = scale;
        this.mine.scale = scale;
        this.label.node.scale = scale;
    },
    
    update (dt) {
        if (this.isClick) {
            this.clickTime += dt;
            if (this.clickTime > 0.3) {
                this.isClick = false;
                this.longPress();
            }
        }
    },
});
