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

    function addFeature (feature, id, affect, func) {
        featureInfo[feature] = featureInfo[feature] || {}
        featureInfo[feature][id] = { func: func, affect: {} }
        Object.keys(affect).forEach (function (emotion) {
            featureInfo[feature][id][emotion] = affect[emotion];
        });
    }

    var allEmotions = ['happy', 'angry', 'sad', 'surprised']
    var emotiveFeatures = ['eyebrows', 'eyes', 'cheeks', 'mouth']
    var unemotiveFeatures = ['global', 'head', 'nose', 'hair']
    function affects (face) {
        var emotionScore = {}
	allEmotions.forEach (function (emotion) { emotionScore[emotion] = 0 })

        emotiveFeatures.forEach (function (key) {
            var obj = isArray(face[key]) ? face[key][0] : face[key]
            var id = obj.id
            allEmotions.forEach (function (emotion) {
                var score = featureInfo[key][id][emotion]
                if (score) {
//                    console.log(id+" "+emotion+" "+score)
                    emotionScore[emotion] += score
                }
            })
        })

        var eyeAngle = face.eyes[0].angle
        if (eyeAngle > 15) {
            emotionScore.angry += .5
        } else if (eyeAngle > 5) {
            emotionScore.angry += .2
            emotionScore.sad += .2
        } else if (eyeAngle < -15) {
            emotionScore.angry -= .5
            emotionScore.sad += .2
        } else if (eyeAngle < -5) {
            emotionScore.angry -= .2
            emotionScore.sad += .1
        }

//        console.log(emotionScore)

        var sortedEmotions = allEmotions.sort (function (a, b) {
            return emotionScore[b] - emotionScore[a]
        })
        var topEmotions = allEmotions.filter (function (e) {
            return emotionScore[e] == emotionScore[sortedEmotions[0]]
        })
        var topEmotionLead
        if (topEmotions.length < allEmotions.length)
            topEmotionLead = emotionScore[sortedEmotions[0]] - emotionScore[sortedEmotions[topEmotions.length]]
        
        return { top: topEmotions, lead: topEmotionLead }
    }
    
    addFeature ('head', 'genericHead', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'eggLike', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'pointyChin', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'squareJaw', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'slightDoubleChin', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'saggyCheeksDoubleChin', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'saggyCheeks', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'verySaggyCheeks', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'narrowCheeks', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'pinchedCheeks', {}, function (paper, fatness, color) {
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

    addFeature ('head', 'veryPinchedCheeks', {}, function (paper, fatness, color) {
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

    addFeature ('eyebrows', 'downCurvedBrows', {angry:+.4,sad:+.3}, function (paper, lr, cx, cy) {
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

    addFeature ('eyebrows', 'furrowedBrows', {angry:+.6,sad:+.25}, function (paper, lr, cx, cy) {
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

    addFeature ('eyebrows', 'upCurvedBrows', {}, function (paper, lr, cx, cy) {
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

    addFeature ('eyebrows', 'angryStraightBrows', {angry:+1}, function (paper, lr, cx, cy) {
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

    addFeature ('eyes', 'horizontalEyes', {angry:-.5,surprised:-1}, function (paper, lr, cx, cy, angle) {
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
    addFeature ('eyes', 'normalEyes', {type:'normal'}, function (paper, lr, cx, cy, angle) {
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

    addFeature ('eyes', 'normalEyesWide', {type:'normal',angry:+1,surprised:+1}, function (paper, lr, cx, cy, angle) {
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

    addFeature ('eyes', 'dotEyes', {type:'dot'}, function (paper, lr, cx, cy, angle) {
        // Dot
        var e, x = cx, y = cy + 13;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 20,15 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature ('eyes', 'dotEyesWide', {type:'dot',angry:+1,surprised:+1}, function (paper, lr, cx, cy, angle) {
        // Dot
        var e, x = cx, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 24,18 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    addFeature ('eyes', 'arcEyelid', {type:'arc'}, function (paper, lr, cx, cy, angle) {
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

    addFeature ('eyes', 'arcEyelidWide', {type:'arc',angry:+.7,surprised:+.5}, function (paper, lr, cx, cy, angle) {
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

    addFeature ('eyes', 'normalEyesCrossed', {type:'normal',angry:+.5,surprised:+.4}, function (paper, lr, cx, cy, angle) {
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

    addFeature ('nose', 'vNose', {}, function (paper, cx, cy, size) {
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
    addFeature ('nose', 'pinnochioNose', {}, function (paper, cx, cy, size, posY, flip) {
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
    addFeature ('nose', 'bigSingleNose', {}, function (paper, cx, cy, size) {
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

    addFeature ('mouth', 'thinSmile', {happy:+2.5}, function (paper, cx, cy) {
        // Thin smile
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature ('mouth', 'thinFrownMouth', {angry:+1,sad:+1.5}, function (paper, cx, cy) {
        // Thin downturn
        var e, x = cx - 75, y = cy + 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,-60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature ('mouth', 'thinFlatMouth', {angry:+.25,sad:+.6}, function (paper, cx, cy) {
        // Thin flat
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "h 110");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    addFeature ('mouth', 'openSmile', {happy:+3}, function (paper, cx, cy) {
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
    addFeature ('mouth', 'openSnarl', {angry:+1,sad:+1.1}, function (paper, cx, cy) {
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
    addFeature ('mouth', 'openMouth', {surprised:+1,angry:.25}, function (paper, cx, cy) {
        // Generic open mouth
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 54,10 0 1 1 110,0" +
                       "a 54,20 0 1 1 -110,0");
    });
    addFeature ('mouth', 'surprisedMouth', {surprised:+2}, function (paper, cx, cy) {
        // Surprised "O" mouth
        var e, x = cx - 25, y = cy + 10;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 25,25 0 1 1 50,0" +
                       "a 25,25 0 1 1 -50,0");
    });
    addFeature ('mouth', 'surprisedWithTeeth', {surprised:+1.5,angry:+.3}, function (paper, cx, cy) {
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

    addFeature ('mouth', 'surprisedWithPointyTeeth', {surprised:+1,angry:+.8}, function (paper, cx, cy) {
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

    addFeature ('mouth', 'thinSmileWithEnds', {happy:+3}, function (paper, cx, cy) {
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

    addFeature ('mouth', 'thinFrownMouthWithEnds', {sad:+1.5,angry:+1}, function (paper, cx, cy) {
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

    addFeature ('mouth', 'blockySnarl', {angry:+1}, function (paper, cx, cy) {
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

    addFeature ('hair', 'shortHair', {}, function (paper, fatness, color) {
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
    addFeature ('hair', 'flatTopHair', {}, function (paper, fatness, color) {
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
    addFeature ('hair', 'afro', {}, function (paper, fatness, color) {
        // Afro
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 25,250" +
                       "a 210,150 0 1 1 352,0" +
                       "c 0,0 -180,-150 -352,0");
        scaleCentered(e, fatScale(fatness), 1);
	e.setAttribute ("fill", color);
    });

    addFeature ('hair', 'cornrowHair', {}, function (paper, fatness, color, density) {
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

    addFeature ('hair', 'spikyHair', {}, function (paper, fatness, color, density, angle) {
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

    addFeature ('hair', 'bobbleHair', {}, function (paper, fatness, color, density, angle) {
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
	var xmin = 20, xmax = 380, ymax = 300, ymin = 110

        var rx = (xmax - xmin) / 2, ry = ymax - ymin
	var cx = xmin + rx, cy = ymax
	var thetaMax = Math.PI / 2

	var pathText = ''
	for (var theta = -thetaMax; theta <= thetaMax; theta += .1*thetaMax*(1 - density)) {
	    var hx = cx + rx*Math.sin(theta), hy = cy - ry*Math.cos(theta)
	    pathText += "M" + hx + "," + hy + callback(theta,thetaMax)
	}

	return pathText
    }

    addFeature ('hair', 'baldHead', {}, function () {
        // Intentionally left blank (bald)
    });

    // want red cheeks to be rare, so upweight blank cheeks
    addFeature ('cheeks', 'noCheekColor', {weight:10}, function () {
        // Intentionally left blank (no cheek color)
    });

    addFeature ('cheeks', 'redCheeks', {sad:-1}, function (paper, lr, cx, cy, fatness) {
	makeCheeks (paper, lr, cx, cy, fatness, 20, '#f00', .2, 'redCheek')
    });

    addFeature ('cheeks', 'bigRedCheeks', {sad:-1}, function (paper, lr, cx, cy, fatness) {
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

    // figure out which features have types
    // this is important because when generating a set of faces, we want to make sure the base face has well-typed features
    var featuresWithTypes = Object.keys(featureInfo).filter (function (feature) {
        var info = featureInfo[feature]
        return Object.keys(info).find (function (key) {
            return info[key].type
        })
    })
    
    // random integers
    function randomInt(min,max) {
        return Math.round (min + Math.random() * (max - min))
    }

    // random rationals from [0,1) truncated at a given number of decimal places (for compactness)
    function randomRational(precision) {
        precision = precision || 2  // default is two decimal places
        var pow = Math.pow(10,precision)
        return Math.floor (pow * Math.random()) / pow
    }
    
    // random object keys
    function randomArrayIndex(array) {
        return Math.floor(Math.random() * array.length);
    }

    function randomObjectKey(feature,oldKey) {
        // if oldKey is specified, we will use it to match the type of the old & new keys
        // this allows us to mutate a face without changing e.g. the eye type
        var info = featureInfo[feature]
        var oldType = oldKey && info[oldKey] && info[oldKey].type
        var keys = Object.keys (info)
        var weight = keys.map (function (key) {
            if (oldType && info[key].type && info[key].type != oldType)
                return 0
            return info[key].hasOwnProperty('weight') ? info[key].weight : 1
        })
        var totalWeight = weight.reduce (function(sum,summand){return sum+summand}, 0)
        var w = Math.random() * totalWeight
        for (var i = 0; i < weight.length; ++i)
            if ((w -= weight[i]) <= 0)
                return keys[i]
	return undefined  // should never get here
    }

    // seeded pseudorandom numbers (for reproducible effects, e.g. messed-up hair)
    var seed = 6;
    function seedRandomNumbers (newSeed) {  // 0 <= newSeed < 1
	seed = Math.floor (newSeed * 233280)
    }
    function randomNumber() {
	seed = (seed * 9301 + 49297) % 233280;
	return seed / 233280;
    }

    /**
     * Display a face.
     *
     * @param {string|Object} container Either the DOM element of the div that the face will appear in, or a string containing its id.
     * @param {Object} face Face object, such as one generated from faces.generate.
     */
    function display(container, face) {
        // if called with one argument, treat it as a config object
        var config = {}
        if (!face) {
            config = container
            container = config.container
            face = config.face
        }

        // if config contains 'base' field, then merge it with 'face'
        // this allows for more compact representation of multiple affects
        if (config.base)
            face = Object.assign (deepCopy(config.base), face)

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

        if (config.showAffects) {
            var div = document.createElement('div');
            var span = document.createElement('span');
            div.setAttribute('style','position:relative;text-align:center;')
            span.setAttribute('style','position:absolute;left:0;bottom:0;width:100%;margin-bottom:1px;-moz-user-select:none;-webkit-user-select:none;')
            span.innerText = affects(face).top.join(', ');

            div.appendChild(paper);
            div.appendChild(span);
            container.appendChild(div);

        } else
            container.appendChild(paper);

        var callSequence = [ { feature: 'head', args: ['fatness', 'color'] },
                             { feature: 'cheeks', args: ['lr', 'cx', 'cy', 'fatness'] },
                             { feature: 'eyebrows', args: ['lr', 'cx', 'cy'] },
                             { feature: 'eyes', args: ['lr', 'cx', 'cy', 'angle'] },
                             { feature: 'nose', args: ['cx', 'cy', 'size', 'posY', 'flip'] },
                             { feature: 'mouth', args: ['cx', 'cy'] },
                             { feature: 'hair', args: ['fatness', 'color', 'density', 'angle'] } ]

        function makeCall (feature, obj, defaults, argKeys) {
            defaults = defaults || {}
            var args = [paper].concat (argKeys.map (function (key, n) {
                var val = obj[key]
                if (typeof val === 'undefined') val = face.global[key]
                if (typeof val === 'undefined') val = defaults[key]
                return val
            }))
            featureInfo[feature][obj.id].func.apply (null, args)
        }
        
        callSequence.forEach (function (callInfo) {
            var feature = callInfo.feature
            if (isArray (face[feature]))
                face[feature].forEach (function (obj, n) {
                    makeCall (feature, obj, defaultCoords[feature][n], callInfo.args)
                })
            else
                makeCall (feature, face[feature], defaultCoords[feature], callInfo.args)
        })
    }

    // put default coordinates of features into a global object, to save space
    var defaultCoords = {eyebrows: [{lr: "l", cx: 135, cy: 250},
                                    {lr: "r", cx: 265, cy: 250}],
                         eyes: [{lr: "l", cx: 135, cy: 280},
                                {lr: "r", cx: 265, cy: 280}],
                         nose: {cx: 200, cy: 330},
                         mouth: {cx: 200, cy: 400},
                         cheeks: [{lr: "l", cx: 125, cy: 360},
                                  {lr: "r", cx: 275, cy: 360}]};

    /**
     * Generate a random face.
     *
     * @param {string|Object=} container Either the DOM element of the div that the face will appear in, or a string containing its id. If not given, no face is drawn and the face object is simply returned.
     * @return {Object} Randomly generated face object.
     */
    
    function randomizeEyebrows (face) {
        var id = randomObjectKey('eyebrows',face.eyebrows[0].id);
        face.eyebrows[0] = {id: id};
        face.eyebrows[1] = {id: id};
    }

    function randomizeEyes (face) {
	var angle = randomInt (-20, 30)
	var id = randomObjectKey('eyes',face.eyes[0].id);
        face.eyes[0] = {id: id, angle: angle};
        face.eyes[1] = {id: id, angle: angle};
    }

    function randomizeMouth (face) {
        face.mouth = {id: randomObjectKey('mouth',face.mouth.id)};
    }

    function randomizeCheeks (face) {
	var id = randomObjectKey('cheeks',face.cheeks.id)
        face.cheeks[0] = {id: id};
        face.cheeks[1] = {id: id};
    }

    function isArray (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'
    }
        
    function deepCopy (obj) {
	var copy
	if (isArray(obj))
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

    function generate(config) {
        // if called with a string argument, treat it as the container
        config = config || {}
        if (typeof(config) === 'string')
            config = {container:config}

        var container = config.container
        var showAffects = config.showAffects
        var angle, colors, face, flip, id;

        face = {global: {}, head: {}, eyebrows: [{}, {}], eyes: [{}, {}], nose: {}, mouth: {}, cheeks: [{}, {}], hair: {}};
        face.global.fatness = randomRational(2);
        colors = ["#FFDFC4","#F0D5BE","#EECEB3","#E1B899","#E5C298","#FFDCB2","#E5B887","#E5A073","#E79E6D","#DB9065","#CE967C","#C67856","#BA6C49","#A57257","#F0C8C9","#DDA8A0","#B97C6D","#A8756C","#AD6452","#5C3836","#CB8442","#BD723C","#704139","#A3866A"];  // Pantone skin tones, give or take a few
        face.global.color = colors[randomArrayIndex(colors)];

        face.head = {id: randomObjectKey('head')};

	randomizeEyebrows (face);
	randomizeEyes (face);
	randomizeMouth (face);
	randomizeCheeks (face);

        angle = randomInt (-20, 30)
        id = randomObjectKey('eyes');
        face.eyes[0] = {id: id, angle: angle};
        face.eyes[1] = {id: id, angle: angle};

        flip = Math.random() > 0.5 ? true : false;
        face.nose = {id: randomObjectKey('nose'), size: randomRational(2), posY: undefined, flip: flip};

	colors = [ // "#090806",   /* disable black since client application uses a black background; TODO make this configurable */
                  "#2C222B","#71635A","#B7A69E","#D6C4C2","#CABFB1","#DCD0BA","#FFF5E1","#E6CEA8","#E5C8A8","#DEBC99","#B89778","#A56B46","#B55239","#8D4A43","#91553D","#533D32","#3B3024","#554838","#4E433F","#504444","#6A4E42","#A7856A","#977961"]  // hair colors from http://www.collectedwebs.com/art/colors/hair/
	angle = randomInt (-20, 40)
        face.hair = {id: randomObjectKey('hair'), density: randomRational(2),
                     angle: angle, color: colors[randomArrayIndex(colors)]};
        
        if (typeof container !== "undefined") {
            display({ container: container,
                      face: face,
                      showAffects: config.showAffects });
        }

	return face;
    }

    // mutate a face to a new (single-emotion) affect
    function mutate (face, mutProb, newAffect, minLead) {
	mutProb = mutProb || 1
        minLead = minLead || .5
	var oldAffects = affects(face)
	while (!newAffect) {
	    var emotion = allEmotions[randomArrayIndex(allEmotions)]
	    if (oldAffects.top.length == allEmotions.length
		|| !oldAffects.top.find (function (e) { return emotion == e }))
		newAffect = emotion
	}

	var newAffects, oldFace = face
	do {
            face = deepCopy (oldFace)
	    if (Math.random() < mutProb)
		randomizeEyebrows (face);
	    if (Math.random() < mutProb)
		randomizeEyes (face);
	    if (Math.random() < mutProb)
		randomizeMouth (face);
	    if (Math.random() < mutProb)
		randomizeCheeks (face);
	    newAffects = affects(face)
	} while (newAffects.top.length != 1 || newAffects.top[0] != newAffect || newAffects.lead < minLead)

	return face
    }

    function extract (obj, keys) {
        var x = {}
        keys.forEach (function (k) { x[k] = obj[k] })
        return x
    }
        
    function getEmotiveFeatures (face) { return extract (face, emotiveFeatures) }
    function getUnemotiveFeatures (face) { return extract (face, unemotiveFeatures) }

    function getFeatureType (face, feature) {
        var f = face[feature]
        if (isArray(f)) f = f[0]
        return featureInfo[feature][f.id].type
    }
    
    // generate a face for each emotion
    function generateSet (face, mutProb) {
        var faceSet = {}
        if (!face) {
            do {
                face = generate()
            } while (affects(face).top.length > 1
                     || featuresWithTypes.find (function (feature) {
                         return !getFeatureType (face, feature)
                     }))
        }
        faceSet.base = getUnemotiveFeatures (face)
        var aff = affects(face)
	allEmotions.forEach (function (emotion) {
            if (aff.top.length == 1 && aff.top[0] == emotion)
                faceSet[emotion] = face
            else
	        faceSet[emotion] = getEmotiveFeatures (mutate(face, mutProb, emotion))
	})
	return faceSet
    }

    return {
        display: display,
        generate: generate,
	mutate: mutate,
	affects: affects,
        getFeatureType: getFeatureType,
        randomObjectKey: randomObjectKey,
	generateSet: generateSet
    };
}));
