cc.Class({
    extends: cc.Component,

    properties: {
        isTouched:true,

        score:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // console.log(this.node.parent.getComponent("Game").autoStair.data.children[1])

        // touch事件结束后
        this.node.parent.on(cc.Node.EventType.TOUCH_START,function(event){
            // 开启物理碰撞
            var manager = cc.director.getCollisionManager();
            if (manager.enabled == false) {
                manager.enabled = true;
            }

            // this.scheduleOnce(function(){

            //     this.checkIsFailed();
            // },0.2);
        },this)
        // 预加载场景
        cc.director.preloadScene("OverGame");
    },

    start () {
        
    },

    // update (dt) {},

    // 碰撞系统回调
    // 开始碰撞
    onCollisionEnter: function (other, self) {
        this.isTouched = true;
        console.log(other.tag)
        //tag为0代表碰撞到的是正常的台阶，其他的为障碍
        if (other.tag == 0||other.tag == -1) {
            //把分数存储到本地
            this.score++;
            if(this.score > 30){
                this.node.parent.getComponent("Game").obstructRisk = 0.2
                this.node.parent.getComponent("Game").obstructRoadRisk = 0.3
            }else if(this.score >50){
                this.node.parent.getComponent("Game").obstructRisk = 0.3
                this.node.parent.getComponent("Game").obstructRoadRisk = 0.4
            }
            cc.sys.localStorage.setItem("score",this.score);
            var timeLabel = cc.find("Canvas/time").getComponent(cc.Label);   //find为查找场景下对应的组件，getComponent为对应的组件类型

             //find为查找场景下对应的组件，getComponent为对应的组件类型
            //  console.log(this.node.parent.getComponent("Game").cheat)
            if(other.tag == -1) {

                cc.audioEngine.pause(this.node.parent.getComponent("Game").bgmusic);
                
                var wudimusic = cc.audioEngine.play(this.node.parent.getComponent("Game").wudiAudio, true, 0.3);
                other.node.children[1].opacity = 0
                this.node.parent.getComponent("Game").cheat = true;
                this.node.parent.getComponent("Game").moveDuration = 0.15;
                this.node.parent.getComponent("Game").moveDuration2 = 0.075;
                // console.log(timeLabel.string)
                timeLabel.string = 5
                this.schedule(function() {
                    timeLabel.string -= 1
                }, 1, 3, 1);
                this.scheduleOnce(function(){
                    this.node.parent.getComponent("Game").cheat = false;
                    this.node.parent.getComponent("Game").noqiu = true;
                    this.node.parent.getComponent("Game").moveDuration = 0.2;
                    this.node.parent.getComponent("Game").moveDuration2 = 0.1;
                    this.node.parent.getComponent("Game").stairDownSecond = 2;
                    timeLabel.string = ""
                    cc.audioEngine.stop(wudimusic);
                    cc.audioEngine.resume(this.node.parent.getComponent("Game").bgmusic);
                    this.node.parent.getComponent("Game").nowudi = true;
                },5);
            }
            //获取在Canvas上的分数label来更新分数
            var scoreLabel = cc.find("Canvas/scoreLabel").getComponent(cc.Label);   //find为查找场景下对应的组件，getComponent为对应的组件类型
            if (scoreLabel) {
                scoreLabel.string = this.score;
            }
        } else {
            cc.audioEngine.stop(this.node.parent.getComponent("Game").bgmusic);
            var abc = cc.audioEngine.play(this.node.parent.getComponent("Game").dieAudio, false, 0.3);
            var outAction = cc.fadeOut(0.2,1.0);
            this.node.runAction(outAction);
            this.scheduleOnce(function(){
                cc.director.loadScene("OverGame")
            },0.2);
        }
    },
// 碰撞开始到碰撞结束
    onCollisionStay: function (other, self) {
        // cc.log('on collision stay');
    },
// 结束碰撞
    onCollisionExit: function (other, self) {
        this.isTouched = false;
       
    },

    checkIsFailed: function () {
        if (this.isTouched == false) {
            cc.audioEngine.stop(this.node.parent.getComponent("Game").bgmusic);
                
            var abc = cc.audioEngine.play(this.node.parent.getComponent("Game").dieAudio, false, 0.3);
            cc.log("fail");
            var goAction = cc.moveBy(0.2,cc.v2(0,-600));
            this.node.runAction(goAction);
            this.scheduleOnce(function(){
                cc.director.loadScene("OverGame")
            },0.2);
        }
    },
});
