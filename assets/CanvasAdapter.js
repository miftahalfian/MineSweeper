function onResize() {
    var scene = cc.director.getScene();
    const canvas = scene.getComponentInChildren(cc.Canvas);
    if (!canvas) return;

    const designSize = cc.view.getDesignResolutionSize();
    const frameSize = cc.view.getFrameSize();

    if (frameSize.height / designSize.height < frameSize.width / designSize.width) {
        canvas.fitHeight = true;
        canvas.fitWidth = false;
        cc.log("fitHeight cuy!!");
    } else {
        canvas.fitWidth = true;
        canvas.fitHeight = false;
        cc.log("fitWidth cuy!!");
    }

    var scene = cc.director.getScene();
    scene.getComponentsInChildren(cc.Widget).forEach(wg => {
        wg.updateAlignment();
    });

    cc.log("diresize cuy!!");
}

cc.Class({
    extends: cc.Component,

    onLoad() {
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onResize);
        onResize();
    },

    onDestroy() {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, onResize);
    },
});