import { HTTPClient } from '../network/HTTPClient.js';
import { toEl } from '../utils/util.js';

class Img {
	static compress(oData) {
		let a = [];
		let len = oData.length;
		let p = -1;
		for (let i=0;i<len;i+=4) {
			if (oData[i] > 0)
				a[++p] = String.fromCharCode(oData[i]);
		}
		return a.join("");
	}

	static initImg(div) {
		div = toEl(div);
		if (!div) {
			return;
		}

		div.querySelectorAll('.asynchronously_img').forEach(img => {
			Img.loadImgUrl(img.dataset.url, img);
		});
	}

	static loadImgUrl(url, img) {
		fetch(url, {
			method: 'GET',
			headers: HTTPClient.getHeaders(false),
			cache: 'no-cache',
		})
		.then(response => {
			if (!response.ok) {
				HTTPClient.logRequestFailure(response, null);
				return null;
			}
			return response.blob();
		})
		.then(blob => {
			if (blob) Img.setBlobToImg(img, blob);
		})
		.catch(error => console.error('Error loading image:', error));
	}

	static setBlobToImg(img, blob) {
		// Validation de l'élément img
		img = toEl(img);
		if (!img) {
			console.error('Invalid img element provided to setBlobToImg');
			return;
		}

		// Validation du blob
		if (!blob || !(blob instanceof Blob) || blob.size === 0) {
			console.error('Invalid blob provided to setBlobToImg', blob);
			return;
		}

		try {
			let urlCreator = window.URL || window.webkitURL;
			img.src = urlCreator.createObjectURL(blob);
		} catch (error) {
			console.error('Error creating object URL from blob:', error);
		}
	}

	static async getBase64FromUrl(url) {
		const data = await fetch(url);
		const blob = await data.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				const base64data = reader.result;
				resolve(base64data);
			}
		});
	}
}

export { Img };
