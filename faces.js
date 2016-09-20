(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.faces = factory();
    }
}(this, function () {
    "use strict";

    var eye = {}, eyebrow = {}, hair = {}, head = {}, mouth = {}, nose = {}, cheeks = {};
    var featureInfo = {};
    
    function newPath(paper) {
        var e;
        e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        paper.appendChild(e);
        return e;
    }

    function newDefs(paper) {
        var e;
        e = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        paper.appendChild(e);
        return e;
    }

    // Rotate around center of bounding box of element e, like in Raphael.
    function rotateCentered(e, angle) {
        var bbox, cx, cy;

        bbox = e.getBBox();
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
        e.setAttribute("transform", "rotate(" + angle + " " + cx + " " + cy + ")");
    }

    // Scale relative to the center of bounding box of element e, like in Raphael.
    // Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
    function scaleCentered(e, x, y) {
        var bbox, cx, cy, strokeWidth, tx, ty;

        bbox = e.getBBox();
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
        tx = (cx * (1 - x)) / x;
        ty = (cy * (1 - y)) / y;

        e.setAttribute("transform", "scale(" + x + " " + y + "), translate(" + tx + " " + ty + ")");

        // Keep apparent stroke width constant, similar to how Raphael does it (I think)
        strokeWidth = e.getAttribute("stroke-width");
        if (strokeWidth) {
            e.setAttribute("stroke-width", strokeWidth / Math.abs(x));
        }
    }

    // Defines the range of fat/skinny, relative to the original width of the default head.
    function fatScale(fatness) {
        return 0.75 + 0.25 * fatness;
    }

    function addFeature (obj, id, affect, func) {
        obj[id] = func;
        featureInfo[id] = {};
        Object.keys(affect).forEach (function (emotion) {
            featureInfo[id][emotion] = affect[emotion];
        });
    }

    var allEmotions = ['happy', 'angry', 'sad', 'surprised']
    function affects (face) {
        var emotionScore = {}
	allEmotions.forEach (function (emotion) { emotionScore[emotion] = 0 })

        var taggedFeatures = [face.eyebrows[0], face.eyes[0], face.cheeks[0], face.mouth]
        taggedFeatures.forEach (function (obj) {
            var id = obj.id
            Object.keys (featureInfo[id]).forEach (function (emotion) {
                emotionScore[emotion] += featureInfo[id][emotion]
            })
        })

        var eyeAngle = face.eyes[0].angle
        if (eyeAngle > 15) {
            emotionScore.angry += .5
        } else if (eyeAngle > 5) {
            emotionScore.angry += .25
            emotionScore.sad += .25
        } else if (eyeAngle < -15) {
            emotionScore.angry -= .5
            emotionScore.sad += .25
        } else if (eyeAngle < -5) {
            emotionScore.angry -= .25
            emotionScore.sad += .1
        }

        var maxScore, maxEmotions = []
        Object.keys(emotionScore).forEach (function (emotion) {
            if (typeof(maxScore) === 'undefined' || emotionScore[emotion] > maxScore) {
                maxScore = emotionScore[emotion]
                maxEmotions = [emotion]
            } else if (emotionScore[emotion] == maxScore)
                maxEmotions.push (emotion)
        })
//        console.log(taggedFeatures.map(function(obj){return obj.id}).concat(['eye angle: ' + eyeAngle]))
//        console.log(emotionScore)
//        console.log("Net affect: " + maxEmotions.join('/'))
        return maxEmotions
    }

    // seeded pseudorandom numbers
    var seed = 6;
    function seedRandomNumbers (newSeed) {  // 0 <= newSeed < 1
	seed = Math.floor (newSeed * 233280)
    }
    function randomNumber() {
	seed = (seed * 9301 + 49297) % 233280;
	return seed / 233280;
    }
    
    addFeature (head, 'genericHead', {}, function (paper, fatness, color) {
        // generic
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 0,0 180,-10 180,200" +
                       "c 0,0 0,210 -180,200" +
                       "c 0,0 -180,10 -180,-200" +
                       "c 0,0 0,-210 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'eggLike', {}, function (paper, fatness, color) {
        // egg-like
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c 0,100 -80,200 -180,200" +
                       "c -100,0 -180,-100 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'pointyChin', {}, function (paper, fatness, color) {
        // pointy chin
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 50,0 180,50 180,200" +
                       "c 0,50 -80,150 -180,200" +
                       "c -50,0 -180,-150 -180,-200" +
                       "c 0,-50 30,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'squareJaw', {}, function (paper, fatness, color) {
        // square jaw
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 50,0 180,50 180,200" +
                       "c 0,50 -160,210 -150,200" +
                       "c -10,10 -50,10 -60,0" +
                       "c 10,10 -150,-150 -150,-200" +
                       "c 0,-50 30,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'slightDoubleChin', {}, function (paper, fatness, color) {
        // slight double chin
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 50,0 180,50 180,200" +
                       "c 0,150 -160,210 -150,200" +
                       "c -10,10 -50,10 -60,0" +
                       "c 10,10 -150,-50 -150,-200" +
                       "c 0,-50 30,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'saggyCheeksDoubleChin', {}, function (paper, fatness, color) {
        // saggy cheeks and double chin
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 50,0 180,50 180,200" +
                       "c 0,250 -160,210 -150,200" +
                       "c -10,10 -50,10 -60,0" +
                       "c 10,10 -150,50 -150,-200" +
                       "c 0,-50 30,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'saggyCheeks', {}, function (paper, fatness, color) {
        // saggy cheeks
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c 0,200 -80,200 -180,200" +
                       "c -100,0 -180,0 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'verySaggyCheeks', {}, function (paper, fatness, color) {
        // very saggy cheeks
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c 0,250 -80,200 -180,200" +
                       "c -100,0 -180,50 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'narrowCheeks', {}, function (paper, fatness, color) {
        // saggy but narrow cheeks
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c -50,250 -80,200 -180,200" +
                       "c -100,0 -130,50 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'pinchedCheeks', {}, function (paper, fatness, color) {
        // pinched cheeks
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c -100,250 -80,200 -180,200" +
                       "c -100,0 -80,50 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (head, 'veryPinchedCheeks', {}, function (paper, fatness, color) {
        // very pinched cheeks
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 100,0 180,100 180,200" +
                       "c -140,250 -80,200 -180,200" +
                       "c -100,0 -30,50 -180,-200" +
                       "c 0,-100 80,-200 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (eyebrow, 'downCurvedBrows', {angry:+.6}, function (paper, lr, cx, cy) {
        // down-curved
        var e, x = cx - 30, y = cy - 10;

        e = newPath(paper);
        if (lr === "l") {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 -3,30 60,0");
        } else {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 63,30 60,0");
        }
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (eyebrow, 'furrowedBrows', {angry:+.5,sad:+.25}, function (paper, lr, cx, cy) {
        // furrowed
        var e, x = cx - 30, y = cy - 20;

        e = newPath(paper);
        if (lr === "l") {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 -3,30 60,20");
        } else {
            e.setAttribute("d", "M " + (x+60) + "," + y +
                           "c 0,0 3,30 -60,20");
        }
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (eyebrow, 'upCurvedBrows', {}, function (paper, lr, cx, cy) {
        // generic up-curved
        var e, x = cx - 30, y = cy;

        e = newPath(paper);
        if (lr === "l") {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 -3,-30 60,0");
        } else {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 63,-30 60,0");
        }
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (eyebrow, 'angryStraightBrows', {angry:+1,sad:.75}, function (paper, lr, cx, cy) {
        // angry straight lines
        var e, x = cx - 30, y = cy - 10;

        e = newPath(paper);
        if (lr === "l") {
            e.setAttribute("d", "M " + x + "," + y +
                           "l 60,20");
        } else {
            e.setAttribute("d", "M " + x + "," + (y+20) +
                           "l 60,-20");
        }
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (eye, 'horizontalEyes', {angry:-.5,surprised:-.5}, function (paper, lr, cx, cy, angle) {
        // Horizontal
        var e, x = cx - 30, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "h 60");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });
    addFeature (eye, 'normalEyes', {type:'normal'}, function (paper, lr, cx, cy, angle) {
        // Normal (circle with a dot in it)
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 30,20 0 1 1 0.1,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "6");
        e.setAttribute("fill", "#f0f0f0");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + (y - 12) +
                       "a 12,8 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'normalEyesWide', {type:'normal',angry:+1,surprised:+1}, function (paper, lr, cx, cy, angle) {
        // Bigger eyes, bigger pupils
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 35,25 0 1 1 0.1,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "6");
        e.setAttribute("fill", "#f0f0f0");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + (y - 12) +
                       "a 15,10 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'dotEyes', {type:'dot'}, function (paper, lr, cx, cy, angle) {
        // Dot
        var e, x = cx, y = cy + 13;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 20,15 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'dotEyesWide', {type:'dot',angry:+1,surprised:+1}, function (paper, lr, cx, cy, angle) {
        // Dot
        var e, x = cx, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 24,18 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'arcEyelid', {type:'arc'}, function (paper, lr, cx, cy, angle) {
        // Arc eyelid
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 17,17 0 1 1 0.1,0 z");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + (x - 40) + "," + (y - 14) +
                       "c 36,-44 87,-4 87,-4");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "4");
        e.setAttribute("fill", "none");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'arcEyelidWide', {type:'arc',angry:+.7,surprised:+.5}, function (paper, lr, cx, cy, angle) {
        // Arc eyelid, 10% bigger
        var e, x = cx, y = cy + 18;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 18.7,18.7 0 1 1 0.1,0 z");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + (x - 44) + "," + (y - 15.4) +
                       "c 39.6,-48.4 95.7,-4.4 95.7,-4.4");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "4");
        e.setAttribute("fill", "none");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (eye, 'normalEyesCrossed', {type:'normal',angry:+.5,surprised:+.4}, function (paper, lr, cx, cy, angle) {
        // Cross-eyed (circle with a dot in it, shifted closer to center)
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 30,20 0 1 1 0.1,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "6");
        e.setAttribute("fill", "#f0f0f0");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + (lr === "l" ? (x+10) : (x-10)) + "," + (y - 12) +
                       "a 12,8 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature (nose, 'vNose', {}, function (paper, cx, cy, size) {
        // V
        var e, scale = size + 0.5, x = cx - 30, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "l 30,30" +
                       "l 30,-30");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        scaleCentered(e, scale, scale);
    });
    addFeature (nose, 'pinnochioNose', {}, function (paper, cx, cy, size, posY, flip) {
        // Pinnochio
        var e, scale = size + 0.5, x = cx, y = cy - 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + (flip ? x - 48 : x) + "," + y +
                       "c 0,0 50,-30 0,30");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        if (flip) {
            scaleCentered(e, -scale, scale);
        } else {
            scaleCentered(e, scale, scale);
        }
    });
    addFeature (nose, 'bigSingleNose', {}, function (paper, cx, cy, size) {
        // Big single
        var e, scale = size + 0.5, x = cx - 9, y = cy - 25;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 -20,60 9,55" +
                       "c 0,0 29,5 9,-55");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        scaleCentered(e, scale, scale);
    });

    addFeature (mouth, 'thinSmile', {happy:+2.5}, function (paper, cx, cy) {
        // Thin smile
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature (mouth, 'thinFrownMouth', {angry:+1,sad:+1.5}, function (paper, cx, cy) {
        // Thin downturn
        var e, x = cx - 75, y = cy + 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,-60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature (mouth, 'thinFlatMouth', {angry:+.25,sad:+.6}, function (paper, cx, cy) {
        // Thin flat
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "h 110");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature (mouth, 'openSmile', {happy:+3}, function (paper, cx, cy) {
        // Open-mouthed smile, top teeth
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,100 150,0" +
                       "h -150");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 16) + "," + (y + 8) +
                       "l 16,16" +
                       "h 86" +
                       "l 16,-16" +
                       "h -118");
        e.setAttribute("fill", "#f0f0f0");
    });
    addFeature (mouth, 'openSnarl', {angry:+1,sad:+1.1}, function (paper, cx, cy) {
        // Open-mouthed snarl, bottom teeth
        var e, x = cx - 75, y = cy + 25;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,-100 150,0" +
                       "h -150");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 16) + "," + (y - 8) +
                       "l 16,-16" +
                       "h 86" +
                       "l 16,16" +
                       "h -118");
        e.setAttribute("fill", "#f0f0f0");
    });
    addFeature (mouth, 'openMouth', {surprised:+1,angry:.25}, function (paper, cx, cy) {
        // Generic open mouth
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 54,10 0 1 1 110,0" +
                       "a 54,20 0 1 1 -110,0");
    });
    addFeature (mouth, 'surprisedMouth', {surprised:+1}, function (paper, cx, cy) {
        // Surprised "O" mouth
        var e, x = cx - 25, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 25,25 0 1 1 50,0" +
                       "a 25,25 0 1 1 -50,0");
    });
    addFeature (mouth, 'surprisedWithTeeth', {surprised:+1,angry:+.3}, function (paper, cx, cy) {
        // Surprised "O" mouth with teeth
        var e, x = cx - 25, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 25,25 0 1 1 50,0" +
                       "a 25,25 0 1 1 -50,0");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x+11) + "," + (y-9) +
                       "a 17,17 0 0 1 28,0" +
                       "h -28");
        e.setAttribute("fill", "#f0f0f0");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x+11) + "," + (y+9) +
                       "a 17,17 0 0 0 28,0" +
                       "h -28");
        e.setAttribute("fill", "#f0f0f0");
    });

    addFeature (mouth, 'surprisedWithPointyTeeth', {surprised:+1,angry:+.8}, function (paper, cx, cy) {
        // Surprised "O" mouth with pointy teeth
        var e, x = cx - 25, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 25,25 0 1 1 50,0" +
                       "a 25,25 0 1 1 -50,0");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x+11) + "," + (y-9) +
                       "a 17,17 0 0 1 28,0" +
                       "l -4.5,6 l -5,-6 l -4.5,6 l -4.5,-6 l -5,6 l -4.5,-6");
        e.setAttribute("fill", "#f0f0f0");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x+11) + "," + (y+9) +
                       "a 17,17 0 0 0 28,0" +
                       "l -7,-6 l -7,6 l -7,-6 l -7,6");
        e.setAttribute("fill", "#f0f0f0");
    });

    addFeature (mouth, 'thinSmileWithEnds', {happy:+3}, function (paper, cx, cy) {
        // Thin smile with ends
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 145) + "," + (y + 19) +
                       "c 15.15229,-18.18274 3.03046,-32.32488 3.03046,-32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 5) + "," + (y + 19) +
                       "c -15.15229,-18.18274 -3.03046,-32.32488 -3.03046,-32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (mouth, 'thinFrownMouthWithEnds', {sad:+1.5,angry:+1}, function (paper, cx, cy) {
        // Thin downturn with ends
        var e, x = cx - 75, y = cy + 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,-60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 145) + "," + (y - 19) +
                       "c 15.15229,18.18274 3.03046,32.32488 3.03046,32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 5) + "," + (y - 19) +
                       "c -15.15229,18.18274 -3.03046,32.32488 -3.03046,32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    addFeature (mouth, 'blockySnarl', {angry:+1}, function (paper, cx, cy) {
        // Snarl with upper left corner raised & upper & lower teeth showing
        var e, x = cx - 50, y = cy - 25;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "l 100,10 v 40 h -100 v -50");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 8) + "," + (y + 8) +
                       "l 84,8.4 v 6 h -84 v -14.4")
        e.setAttribute("fill", "#f0f0f0");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 8) + "," + (y + 42) +
                       "h 84 v -6 h -84 v 6")
        e.setAttribute("fill", "#f0f0f0");
    });

    addFeature (hair, 'shortHair', {}, function (paper, fatness, color) {
        // Normal short
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 0,0 180,-10 176,150" +
                       "c 0,0 -180,-150 -352,0" +
                       "c 0,0 0,-160 176,-150");
        scaleCentered(e, fatScale(fatness), 1);
	e.setAttribute ("fill", color);
    });
    addFeature (hair, 'flatTopHair', {}, function (paper, fatness, color) {
        // Flat top
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 25,60" +
                       "h 352" +
                       "v 190" +
                       "c 0,0 -180,-150 -352,0" +
                       "v -190");
        scaleCentered(e, fatScale(fatness), 1);
	e.setAttribute ("fill", color);
    });
    addFeature (hair, 'afro', {}, function (paper, fatness, color) {
        // Afro
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 25,250" +
                       "a 210,150 0 1 1 352,0" +
                       "c 0,0 -180,-150 -352,0");
        scaleCentered(e, fatScale(fatness), 1);
	e.setAttribute ("fill", color);
    });

    addFeature (hair, 'cornrowHair', {}, function (paper, fatness, color, density) {
        // Cornrows
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 36,229" +
                       "v -10" +
                       "m 40,-10" +
                       "v -60" +
                       "m 50,37" +
                       "v -75" +
                       "m 50,65" +
                       "v -76" +
                       "m 50,76" +
                       "v -76" +
                       "m 50,93" +
                       "v -75" +
                       "m 50,92" +
                       "v -60" +
                       "m 40,80" +
                       "v -10");
        e.setAttribute("stroke", color);
        e.setAttribute("stroke-linecap", "round");
        e.setAttribute("stroke-width", 10 + 12*density);
        scaleCentered(e, fatScale(fatness), 1);
	e.setAttribute ("fill", color);
    });

    addFeature (hair, 'spikyHair', {}, function (paper, fatness, color, density, angle) {
	// Spiky
	var rads = angle * Math.PI / 180
	var len = 80
	seedRandomNumbers (density)
	var pathText = makeHair (density, function (theta, thetaMax) {
	    var ha = theta + (theta/thetaMax)*rads + randomNumber()*.1
	    return "l" + len*Math.sin(ha) + "," + (-len*Math.cos(ha))
	})

        var e = newPath(paper);
	e.setAttribute ("d", pathText)
        e.setAttribute("stroke", color);
        e.setAttribute("stroke-linecap", "round");
        e.setAttribute("stroke-width", 2 + 4*(1-density));
        scaleCentered(e, fatScale(fatness), 1);
    });

    addFeature (hair, 'bobbleHair', {}, function (paper, fatness, color, density, angle) {
	// Bobbles
	var rads = angle * Math.PI / 180
	var r = 10 + 10*(1-density)
	var pathText = makeHair (density/3, function (theta, thetaMax) {
            return "a "+r+","+r+" 0 1 1 0.1,0"
	})

        var e = newPath(paper);
	e.setAttribute ("d", pathText)
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    function makeHair (density, callback) {
	var xmin = 20, xmax = 380, ymax = 300, ymin = 120

	var w = xmax - xmin, h = ymax - ymin, d = (w*w/4 - h*h) / (2*h)
	var cx = xmin + w/2, cy = ymax + d, r = h + d
	var thetaMax = Math.atan ((w/2) / d)

	var pathText = ''
	for (var theta = -thetaMax; theta <= thetaMax; theta += .1*thetaMax*(1 - density)) {
	    var hx = cx + r*Math.sin(theta), hy = cy - r*Math.cos(theta)
	    pathText += "M" + hx + "," + hy + callback(theta,thetaMax)
	}

	return pathText
    }

    addFeature (hair, 'baldHead', {}, function () {
        // Intentionally left blank (bald)
    });

    // want red cheeks to be rare
    // a quick/hacky way of upweighting blank cheeks is to add it multiple times with different tags
    for (var i = 1; i <= 10; ++i) {
	addFeature (cheeks, 'noCheekColor' + i, {}, function () {
            // Intentionally left blank (no cheek color)
	});
    }

    addFeature (cheeks, 'redCheeks', {sad:-1}, function (paper, lr, cx, cy, fatness) {
	makeCheeks (paper, lr, cx, cy, fatness, 20, '#f00', .2, 'redCheek')
    });

    addFeature (cheeks, 'bigRedCheeks', {sad:-1}, function (paper, lr, cx, cy, fatness) {
	makeCheeks (paper, lr, cx, cy, fatness, 30, '#f00', .2, 'bigRedCheek')
    });

    function makeCheeks (paper, lr, cx, cy, fatness, r, color, opacity, tag) {
	var defs = newDefs(paper);
	tag = tag + "Gradient" + lr.toUpperCase()
	defs.innerHTML = '<radialGradient id="'+tag+'" fx="50%" fy="50%" cx="50%" cy="50%" r="75%"><stop offset="0%" stop-color="'+color+'" stop-opacity="'+opacity+'"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0"/></radialGradient>';
        var e = newPath(paper);
        e.setAttribute("d", "M " + (lr==="l" ? (cx-r/2) : (cx+r/2)) + "," + (cy+r) +
                       "a "+r+","+r+" 0 1 1 0.1,0");
        e.setAttribute("fill", "url(#"+tag+")");
        scaleCentered(e, fatScale(fatness), 1);
    }
  
    function randomArrayIndex(array) {
        return Math.floor(Math.random() * array.length);
    }

    function randomObjectKey(obj,oldKey) {
        var keys = Object.keys (obj)
	var key
	do {
            key = keys[randomArrayIndex(keys)]
	} while (oldKey && featureInfo[oldKey] && featureInfo[oldKey].type
		 && featureInfo[key].type != featureInfo[oldKey].type)
	return key
    }

    /**
     * Display a face.
     *
     * @param {string|Object} container Either the DOM element of the div that the face will appear in, or a string containing its id.
     * @param {Object} face Face object, such as one generated from faces.generate.
     */
    function display(container, face, showAffects) {
        var paper;

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        container.innerHTML = "";
        
        paper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        paper.setAttribute("version", "1.2");
        paper.setAttribute("baseProfile", "tiny");
        paper.setAttribute("width", "100%");
        paper.setAttribute("height", "100%");
        paper.setAttribute("viewBox", "0 0 400 550");
        paper.setAttribute("preserveAspectRatio", "xMidYMid meet");

        if (showAffects) {
            var div = document.createElement('div');
            var span = document.createElement('span');
            div.setAttribute('style','position:relative;text-align:center;')
            span.setAttribute('style','position:absolute;left:0;bottom:0;width:100%;margin-bottom:1px;-moz-user-select:none;-webkit-user-select:none;')
            span.innerText = affects(face).join(', ');

            div.appendChild(paper);
            div.appendChild(span);
            container.appendChild(div);

        } else
            container.appendChild(paper);

        head[face.head.id](paper, face.fatness, face.color);

        cheeks[face.cheeks[0].id](paper, face.cheeks[0].lr, face.cheeks[0].cx, face.cheeks[0].cy, face.fatness);
        cheeks[face.cheeks[1].id](paper, face.cheeks[1].lr, face.cheeks[1].cx, face.cheeks[1].cy, face.fatness);

        eyebrow[face.eyebrows[0].id](paper, face.eyebrows[0].lr, face.eyebrows[0].cx, face.eyebrows[0].cy);
        eyebrow[face.eyebrows[1].id](paper, face.eyebrows[1].lr, face.eyebrows[1].cx, face.eyebrows[1].cy);

        eye[face.eyes[0].id](paper, face.eyes[0].lr, face.eyes[0].cx, face.eyes[0].cy, face.eyes[0].angle);
        eye[face.eyes[1].id](paper, face.eyes[1].lr, face.eyes[1].cx, face.eyes[1].cy, face.eyes[1].angle);

        nose[face.nose.id](paper, face.nose.cx, face.nose.cy, face.nose.size, face.nose.posY, face.nose.flip);
        mouth[face.mouth.id](paper, face.mouth.cx, face.mouth.cy);
        hair[face.hair.id](paper, face.fatness, face.hair.color, face.hair.density, face.hair.angle);
    }

    /**
     * Generate a random face.
     *
     * @param {string|Object=} container Either the DOM element of the div that the face will appear in, or a string containing its id. If not given, no face is drawn and the face object is simply returned.
     * @return {Object} Randomly generated face object.
     */
    function randomizeEyebrows (face) {
        var id = randomObjectKey(eyebrow,face.eyebrows[0].id);
        face.eyebrows[0] = {id: id, lr: "l", cx: 135, cy: 250};
        face.eyebrows[1] = {id: id, lr: "r", cx: 265, cy: 250};
    }

    function randomizeEyes (face) {
	var angle = Math.random() * 50 - 20;
	var id = randomObjectKey(eye,face.eyes[0].id);
        face.eyes[0] = {id: id, lr: "l", cx: 135, cy: 280, angle: angle};
        face.eyes[1] = {id: id, lr: "r", cx: 265, cy: 280, angle: angle};
    }

    function randomizeMouth (face) {
        face.mouth = {id: randomObjectKey(mouth,face.mouth.id), cx: 200, cy: 400};
    }

    function randomizeCheeks (face) {
	var id = randomObjectKey(cheeks,face.cheeks.id)
        face.cheeks[0] = {id: id, lr: "l", cx: 125, cy: 360};
        face.cheeks[1] = {id: id, lr: "r", cx: 275, cy: 360};
    }

    function deepCopy (obj) {
	var copy
	if (Object.prototype.toString.call(obj) === '[object Array]')
	    copy = obj.slice(0)
	else if (typeof(obj) === 'object') {
	    var copy = {}
	    Object.keys(obj).forEach (function (key) {
		copy[key] = deepCopy (obj[key])
	    })
	} else
	    copy = obj
	return copy
    }

    function generate(container, showAffects) {
        var angle, colors, face, flip, id;

        face = {head: {}, eyebrows: [{}, {}], eyes: [{}, {}], nose: {}, mouth: {}, cheeks: [{}, {}], hair: {}};
        face.fatness = Math.random();
        colors = ["#FFDFC4","#F0D5BE","#EECEB3","#E1B899","#E5C298","#FFDCB2","#E5B887","#E5A073","#E79E6D","#DB9065","#CE967C","#C67856","#BA6C49","#A57257","#F0C8C9","#DDA8A0","#B97C6D","#A8756C","#AD6452","#5C3836","#CB8442","#BD723C","#704139","#A3866A"];  // Pantone skin tones, give or take a few
        face.color = colors[randomArrayIndex(colors)];

        face.head = {id: randomObjectKey(head)};

	randomizeEyebrows (face);
	randomizeEyes (face);
	randomizeMouth (face);
	randomizeCheeks (face);

        angle = Math.random() * 50 - 20;
        id = randomObjectKey(eye);
        face.eyes[0] = {id: id, lr: "l", cx: 135, cy: 280, angle: angle};
        face.eyes[1] = {id: id, lr: "r", cx: 265, cy: 280, angle: angle};

        flip = Math.random() > 0.5 ? true : false;
        face.nose = {id: randomObjectKey(nose), lr: "l", cx: 200, cy: 330, size: Math.random(), posY: undefined, flip: flip};

	colors = ["#090806","#2C222B","#71635A","#B7A69E","#D6C4C2","#CABFB1","#DCD0BA","#FFF5E1","#E6CEA8","#E5C8A8","#DEBC99","#B89778","#A56B46","#B55239","#8D4A43","#91553D","#533D32","#3B3024","#554838","#4E433F","#504444","#6A4E42","#A7856A","#977961"]  // hair colors from http://www.collectedwebs.com/art/colors/hair/
	angle = Math.random() * 60 - 20
        face.hair = {id: randomObjectKey(hair), density: Math.random(), angle: angle, color: colors[randomArrayIndex(colors)]};
        
        if (typeof container !== "undefined") {
            display(container, face, showAffects);
        }

	return face;
    }

    // mutate a face to a new (single-emotion) affect
    function mutate (face, mutProb, newAffect) {
	mutProb = mutProb || 1;
	var oldAffects = affects(face)
	while (!newAffect) {
	    var emotion = allEmotions[randomArrayIndex(allEmotions)]
	    if (oldAffects.length == allEmotions.length
		|| !oldAffects.find (function (e) { return emotion == e }))
		newAffect = emotion
	}

	var newAffects
	do {
	    if (Math.random() < mutProb)
		randomizeEyebrows (face);
	    if (Math.random() < mutProb)
		randomizeEyes (face);
	    if (Math.random() < mutProb)
		randomizeMouth (face);
	    if (Math.random() < mutProb)
		randomizeCheeks (face);
	    newAffects = affects(face)
	} while (newAffects.length > 1 || !newAffects.find (function (e) { return newAffect == e }))

	return face
    }

    // generate a face for each emotion
    function generateSet (face, mutProb) {
        var faceSet = {}
        face = face || generate()
        var aff = affects(face)
	allEmotions.forEach (function (emotion) {
            if (aff.length == 1 && aff[0] == emotion)
                faceSet[emotion] = face
            else
	        faceSet[emotion] = mutate (deepCopy(face), mutProb, emotion)
	})
	return faceSet
    }

    return {
        display: display,
        generate: generate,
	mutate: mutate,
	affects: affects,
	generateSet: generateSet
    };
}));
