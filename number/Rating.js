class Rating {
	static display(rating, maxRating = 5, imgOn = '&#9733;', imgOff = '&#9734;', imgHalf = null) {
		if (rating == null) {
			return '';
		}

		const fullStars = Math.floor(rating);
		const decimal = rating - fullStars;

		let totalFull = fullStars;
		let showHalf = false;

		if (imgHalf !== null && decimal >= 0.25 && decimal < 0.75) {
			showHalf = true;
		}
		else if (decimal >= (imgHalf !== null ? 0.75 : 0.5)) {
			totalFull++;
		}

		return imgOn.repeat(totalFull)
			+ (showHalf ? imgHalf : '')
			+ imgOff.repeat(maxRating - totalFull - (showHalf ? 1 : 0));
	}
}

export { Rating };
