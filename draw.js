class HexColor {
	static check(hexColor) {
		const match = hexColor.match(/^[0-9a-fA-F]{6}$/);
		return match ? match.length > 0 : false;
	}

	static convertToRgb(hexColor) {
		if (hexColor.substring(0, 1) === '#') {
			hexColor = hexColor.substring(1);
		}

		if (hexColor.length === 3) {
			hexColor = hexColor[0]+hexColor[0]+hexColor[1]+hexColor[1]+hexColor[2]+hexColor[2];
		}

		if (!HexColor.check(hexColor)) {
			return null;
		}

		let hexRed = hexColor.substring(0,2);
		let hexGreen = hexColor.substring(2,4);
		let hexBlue = hexColor.substring(4,6);

		let red = parseInt(hexRed, 16);
		let green = parseInt(hexGreen, 16);
		let blue = parseInt(hexBlue, 16);

		return [red, green, blue];
	}

	static isLight(hexColor) {
		let rgb = HexColor.convertToRgb(hexColor);
		if (rgb === null) {
			return false;
		}
		return RgbColor.isLight(rgb[0], rgb[1], rgb[2]);
	}
}

class RgbColor {
	static isLight(red, green, blue) {
		const PERCENT_RED 		= 0.2125;
		const PERCENT_GREEN 	= 0.7154;
		const PERCENT_BLUE 		= 0.0721;
		// $percentageRed 		= 0.3;
		// $percentageGreen 	= 0.59;
		// $percentageBlue 	= 0.11;

		let coeff = (PERCENT_RED*red) + (PERCENT_GREEN*green) + (PERCENT_BLUE*blue);
		return coeff > 128;
	}
}

export { HexColor, RgbColor };