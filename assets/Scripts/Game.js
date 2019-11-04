// var tmpStair = require("Stair");
cc.Class({
    extends: cc.Component,

    properties: {
        player:{
            default:null,
            type:cc.Node
        },

        stair:{
            default:null,
            type:cc.Prefab
        },
        autoStair:{
            default:null,
            type:cc.Prefab
        },

        scoreLabel:{
            default:null,
            type:cc.Label
        },
        timeLabel:{
            default:null,
            type:cc.Label
        },

        nodeView: {
            default:null,
            type:cc.Node
        },
        GameBG: {
            default:null,
            type:cc.Node
        },
        bgAudio: {
            default: null,
            type: cc.AudioClip
        },
        wudiAudio: {
            default: null,
            type: cc.AudioClip
        },
        dieAudio: {
            default: null,
            type: cc.AudioClip
        },

        score:0,

        stairCount:0,
        otherStairCount:3000,

        moveDuration:0.2,
        moveDuration2:0.1,

        stairWidth:120,
        stairHeight:80,

        preStairX:0,
        preStairY:0,
        continuous:0,

        otherStairs:[cc.Prefab],

        gameIsStart:false,

        time:0,
        stairDownSecond:0,
        gameOverSecond:1,

        isMoved:false,

        arr:[],
        autoArr:[],
        cheat:false,
        admin:false,
        actionState:0,
        obstructRisk:0.1,
        obstructRoadRisk:0,
        bgmusic:0,
        diemusic:0,
        wudimusic:0,
        nowudi:true,
        noqiu:true
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(this.stair)
        this.player.zIndex = 9999
        if(cc.sys.localStorage.getItem("code") == "dcdawyx"){
            this.admin = true
        }
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;

        
        //以下代码为显示物理碰撞的范围
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;

        this.player.setPosition(0,-200);

        this.setInputControl();

        for(var i=0;i<9;i++)
        {
            this.newStair();
        }

        this.player.zIndex = 1;
        this.scoreLabel.node.zIndex = 1;

        cc.director.preloadScene("OverGame");

    },

    setInputControl: function() {
        this.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this)
    },

    playerMoveLeft: function() {
        //角色跳跃的效果
        this.isMoved = true;
        var goL1 = cc.moveTo(this.moveDuration2,cc.v2(this.player.position.x,this.player.position.y+this.stairHeight/2));
        var goL2 = cc.moveTo(this.moveDuration2,cc.v2(this.player.position.x,this.player.position.y));
        // var callback = cc.callFunc(this.isNotMoving,this,1);
        var sque = cc.sequence(goL1,goL2,cc.callFunc(this.isNotMoving,this,1));
        this.player.scaleX = 1;
        var goAction = cc.sequence(cc.moveBy(this.moveDuration,cc.v2(60,-76)),cc.callFunc(this.isNotMoving,this,-1));
        this.nodeView.runAction(goAction);
        this.player.runAction(sque);

        
    },


    playerMoveRight: function() {
        //角色跳跃的效果
        this.isMoved = true;
        var goR1 = cc.moveTo(this.moveDuration2,cc.v2(this.player.position.x,this.player.position.y+this.stairHeight/2));
        var goR2 = cc.moveTo(this.moveDuration2,cc.v2(this.player.position.x,this.player.position.y));
        // var callback = cc.callFunc(this.isNotMoving, this,type);
        var sque = cc.sequence(goR1,goR2,cc.callFunc(this.isNotMoving,this,1));
        this.player.scaleX = -1;
        var goAction = cc.sequence(cc.moveBy(this.moveDuration,cc.v2(-60,-76)),cc.callFunc(this.isNotMoving,this,-1));
        this.nodeView.runAction(goAction);
        this.player.runAction(sque);

    },

    isNotMoving(target,type){
        this.actionState += type;
        if(this.actionState == 0){
            this.isMoved = false;
            this.player.getComponent("Player").checkIsFailed()
        }
        
    },

    start () {

    },

    update (dt) {
        if (this.gameIsStart) {
            this.time += dt;//dt为每一帧执行的时间，把它加起来等于运行了多长时间  
            if(this.time >= this.stairDownSecond){ 
                // cc.log("每2秒显示一次"+this.stairDownSecond);  
                this.downStair();
                this.time = 0;  //每达到stairDownSecond的值后重置时间为0，以达到循环执行  
            }
            if(this.cheat||this.admin){
                if(this.isMoved == false && this.autoArr[1] == -1){
                    this.time = 0;
                    if (this.stairDownSecond <= this.gameOverSecond) {
                        this.stairDownSecond = this.gameOverSecond;
                    } else {
                        this.stairDownSecond -= 0.02;
                    }
                    // console.log(this.stairDownSecond)
                    this.playerMoveLeft();
                    this.newStairUpToDown();
                    this.autoArr.splice(1,1);
                    
    
                }else if(this.isMoved == false && this.autoArr[1] == 1){
                    this.time = 0;
                    if (this.stairDownSecond <= this.gameOverSecond) {
                        this.stairDownSecond = this.gameOverSecond;
                    } else {
                        this.stairDownSecond -= 0.02;
                    }
    
                    this.playerMoveRight();
                    this.newStairUpToDown();
                    this.autoArr.splice(1,1);
    
                }

            }else{
                if(this.isMoved == false && this.arr[0] == -1){
                    this.playerMoveRight();
                    this.arr.splice(0,1)
                    this.autoArr.splice(1,1);
                }else if(this.isMoved == false && this.arr[0] == 1){
                    this.playerMoveLeft();
                    this.arr.splice(0,1)
                    this.autoArr.splice(1,1);
                }
            }
           


            var num = parseInt((this.player.getComponent("Player").score-50)/50)
            var num1 = num%2;
            var least = (this.player.getComponent("Player").score-50)%50
            if(num1 == 1 && this.player.getComponent("Player").score >50){
                this.GameBG.opacity = 255-least*15

            }else if(num1 !== 1 && this.player.getComponent("Player").score >50){
                this.GameBG.opacity = least*15

            }

            
        }
    },

    //台阶生成
    newStair: function() {
        this.stairCount +=1;
        var newStair = cc.instantiate(this.stair);
        this.nodeView.addChild(newStair,-1);

        var randD = Math.random();

        var stairPosition = this.stairPosition(randD)
        newStair.setPosition(stairPosition);

        if(randD<=0.5){
            this.autoArr.push(-1)
        }else{
            this.autoArr.push(1)         
        }
    },

    //台阶生成带上动画效果
    newStairUpToDown: function() {
        this.stairCount +=1;
        var ran1 = Math.random();
        if(ran1 <= 0.02 && this.cheat == false && this.noqiu){
            var newStair = cc.instantiate(this.autoStair);
            this.nodeView.addChild(newStair,this.otherStairCount);
            this.noqiu = false;

        }else{
            var newStair = cc.instantiate(this.stair);
            this.nodeView.addChild(newStair);
        }
        this.otherStairCount--;

        var randD = Math.random();

        var stairPosition = this.stairPosition(randD)
        newStair.setPosition(cc.v2(stairPosition.x,stairPosition.y+100));
        // 自动跳
        if(randD<=0.5){
            this.autoArr.push(-1)
        }else{
            this.autoArr.push(1)
        }
        // 自动跳
        var goAction = cc.moveTo(this.moveDuration2,stairPosition);
        newStair.runAction(goAction);
        
    },

    newOtherStair: function(isLeft,position) {
        if (this.stairCount == 1) {
            return;
        }

        var hasOther = false;
        var randD = Math.random();

        //生成障碍台阶的概率
        if (randD <= this.obstructRisk) {
            hasOther = true;
        }

        if (hasOther) {
            var rand2 = Math.random()
            var count = Math.ceil(Math.random() * 2) - 1;
            if(rand2 < this.obstructRoadRisk&&this.nowudi){
                    this.nowudi = false;
                    var newStair1 = cc.instantiate(this.stair);
                    var newStair2 = cc.instantiate(this.stair);
                    var newStair3 = cc.instantiate(this.otherStairs[count]);


                    this.nodeView.addChild(newStair1,this.otherStairCount);
                    this.nodeView.addChild(newStair2,this.otherStairCount);
                    this.nodeView.addChild(newStair3,this.otherStairCount);

                    
                    if (isLeft) {
                        newStair1.setPosition(this.preStairX+this.stairWidth/2,position.y);
                        newStair2.setPosition(this.preStairX+this.stairWidth,position.y+76);
                        newStair3.setPosition(this.preStairX+this.stairWidth/2*3+30,position.y+152);

                    } else {
                        newStair1.setPosition(this.preStairX-this.stairWidth/2,position.y);
                        newStair2.setPosition(this.preStairX-this.stairWidth,position.y+76);
                        newStair3.setPosition(this.preStairX-this.stairWidth/2*3,position.y+152);

                    }
                
            }else{
                var newStair = cc.instantiate(this.otherStairs[count]);

                this.otherStairCount--;

                this.nodeView.addChild(newStair,this.otherStairCount);
                if (isLeft) {
                    newStair.setPosition(this.preStairX+this.stairWidth/2-2,position.y+20);
                } else {
                    newStair.setPosition(this.preStairX-this.stairWidth/2+2,position.y+20);
                }
            }
            

            //如果生成的台阶在左，那障碍就在右
            
        }
    },

    stairPosition: function(randD) {
        var randX = 0;
        var randY = 0;
        var isLeft = true;
        if (randD <= 0.5) {

        } else {
            isLeft = false;
        }

        if (this.stairCount == 1) {
            randX = this.player.position.x;
            randY = this.player.position.y - 60;
        } else {
            if (isLeft) {
                randX = this.preStairX - this.stairWidth/2;
            } else {
                randX = this.preStairX + this.stairWidth/2;
                if (this.stairCount == 2) {
                    this.player.scaleX = -1;
                }
            }
            randY = this.preStairY + 76;
        }
        var position = cc.v2(randX,randY);
        this.newOtherStair(isLeft,position);

        this.preStairX = randX;
        this.preStairY = randY;

        return position;
    },

    downStair: function() {
        // this.schedule(function(){
        var childrens = this.nodeView.children;
        var length = childrens.length;
        for(var i=0; i<length; i++){
            var stairPrefab = childrens[i];

            var newStair = stairPrefab.getComponent("Stair");

            if (newStair.isUsed) {
                if (newStair.isStanding) {

                    this.gameIsStart = false;

                    this.node.off(cc.Node.EventType.TOUCH_START,
                        this.on_touch_start ,this);

                    var downAction = cc.moveBy(0.4,cc.v2(0,-400));
                    var callback = cc.callFunc(this.gameIsOver, this);   //callFunc在动画执行完毕后调用哪个方法

                    var seq = cc.sequence(downAction,callback);
                    this.player.runAction(seq);

                    var goAction = cc.moveBy(0.5,cc.v2(0,-600));
                    var fadeAction = cc.fadeOut(0.2,1.0);
            
                    var spa = cc.spawn(goAction,fadeAction);    //spawn让动画同时进行
                    newStair.node.runAction(spa);
                } else {
                    var goAction = cc.moveBy(0.8,cc.v2(0,-600));
                    var fadeAction = cc.fadeOut(0.5,1.0);
            
                    var spa = cc.spawn(goAction,fadeAction);    //spawn让动画同时进行
                    newStair.node.runAction(spa);
                }
            }
        }         
        // },this.stairDownSecond);
    },

    moveDownStair: function() {

    },

    //动画完成后加载Over场景
    gameIsOver: function () {
        cc.audioEngine.stop(this.bgmusic);
        var abc = cc.audioEngine.play(this.dieAudio, false, 0.3);
        this.unschedule()
        cc.director.loadScene("OverGame")
        // this.node.off(this);    //移除所有点击事件
    },

    onTouchStart: function(event){
        if(this.gameIsStart == false){
            this.bgmusic = cc.audioEngine.play(this.bgAudio, true, 0.3);
        }
        let location = event.touch.getLocation();
        let locationX = location.x;
        if (locationX > this.node.width/2 && this.cheat !==true) {
            this.arr.push(-1)
        } else if(locationX <= this.node.width/2 && this.cheat !==true){
            this.arr.push(1)
        }
        this.newStairUpToDown();
        // if (this.gameIsStart == false) {
        this.gameIsStart = true;
        this.time = 0;

            // this.downStair();
        // }

        if (this.stairDownSecond <= this.gameOverSecond) {
            this.stairDownSecond = this.gameOverSecond;
        } else {
            this.stairDownSecond -= 0.02;
            // console.log(this.stairDownSecond)
        }
    },
});
