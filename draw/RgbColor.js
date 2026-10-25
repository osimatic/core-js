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

export { RgbColor };
