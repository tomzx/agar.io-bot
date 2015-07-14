var GAME = (function(global) {
	var module = {};

	module.screenToGameX = function(x) {
		return (x - getWidth() / 2) / getRatio() + getX();
	}

	module.screenToGameY = function(y) {
		return (y - getHeight() / 2) / getRatio() + getY();;
	}

	module.drawPoint = function(x, y, drawColor, text, size) {
		global.drawPoint(x, y, drawColor, text, size);
	}

	module.drawArc = function(x_1, y_1, x_2, y_2, x_3, y_3, drawColor) {
		global.drawArc(x_1, y_1, x_2, y_2, x_3, y_3, drawColor);
	}

	module.drawLine = function(x_1, y_1, x_2, y_2, drawColor) {
		global.drawLine(x_1, y_1, x_2, y_2, drawColor);
	}

	module.drawCircle = function(x_1, y_1, radius, drawColor) {
		global.drawCircle(x_1, y_1, radius, drawColor);
	}

	module.screenDistance = function() {
		return global.getScreenDistance();
	}

	module.getDarkBool = function() {
		return global.getDarkBool();
	}

	module.getMassBool = function() {
		return global.getMassBool();
	}

	module.getMemoryCells = function() {
		return global.getMemoryCells();
	}

	module.getCellsArray = function() {
		return global.getCellsArray();
	}

	module.getCells = function() {
		return global.getCells();
	}

	module.getPlayer = function() {
		return global.getPlayer();
	}

	module.getWidth = function() {
		return global.getWidth();
	}

	module.getHeight = function() {
		return global.getHeight();
	}

	module.getRatio = function() {
		return global.getRatio();
	}

	module.getOffsetX = function() {
		return global.getOffsetX();
	}

	module.getOffsetY = function() {
		return global.getOffsetY();
	}

	module.getX = function() {
		return global.getX();
	}

	module.getY = function() {
		return global.getY();
	}

	module.getPointX = function() {
		return global.getPointX();
	}

	module.getPointY = function() {
		return global.getPointY();
	}

	module.getMouseX = function() {
		return global.getMouseX();
	}

	module.getMouseY = function() {
		return global.getMouseY();
	}

	module.getUpdate = function() {
		return global.getLastUpdate();
	}

	module.getMode = function() {
		return global.getMode();
	}

	return module;
})(window);