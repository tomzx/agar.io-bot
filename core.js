Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
};

Array.prototype.peek = function() {
	return this[this.length - 1];
};

var CORE = (function(global, game) {
	var module = {};

	var keys = {
		space: 32,
		q: 81,
		w: 87,
	};

	var splitSize = 60;

	//Given an angle value that was gotten from valueAndleBased(),
	//returns a new value that scales it appropriately.
	// Note: Unused
	module.paraAngleValue = function(angleValue, range) {
		return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
	};

	// Note: Unused
	module.valueAngleBased = function(angle, range) {
		var leftValue = (angle - range[0]).mod(360);
		var rightValue = (module.rangeToAngle(range) - angle).mod(360);

		var bestValue = Math.min(leftValue, rightValue);

		if (bestValue <= range[1]) {
			return module.paraAngleValue(bestValue, range);
		}
		var banana = -1;
		return banana;
	};

	module.computeDistance = function(x1, y1, x2, y2) {
		var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
		var ydis = y1 - y2;
		var distance = Math.sqrt(xdis * xdis + ydis * ydis);

		return distance;
	};

	// Note: Unused
	module.computeDistanceFromCircleEdge = function(x1, y1, x2, y2, s2) {
		var tempD = module.computeDistance(x2, y2, x1, y1);

		var offsetX = 0;
		var offsetY = 0;

		var ratioX = tempD / (x2 - x1);
		var ratioY = tempD / (y2 - y1);

		offsetX = x2 - (s2 / ratioX);
		offsetY = y2 - (s2 / ratioY);

		return module.computeDistance(x1, y1, offsetX, offsetY);
	};

	module.filterCells = function(predicate, list) {
		var dotList = [];
		var interNodes = game.getMemoryCells();
		Object.keys(list).forEach(function(element, index) {
			if (predicate(element)) {
				dotList.push(interNodes[element]);
			}
		});

		return dotList;
	};

	module.compareSize = function(player1, player2, ratio) {
		if (player1.size * player1.size * ratio < player2.size * player2.size) {
			return true;
		}
		return false;
	};

	module.canSplit = function(player) {
		return player.size > splitSize;
	};

	module.mightSplit = function(player1, player2) {
		return module.compareSize(player1, player2, 2.30) && !module.compareSize(player1, player2, 9);
	};

	module.splitRatio = function(player) {
		return player.size / splitSize;
	};

	module.getPlayerMass = function(player) {
		var sum = 0;
		for (var k = 0; k < player.length; k++) {
			sum += player[k].size;
		}
		return sum;
	}

	module.processEverything = function(listToUse) {
		Object.keys(listToUse).forEach(function(element, index) {
			module.computeAngleRanges(listToUse[element], game.getPlayer()[0]);
		});
	};

	module.getAll = function() {
		var dotList = [];
		var player = game.getPlayer();
		var interNodes = game.getMemoryCells();

		dotList = module.filterCells(function(element) {
			var isMe = false;

			for (var i = 0; i < player.length; i++) {
				if (interNodes[element].id == player[i].id) {
					isMe = true;
					break;
				}
			}

			for (var i = 0; i < player.length; i++) {
				if (!isMe) {
					return true;
				}
				return false;
			}
		}, interNodes);

		return dotList;
	};

	module.getAllViruses = function(blob) {
		var dotList = [];
		var player = game.getPlayer();
		var interNodes = game.getMemoryCells();

		dotList = module.filterCells(function(element) {
			var isMe = false;

			for (var i = 0; i < player.length; i++) {
				if (interNodes[element].id == player[i].id) {
					isMe = true;
					break;
				}
			}

			if (!isMe && interNodes[element].isVirus() && module.compareSize(interNodes[element], blob, 1.30)) {
				return true;
			}
			return false;
		}, interNodes);

		return dotList;
	};

	module.getTeam = function(red, green, blue) {
		if (red > green && red > blue) {
			return 0;
		} else if (green > red && green > blue) {
			return 1;
		}
		return 2;
	};

	module.isItMe = function(player, cell2) {
		if (getMode() == ":teams") {
			var currentColor = player[0].color;

			var currentRed = parseInt(currentColor.substring(1,3), 16);
			var currentGreen = parseInt(currentColor.substring(3,5), 16);
			var currentBlue = parseInt(currentColor.substring(5,7), 16);

			var currentTeam = game.getTeam(currentRed, currentGreen, currentBlue);

			var cellColor = cell2.color;

			var cellRed = parseInt(cellColor.substring(1,3), 16);
			var cellGreen = parseInt(cellColor.substring(3,5), 16);
			var cellBlue = parseInt(cellColor.substring(5,7), 16);

			var cellTeam = game.getTeam(cellRed, cellGreen, cellBlue);

			if (currentTeam == cellTeam) {
				return true;
			}

			//console.log("COLOR: " + color);

		} else {
			for (var i = 0; i < player.length; i++) {
				if (cell2.id == player[i].id) {
					return true;
				}
			}
		}
		return false;
	};

	module.getAllThreats = function(blob) {
		var dotList = [];
		var player = game.getPlayer();
		var interNodes = game.getMemoryCells();

		dotList = module.filterCells(function(element) {
			var isMe = module.isItMe(player, interNodes[element]);

			if (!isMe && (!interNodes[element].isVirus() && module.compareSize(blob, interNodes[element], 1.30))) {
				return true;
			}
			return false;
		}, interNodes);

		return dotList;
	};

	module.getAllFood = function(blob) {
		var elementList = [];
		var dotList = [];
		var player = game.getPlayer();
		var interNodes = game.getMemoryCells();

		return module.filterCells(function(element) {
			var isMe = module.isItMe(player, interNodes[element]);

			if (isMe) {
				return false;
			}

			if (interNodes[element].isFood()) {
				return true;
			}

			if (interNodes[element].isVirus()) {
				return false;
			}

			if (interNodes[element].isPlayer()) {
				// Ignore players for now
				return false;
			}

			if (module.compareSize(interNodes[element], blob, 1.30)) {
				return true;
			}

			return false;
		}, interNodes);
	};

	module.clusterFood = function(foodList, blobSize) {
		var clusters = [];
		var addedCluster = false;

		//1: x
		//2: y
		//3: size or value
		//4: Angle, not set here.

		for (var i = 0; i < foodList.length; i++) {
			addedCluster = false;
			for (var j = 0; j < clusters.length; j++) {
				if (module.computeDistance(foodList[i].x, foodList[i].y, clusters[j].x, clusters[j].y) < blobSize * 1.5) {
					clusters[j] = clusters[j] || {};
					clusters[j].x = (foodList[i].x + clusters[j].x) / 2;
					clusters[j].y = (foodList[i].y + clusters[j].y) / 2;
					clusters[j].size += foodList[i].size;
					addedCluster = true;
					break;
				}
			}
			if (!addedCluster) {
				clusters.push({
					x: foodList[i].x,
					y: foodList[i].y,
					size: foodList[i].size,
					value: 0
				});
			}
		}
		return clusters;
	};

	module.getAngle = function(x1, y1, x2, y2) {
		//Handle vertical and horizontal lines.

		if (x1 == x2) {
			if (y1 < y2) {
				return 271;
				//return 89;
			} else {
				return 89;
			}
		}

		return (Math.round(Math.atan2(-(y1 - y2), -(x1 - x2)) / Math.PI * 180 + 180));
	};

	module.slope = function(x1, y1, x2, y2) {
		var m = (y1 - y2) / (x1 - x2);

		return m;
	};

	module.slopeFromAngle = function(degree) {
		if (degree === 270) {
			degree = 271;
		} else if (degree === 90) {
			degree = 91;
		}
		return Math.tan((degree - 180) / 180 * Math.PI);
	};

	//Given two points on a line, finds the slope of a perpendicular line crossing it.
	module.inverseSlope = function(x1, y1, x2, y2) {
		var m = module.slope(x1, y1, x2, y2);
		return (-1) / m;
	};

	//Given a slope and an offset, returns two points on that line.
	module.pointsOnLine = function(slope, useX, useY, distance) {
		var b = useY - slope * useX;
		var r = Math.sqrt(1 + slope * slope);

		var newX1 = (useX + (distance / r));
		var newY1 = (useY + ((distance * slope) / r));
		var newX2 = (useX + ((-distance) / r));
		var newY2 = (useY + (((-distance) * slope) / r));

		return [
			[newX1, newY1],
			[newX2, newY2]
		];
	};

	module.followAngle = function(angle, useX, useY, distance) {
		var slope = module.slopeFromAngle(angle);
		var coords = module.pointsOnLine(slope, useX, useY, distance);

		var side = (angle - 90).mod(360);
		if (side < 180) {
			return coords[1];
		} else {
			return coords[0];
		}
	};

	//Using a line formed from point a to b, tells if point c is on S side of that line.
	module.isSideLine = function(a, b, c) {
		if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
			return true;
		}
		return false;
	};

	//angle range2 is within angle range2
	//an Angle is a point and a distance between an other point [5, 40]
	module.angleRangeIsWithin = function(range1, range2) {
		if (range2[0] == (range2[0] + range2[1]).mod(360)) {
			return true;
		}
		//console.log("r1: " + range1[0] + ", " + range1[1] + " ... r2: " + range2[0] + ", " + range2[1]);

		var distanceFrom0 = (range1[0] - range2[0]).mod(360);
		var distanceFrom1 = (range1[1] - range2[0]).mod(360);

		if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 < distanceFrom1) {
			return true;
		}
		return false;
	};

	module.angleRangeIsWithinInverted = function(range1, range2) {
		var distanceFrom0 = (range1[0] - range2[0]).mod(360);
		var distanceFrom1 = (range1[1] - range2[0]).mod(360);

		if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 > distanceFrom1) {
			return true;
		}
		return false;
	};

	module.angleIsWithin = function(angle, range) {
		var diff = (module.rangeToAngle(range) - angle).mod(360);
		if (diff >= 0 && diff <= range[1]) {
			return true;
		}
		return false;
	};

	module.rangeToAngle = function(range) {
		return (range[0] + range[1]).mod(360);
	};

	module.anglePair = function(range) {
		return (range[0] + ", " + module.rangeToAngle(range) + " range: " + range[1]);
	};

	module.computeAngleRanges = function(blob1, blob2) {
		var mainAngle = module.getAngle(blob1.x, blob1.y, blob2.x, blob2.y);
		var leftAngle = (mainAngle - 90).mod(360);
		var rightAngle = (mainAngle + 90).mod(360);

		var blob1Left = module.followAngle(leftAngle, blob1.x, blob1.y, blob1.size);
		var blob1Right = module.followAngle(rightAngle, blob1.x, blob1.y, blob1.size);

		var blob2Left = module.followAngle(rightAngle, blob2.x, blob2.y, blob2.size);
		var blob2Right = module.followAngle(leftAngle, blob2.x, blob2.y, blob2.size);

		var blob1AngleLeft = module.getAngle(blob2.x, blob2.y, blob1Left[0], blob1Left[1]);
		var blob1AngleRight = module.getAngle(blob2.x, blob2.y, blob1Right[0], blob1Right[1]);

		var blob2AngleLeft = module.getAngle(blob1.x, blob1.y, blob2Left[0], blob2Left[1]);
		var blob2AngleRight = module.getAngle(blob1.x, blob1.y, blob2Right[0], blob2Right[1]);

		var blob1Range = (blob1AngleRight - blob1AngleLeft).mod(360);
		var blob2Range = (blob2AngleRight - blob2AngleLeft).mod(360);

		var tempLine = module.followAngle(blob2AngleLeft, blob2Left[0], blob2Left[1], 400);
		//drawLine(blob2Left[0], blob2Left[1], tempLine[0], tempLine[1], 0);

		if ((blob1Range / blob2Range) > 1) {
			game.drawPoint(blob1Left[0], blob1Left[1], 3, "");
			game.drawPoint(blob1Right[0], blob1Right[1], 3, "");
			game.drawPoint(blob1.x, blob1.y, 3, "" + blob1Range + ", " + blob2Range + " R: " + (Math.round((blob1Range / blob2Range) * 1000) / 1000));
		}

		//drawPoint(blob2.x, blob2.y, 3, "" + blob1Range);
	};

	module.debugAngle = function(angle, text) {
		var player = game.getPlayer();
		var line1 = game.followAngle(angle, player[0].x, player[0].y, 300);
		game.drawLine(player[0].x, player[0].y, line1[0], line1[1], 5);
		game.drawPoint(line1[0], line1[1], 5, "" + text);
	};

	//TODO: Don't let this function do the radius math.
	module.getEdgeLinesFromPoint = function(blob1, blob2, radius) {
		var px = blob1.x;
		var py = blob1.y;

		var cx = blob2.x;
		var cy = blob2.y;

		//var radius = blob2.size;

		/*if (blob2.isVirus()) {
			radius = blob1.size;
		} else if(mightSplit(blob1, blob2)) {
			radius += splitDistance;
		} else {
			radius += blob1.size * 2;
		}*/

		var shouldInvert = false;

		if (module.computeDistance(px, py, cx, cy) <= radius) {
			radius = module.computeDistance(px, py, cx, cy) - 5;
			shouldInvert = true;
		}

		var dx = cx - px;
		var dy = cy - py;
		var dd = Math.sqrt(dx * dx + dy * dy);
		var a = Math.asin(radius / dd);
		var b = Math.atan2(dy, dx);

		var t = b - a
		var ta = {
			x: radius * Math.sin(t),
			y: radius * -Math.cos(t)
		}

		t = b + a
		var tb = {
			x: radius * -Math.sin(t),
			y: radius * Math.cos(t)
		}

		var angleLeft = module.getAngle(cx + ta.x, cy + ta.y, px, py);
		var angleRight = module.getAngle(cx + tb.x, cy + tb.y, px, py);
		var angleDistance = (angleRight - angleLeft).mod(360);

		if (shouldInvert) {
			var temp = angleLeft;
			angleLeft = (angleRight + 180).mod(360);
			angleRight = (temp + 180).mod(360);
			angleDistance = (angleRight - angleLeft).mod(360);
		}

		return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
			[cx + ta.x, cy + ta.y]
		];
	};

	module.invertAngle = function(range) {
		var angle1 = module.rangeToAngle(badAngles[i]);
		var angle2 = (badAngles[i][0] - angle1).mod(360);
		return [angle1, angle2];
	};

	module.addWall = function(listToUse, blob) {
		if (blob.x < global.getMapStartX() + 1000) {
			//LEFT
			//console.log("Left");

			listToUse.push([[135, true], [225, false]]);

			var lineLeft = module.followAngle(135, blob.x, blob.y, 190 + blob.size);
			var lineRight = module.followAngle(225, blob.x, blob.y, 190 + blob.size);
			game.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
			game.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
		}
		if (blob.y < global.getMapStartY() + 1000) {
			//TOP
			//console.log("TOP");

			listToUse.push([[225, true], [315, false]]);

			var lineLeft = module.followAngle(225, blob.x, blob.y, 190 + blob.size);
			var lineRight = module.followAngle(315, blob.x, blob.y, 190 + blob.size);
			drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
			drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
			drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
		}
		if (blob.x > global.getMapEndX() - 1000) {
			//RIGHT
			//console.log("RIGHT");

			listToUse.push([[315, true], [45, false]]);

			var lineLeft = module.followAngle(315, blob.x, blob.y, 190 + blob.size);
			var lineRight = module.followAngle(45, blob.x, blob.y, 190 + blob.size);
			game.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
			game.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
		}
		if (blob.y > global.getMapEndY() - 1000) {
			//BOTTOM
			//console.log("BOTTOM");

			listToUse.push([[45, true], [135, false]]);

			var lineLeft = module.followAngle(45, blob.x, blob.y, 190 + blob.size);
			var lineRight = module.followAngle(135, blob.x, blob.y, 190 + blob.size);
			game.drawLine(blob.x, blob.y, lineLeft[0], lineLeft[1], 5);
			game.drawLine(blob.x, blob.y, lineRight[0], lineRight[1], 5);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob.x, blob.y, 5);
		}

		return listToUse;
	};

	//listToUse contains angles in the form of [angle, boolean].
	//boolean is true when the range is starting. False when it's ending.
	//range = [[angle1, true], [angle2, false]]

	module.getAngleIndex = function(listToUse, angle) {
		if (listToUse.length === 0) {
			return 0;
		}

		for (var i = 0; i < listToUse.length; i++) {
			if (angle <= listToUse[i][0]) {
				return i;
			}
		}

		return listToUse.length;
	};

	module.addAngle = function(listToUse, range) {
		//#1 Find first open element
		//#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
		//#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

		//TODO: Only add the new range at the end after the right stuff has been removed.

		var startIndex = 1;

		if (listToUse.length > 0 && !listToUse[0][1]) {
			startIndex = 0;
		}

		var startMark = module.getAngleIndex(listToUse, range[0][0]);
		var startBool = startMark.mod(2) != startIndex;

		var endMark = module.getAngleIndex(listToUse, range[1][0]);
		var endBool = endMark.mod(2) != startIndex;

		var removeList = [];

		if (startMark != endMark) {
			//Note: If there is still an error, this would be it.
			var biggerList = 0;
			if (endMark == listToUse.length) {
				biggerList = 1;
			}

			for (var i = startMark; i < startMark + (endMark - startMark).mod(listToUse.length + biggerList); i++) {
				removeList.push((i).mod(listToUse.length));
			}
		} else if (startMark < listToUse.length && endMark < listToUse.length) {
			var startDist = (listToUse[startMark][0] - range[0][0]).mod(360);
			var endDist = (listToUse[endMark][0] - range[1][0]).mod(360);

			if (startDist < endDist) {
				for (var i = 0; i < listToUse.length; i++) {
					removeList.push(i);
				}
			}
		}

		removeList.sort(function(a, b){return b-a});

		for (var i = 0; i < removeList.length; i++) {
			listToUse.splice(removeList[i], 1);
		}

		if (startBool) {
			listToUse.splice(module.getAngleIndex(listToUse, range[0][0]), 0, range[0]);
		}
		if (endBool) {
			listToUse.splice(module.getAngleIndex(listToUse, range[1][0]), 0, range[1]);
		}

		return listToUse;
	};

	module.getAngleRange = function(blob1, blob2, index, radius) {
		var angleStuff = module.getEdgeLinesFromPoint(blob1, blob2, radius);

		var leftAngle = angleStuff[0];
		var rightAngle = module.rangeToAngle(angleStuff);
		var difference = angleStuff[1];

		game.drawPoint(angleStuff[2][0], angleStuff[2][1], 3, "");
		game.drawPoint(angleStuff[3][0], angleStuff[3][1], 3, "");

		//console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);

		var lineLeft = module.followAngle(leftAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);
		var lineRight = module.followAngle(rightAngle, blob1.x, blob1.y, 150 + blob1.size - index * 10);

		if (blob2.isVirus()) {
			game.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 6);
			game.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 6);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 6);
		} else if(getCells().hasOwnProperty(blob2.id)) {
			game.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 0);
			game.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 0);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 0);
		} else {
			game.drawLine(blob1.x, blob1.y, lineLeft[0], lineLeft[1], 3);
			game.drawLine(blob1.x, blob1.y, lineRight[0], lineRight[1], 3);
			game.drawArc(lineLeft[0], lineLeft[1], lineRight[0], lineRight[1], blob1.x, blob1.y, 3);
		}

		return [leftAngle, difference];
	};

	//Given a list of conditions, shift the angle to the closest available spot respecting the range given.
	module.shiftAngle = function(listToUse, angle, range) {
		//TODO: shiftAngle needs to respect the range! DONE?
		for (var i = 0; i < listToUse.length; i++) {
			if (module.angleIsWithin(angle, listToUse[i])) {
				//console.log("Shifting needed!");

				var angle1 = listToUse[i][0];
				var angle2 = module.rangeToAngle(listToUse[i]);

				var dist1 = (angle - angle1).mod(360);
				var dist2 = (angle2 - angle).mod(360);

				if (dist1 < dist2) {
					if (module.angleIsWithin(angle1, range)) {
						return angle1;
					} else {
						return angle2;
					}
				} else {
					if (module.angleIsWithin(angle2, range)) {
						return angle2;
					} else {
						return angle1;
					}
				}
			}
		}
		//console.log("No Shifting Was needed!");
		return angle;
	};

	module.splitCell = function() {
		module.keyDownAndUp(keys.space);
	};

	module.keyDownAndUp = function(key) {
		module.keyDown(key);
		module.keyUp(key);
	};

	module.keyUp = function(key) {
		jQuery(window).trigger(jQuery.Event('keyup', { keyCode: key, which: key}));
	};

	module.keyDown = function(key) {
		jQuery(window).trigger(jQuery.Event('keydown', { keyCode: key, which: key}));
	};

	return module;
})(window, GAME);

console.log(CORE);