var BOT = (function(global, jQuery, core, game) {
	var VERSION = '0.3.0';

	var module = {};

	var key = {
		space: 32,
		q: 81,
		w: 87,
	};

	console.log('Running tomzx Bot v' + VERSION + '!');

	var splitDistance = 710;

	if (global.botList == null) {
		global.botList = [];
		jQuery('#locationUnknown').append(jQuery('<select id="bList" class="form-control" onchange="setBotIndex($(this).val());" />'));
		jQuery('#locationUnknown').addClass('form-group');
	}

	global.botList.push(["TomzxBot " + VERSION, findDestination]);

	var bList = jQuery('#bList');
	jQuery('<option />', {value: (global.botList.length - 1), text: "TomzxBot"}).appendTo(bList);

	function findDestination(config) {
		var followMouse = config.followMouse || false;
		var allowSplitting = config.allowSplitting || false;
		var player = game.getPlayer();
		var interNodes = game.getMemoryCells();

		if ( /*!toggle*/ 0) {
			return;
		}

		var useMouseX = (game.getMouseX() - game.getWidth() / 2 + game.getX() * game.getRatio()) / game.getRatio();
		var useMouseY = (getMouseY() - getHeight() / 2 + getY() * game.getRatio()) / game.getRatio();
		tempPoint = [useMouseX, useMouseY, 1];

		var tempMoveX = game.getPointX();
		var tempMoveY = game.getPointY();

		if (player.length <= 0) {
			return [tempMoveX, tempMoveY];
		}

		var destinationChoices = []; //destination, size, danger

		for (var k = 0; k < player.length; k++) {
			var playerBlob = player[k];
			//console.log("Working on blob: " + k);

			// Set properties
			playerBlob.canSplit = core.canSplit(playerBlob);
			playerBlob.splitRatio = core.splitRatio(playerBlob);
			if (allowSplitting && playerBlob.canSplit) {
				core.splitCell();
			}

			game.drawCircle(playerBlob.x, playerBlob.y, playerBlob.size + splitDistance, 5);
			//drawPoint(player[0].x, player[0].y - player[0].size, 3, "" + Math.floor(player[0].x) + ", " + Math.floor(player[0].y));

			//var allDots = processEverything(interNodes);

			var allPossibleFood = null;
			allPossibleFood = core.getAllFood(playerBlob); // #1

			var allPossibleThreats = core.getAllThreats(playerBlob);
			//console.log("Internodes: " + interNodes.length + " Food: " + allPossibleFood.length + " Threats: " + allPossibleThreats.length);
			var allPossibleViruses = core.getAllViruses(playerBlob);

			var badAngles = [];
			var obstacleList = [];

			var isSafeSpot = true;
			var isMouseSafe = true;

			var clusterAllFood = core.clusterFood(allPossibleFood, playerBlob.size);

			//console.log("Looking for enemies!");

			for (var i = 0; i < allPossibleThreats.length; i++) {
				var currentThreat = allPossibleThreats[i];
				var enemyDistance = core.computeDistance(currentThreat.x, currentThreat.y, playerBlob.x, playerBlob.y);
				var splitDangerDistance = currentThreat.size + splitDistance + 150;
				var normalDangerDistance = currentThreat.size + 150;
				var shiftDistance = playerBlob.size;

				//console.log("Found distance.");

				var enemymightSplit = core.mightSplit(playerBlob, currentThreat);

				for (var j = clusterAllFood.length - 1; j >= 0 ; j--) {
					var secureDistance = (enemymightSplit ? splitDangerDistance : normalDangerDistance);
					if (core.computeDistance(currentThreat.x, currentThreat.y, clusterAllFood[j].x, clusterAllFood[j].y) < secureDistance) {
						clusterAllFood.splice(j, 1);
					}
				}

				//console.log("Removed some food.");

				if (enemymightSplit) {
					game.drawCircle(currentThreat.x, currentThreat.y, splitDangerDistance, 0);
					game.drawCircle(currentThreat.x, currentThreat.y, splitDangerDistance + shiftDistance, 6);
				} else {
					game.drawCircle(currentThreat.x, currentThreat.y, normalDangerDistance, 3);
					game.drawCircle(currentThreat.x, currentThreat.y, normalDangerDistance + shiftDistance, 6);
				}

				if (currentThreat.danger && global.getLastUpdate() - currentThreat.dangerTimeOut > 1000) {
					currentThreat.danger = false;
				}

				/*if ((enemymightSplit && enemyDistance < splitDangerDistance) ||
					(!enemymightSplit && enemyDistance < normalDangerDistance)) {

					currentThreat.danger = true;
					currentThreat.dangerTimeOut = global.getLastUpdate();
				}*/

				//console.log("Figured out who was important.");

				if ((enemymightSplit && enemyDistance < splitDangerDistance) || (enemymightSplit && currentThreat.danger)) {
					badAngles.push(core.getAngleRange(playerBlob, currentThreat, i, splitDangerDistance));
				} else if ((!enemymightSplit && enemyDistance < normalDangerDistance) || (!enemymightSplit && currentThreat.danger)) {
					badAngles.push(core.getAngleRange(playerBlob, currentThreat, i, normalDangerDistance));
				} else if (enemymightSplit && enemyDistance < splitDangerDistance + shiftDistance) {
					var tempOb = core.getAngleRange(playerBlob, currentThreat, i, splitDangerDistance + shiftDistance);
					var angle1 = tempOb[0];
					var angle2 = core.rangeToAngle(tempOb);

					obstacleList.push([[angle1, true], [angle2, false]]);
				} else if (!enemymightSplit && enemyDistance < normalDangerDistance + shiftDistance) {
					var tempOb = core.getAngleRange(playerBlob, currentThreat, i, normalDangerDistance + shiftDistance);
					var angle1 = tempOb[0];
					var angle2 = core.rangeToAngle(tempOb);

					obstacleList.push([[angle1, true], [angle2, false]]);
				}
				//console.log("Done with enemy: " + i);
			}

			//console.log("Done looking for enemies!");

			var goodAngles = [];
			var stupidList = [];

			for (var i = 0; i < allPossibleViruses.length; i++) {
				var currentVirus = allPossibleViruses[i];
				game.drawCircle(currentVirus.x, currentVirus.y, playerBlob.size + 50, 3);
				game.drawCircle(currentVirus.x, currentVirus.y, playerBlob.size * 2, 6);
			}

			for (var i = 0; i < allPossibleViruses.length; i++) {
				var currentVirus = allPossibleViruses[i];
				var virusDistance = core.computeDistance(currentVirus.x, currentVirus.y, playerBlob.x, playerBlob.y);
				if (virusDistance < (playerBlob.size * 2)) {
					var tempOb = core.getAngleRange(playerBlob, currentVirus, i, playerBlob.size + 50);
					var angle1 = tempOb[0];
					var angle2 = core.rangeToAngle(tempOb);
					obstacleList.push([[angle1, true], [angle2, false]]);
				}
			}

			if (badAngles.length > 0) {
				//NOTE: This is only bandaid wall code. It's not the best way to do it.
				stupidList = core.addWall(stupidList, playerBlob);
			}

			for (var i = 0; i < badAngles.length; i++) {
				var angle1 = badAngles[i][0];
				var angle2 = core.rangeToAngle(badAngles[i]);
				stupidList.push([[angle1, true], [angle2, false]]);
			}

			//stupidList.push([[45, true], [135, false]]);
			//stupidList.push([[10, true], [200, false]]);

			//console.log("Added random noob stufglobal.");

			var sortedInterList = [];
			var sortedObList = [];

			for (var i = 0; i < stupidList.length; i++) {
				//console.log("Adding to sorted: " + stupidList[i][0][0] + ", " + stupidList[i][1][0]);
				sortedInterList = core.addAngle(sortedInterList, stupidList[i])

				if (sortedInterList.length === 0) {
					break;
				}
			}

			for (var i = 0; i < obstacleList.length; i++) {
				sortedObList = core.addAngle(sortedObList, obstacleList[i])

				if (sortedObList.length === 0) {
					break;
				}
			}

			var offsetI = 0;
			var obOffsetI = 1;

			if (sortedInterList.length > 0 && sortedInterList[0][1]) {
				offsetI = 1;
			}
			if (sortedObList.length > 0 && sortedObList[0][1]) {
				obOffsetI = 0;
			}

			var goodAngles = [];
			var obstacleAngles = [];

			for (var i = 0; i < sortedInterList.length; i += 2) {
				var angle1 = sortedInterList[(i + offsetI).mod(sortedInterList.length)][0];
				var angle2 = sortedInterList[(i + 1 + offsetI).mod(sortedInterList.length)][0];
				var diff = (angle2 - angle1).mod(360);
				goodAngles.push([angle1, diff]);
			}

			for (var i = 0; i < sortedObList.length; i += 2) {
				var angle1 = sortedObList[(i + obOffsetI).mod(sortedObList.length)][0];
				var angle2 = sortedObList[(i + 1 + obOffsetI).mod(sortedObList.length)][0];
				var diff = (angle2 - angle1).mod(360);
				obstacleAngles.push([angle1, diff]);
			}

			for (var i = 0; i < goodAngles.length; i++) {
				var line1 = core.followAngle(goodAngles[i][0], playerBlob.x, playerBlob.y, 100 + playerBlob.size);
				var line2 = core.followAngle((goodAngles[i][0] + goodAngles[i][1]).mod(360), playerBlob.x, playerBlob.y, 100 + playerBlob.size);
				game.drawLine(playerBlob.x, playerBlob.y, line1[0], line1[1], 1);
				game.drawLine(playerBlob.x, playerBlob.y, line2[0], line2[1], 1);

				game.drawArc(line1[0], line1[1], line2[0], line2[1], playerBlob.x, playerBlob.y, 1);

				//drawPoint(player[0].x, player[0].y, 2, "");

				game.drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
				game.drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
			}

			for (var i = 0; i < obstacleAngles.length; i++) {
				var line1 = core.followAngle(obstacleAngles[i][0], playerBlob.x, playerBlob.y, 50 + playerBlob.size);
				var line2 = core.followAngle((obstacleAngles[i][0] + obstacleAngles[i][1]).mod(360), playerBlob.x, playerBlob.y, 50 + playerBlob.size);
				game.drawLine(playerBlob.x, playerBlob.y, line1[0], line1[1], 6);
				game.drawLine(playerBlob.x, playerBlob.y, line2[0], line2[1], 6);

				game.drawArc(line1[0], line1[1], line2[0], line2[1], playerBlob.x, playerBlob.y, 6);

				//drawPoint(player[0].x, player[0].y, 2, "");

				game.drawPoint(line1[0], line1[1], 0, "" + i + ": 0");
				game.drawPoint(line2[0], line2[1], 0, "" + i + ": 1");
			}

			if (followMouse && goodAngles.length === 0) {
				playerBlob.state = 'follow mouse';
				//This is the follow the mouse mode
				var distance = core.computeDistance(playerBlob.x, playerBlob.y, tempPoint[0], tempPoint[1]);
				var shiftedAngle = core.shiftAngle(obstacleAngles, getAngle(tempPoint[0], tempPoint[1], playerBlob.x, playerBlob.y), [0, 360]);
				var destination = core.followAngle(shiftedAngle, playerBlob.x, playerBlob.y, distance);

				destinationChoices.push([destination, playerBlob.size, false]);
				game.drawLine(playerBlob.x, playerBlob.y, destination[0], destination[1], 1);
				//tempMoveX = destination[0];
				//tempMoveY = destination[1];
			} else if (goodAngles.length > 0) {
				playerBlob.state = 'run away';
				var bIndex = goodAngles[0];
				var biggest = goodAngles[0][1];
				for (var i = 1; i < goodAngles.length; i++) {
					var size = goodAngles[i][1];
					if (size > biggest) {
						biggest = size;
						bIndex = goodAngles[i];
					}
				}
				var perfectAngle = (bIndex[0] + bIndex[1] / 2).mod(360);

				perfectAngle = core.shiftAngle(obstacleAngles, perfectAngle, bIndex);

				var line1 = core.followAngle(perfectAngle, playerBlob.x, playerBlob.y, global.verticalDistance());

				destinationChoices.push([line1, playerBlob.size, true]);
				game.drawLine(playerBlob.x, playerBlob.y, line1[0], line1[1], 7);
				//tempMoveX = line1[0];
				//tempMoveY = line1[1];
			} else if (badAngles.length > 0 && goodAngles == 0) {
				playerBlob.state = 'run away (omg)';
				//TODO: CODE TO HANDLE WHEN THERE IS NO GOOD ANGLE BUT THERE ARE ENEMIES AROUND!!!!!!!!!!!!!
				destinationChoices.push([[tempMoveX, tempMoveY], playerBlob.size, false]);
			} else if (clusterAllFood.length > 0) {
				playerBlob.state = 'eat food';
				for (var i = 0; i < clusterAllFood.length; i++) {
					//console.log("mefore: " + clusterAllFood[i].size);
					//This is the cost function. Higher is better.

					var clusterAngle = core.getAngle(clusterAllFood[i].x, clusterAllFood[i].y, playerBlob.x, playerBlob.y);

					clusterAllFood[i].size = clusterAllFood[i].size * 6 - core.computeDistance(clusterAllFood[i].x, clusterAllFood[i].y, playerBlob.x, playerBlob.y);
					//console.log("Current Value: " + clusterAllFood[i].size);

					//(goodAngles[bIndex][1] / 2 - (Math.abs(perfectAngle - clusterAngle)));

					clusterAllFood[i].angle = clusterAngle;

					game.drawPoint(clusterAllFood[i].x, clusterAllFood[i].y, 1, "");
					game.drawPoint(clusterAllFood[i].x, clusterAllFood[i].y, 1, Math.round(clusterAllFood[i].size, 2));
					//console.log("After: " + clusterAllFood[i].size);
				}

				var bestFoodI = 0;
				var bestFood = clusterAllFood[0].size;
				for (var i = 1; i < clusterAllFood.length; i++) {
					if (bestFood < clusterAllFood[i].size) {
						bestFood = clusterAllFood[i].size;
						bestFoodI = i;
					}
				}

				//console.log("Best Value: " + clusterAllFood[bestFoodI].size);

				var distance = core.computeDistance(playerBlob.x, playerBlob.y, clusterAllFood[bestFoodI].x, clusterAllFood[bestFoodI].y);
				var shiftedAngle = core.shiftAngle(obstacleAngles, core.getAngle(clusterAllFood[bestFoodI].x, clusterAllFood[bestFoodI].y, playerBlob.x, playerBlob.y), [0, 360]);
				var destination = core.followAngle(shiftedAngle, playerBlob.x, playerBlob.y, distance);

				destinationChoices.push([destination, playerBlob.size, false]);
				//tempMoveX = destination[0];
				//tempMoveY = destination[1];
				game.drawLine(playerBlob.x, playerBlob.y, destination[0], destination[1], 1);
			} else {
				playerBlob.state = 'random';
				//If there are no enemies around and no food to eat.
				destinationChoices.push([[tempMoveX, tempMoveY], playerBlob.size, false]);
			}

			game.drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "");
			//drawPoint(tempPoint[0], tempPoint[1], tempPoint[2], "" + Math.floor(computeDistance(tempPoint[0], tempPoint[1], I, J)));
			//drawLine(tempPoint[0], tempPoint[1], player[0].x, player[0].y, 6);
			//console.log("Slope: " + slope(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Angle: " + getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) + " Side: " + (getAngle(tempPoint[0], tempPoint[1], player[0].x, player[0].y) - 90).mod(360));
			tempPoint[2] = 1;

			//console.log("Done working on blob: " + i);
		}

		//TODO: Find where to go based on destinationChoices.
		var dangerFound = false;
		for (var i = 0; i < destinationChoices.length; i++) {
			if (destinationChoices[i][2]) {
				dangerFound = true;
				break;
			}
		}

		destinationChoices.sort(function(a, b){return b[1] - a[1]});

		if (dangerFound) {
			for (var i = 0; i < destinationChoices.length; i++) {
				if (destinationChoices[i][2]) {
					tempMoveX = destinationChoices[i][0][0];
					tempMoveY = destinationChoices[i][0][1];
					break;
				}
			}
		} else {
			tempMoveX = destinationChoices.peek()[0][0];
			tempMoveY = destinationChoices.peek()[0][1];
			//console.log("Done " + tempMoveX + ", " + tempMoveY);
		}

		//console.log("MOVING RIGHT NOW!");

		//console.log("______Never lied ever in my life.");

		return [tempMoveX, tempMoveY];
	}

	return module;
})(window, jQuery, CORE, GAME);
