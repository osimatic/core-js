
String.prototype.copyToClipboard = String.prototype.copyToClipboard || function() {
	if (window.clipboardData && clipboardData.setData) {
		window.clipboardData.setData('Text', this);
	}
	else if (document.body.createTextRange) {
		let textRange = document.body.createTextRange();
		textRange.moveToElementText(this);
		textRange.execCommand("Copy");
	}
	else {
		try {
			// On test si la configuration permet l'accès au presse-papier.
			netscape.security.PrivilegeManager
				.enablePrivilege("UniversalXPConnect");
		}
		catch (e) {
			alert("Impossible d'accéder au presse-papier.");
		}
		// Initialisation du composant fournit par Mozilla.
		let gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		// Copie du texte dans le presse papier.
		gClipboardHelper.copyString(this);
	}
	return false;
}

String.prototype.reverseString = String.prototype.reverseString || function() {
	return this.split('').reverse().join('');
}

String.prototype.truncateOnWord = String.prototype.truncateOnWord || function(limit, fromLeft=false, ellipsis='…') {
	if (fromLeft) {
		return this.reverseString().truncateOnWord(limit, false, ellipsis).reverseString();
	}
	let TRIM_CHARS = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
	let words = this.split(RegExp('(?=['+TRIM_CHARS+'])'));
	let count = 0;

	function filter(arr, fn) {
		let result = [];
		for (let i = 0, len = arr.length; i < len; i++) {
			let el = arr[i];
			if (i in arr && fn(el, i)) {
				result.push(el);
			}
		}
		return result;
	}

	const filtered = filter(words, function(word) {
		count += word.length;
		return count <= limit;
	});
	const truncated = filtered.join('');
	return filtered.length < words.length ? truncated.trimEnd() + ellipsis : truncated;
}

String.prototype.truncateString = String.prototype.truncateString || function(length, from, ellipsis='…', split=false) {
	let str1, str2, len1, len2;
	if (this.length <= length) {
		return this.toString();
	}
	switch(from) {
		case 'left':
			str2 = split ? this.truncateOnWord(length, true, '') : this.slice(this.length - length);
			if (split) {
				str2 = str2.trimStart();
				return ellipsis + ' ' + str2;
			}
			return ellipsis + str2;
		case 'middle':
			len1 = Math.ceil(length / 2);
			len2 = Math.floor(length / 2);
			str1 = split ? this.truncateOnWord(len1, false, '') : this.slice(0, len1);
			str2 = split ? this.truncateOnWord(len2, true, '') : this.slice(this.length - len2);
			// Enlever les espaces de fin de str1 et de début de str2 pour éviter les doubles espaces
			return str1.trimEnd() + ' ' + ellipsis + ' ' + str2.trimStart();
		default:
			str1 = split ? this.truncateOnWord(length, false, '') : this.slice(0, length);
			if (split) {
				str1 = str1.trimEnd();
				return str1 + ' ' + ellipsis;
			}
			return str1 + ellipsis;
	}
};

String.prototype.htmlentities = String.prototype.htmlentities || function() {
	return this.replace(/[\u00A0-\u9999<>\&]/gim, (i) => '&#'+i.charCodeAt(0)+';');
};

String.prototype.escapeHtml = String.prototype.escapeHtml || function() {
	let entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	return this.replace(/[&<>"'\/]/g, (s) => entityMap[s]);
};

String.prototype.normalizeBreaks = String.prototype.normalizeBreaks || function(breaktype) {
	// 20/01/2022 : modifié car ne fonctionnait pas pour les string en provenance de textarea, enregistrée en bd puis réaffiché depuis bd
	//return this.replace(/$/mg, breaktype).replace(new RegExp('/'+breaktype.escapeRegExp()+'$/'), '');
	return this.replace(/(?:\r\n|\r|\n)/g, breaktype);
	//return this.replace('/(\r\n|\r|\n)/ms', breaktype);
	//return this.replace('/(?:\r\n|\r|\n)/g', breaktype);
	//console.log(breaktype);
	//return this.replace(new RegExp('\r?\n','g'), breaktype);
};
String.prototype.escapeRegExp = String.prototype.escapeRegExp || function() {
	return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
String.prototype.format = String.prototype.format || function() {
	let args = arguments;
	return this.replace(/{(\d+)}/g, (match, number) => (typeof args[number] != 'undefined' ? args[number] : match));
};

String.prototype.ucwords = String.prototype.ucwords || function() {
	return this.toLowerCase().replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, ($1) => $1.toUpperCase());
};
String.prototype.capitalize = String.prototype.capitalize || function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.acronym = String.prototype.acronym || function() {
	return this.split(' ').map(word => word.charAt(0)).join('');
	//return this.match(/\b(\w)/g).join('');
}

String.prototype.encodeForHtmlDataAttribute = String.prototype.encodeForHtmlDataAttribute || function() {
	return this.replace(/\"/g, "'");
}

String.prototype.isNumeric = String.prototype.isNumeric || function() {
	let ValidChars = "0123456789.";
	let IsNumber = true;
	let Char;
	for (let i = 0; i < this.length && IsNumber === true; i++){
		Char = this.charAt(i);
		if (ValidChars.indexOf(Char) === -1) {
			IsNumber = false;
		}
	}
	return IsNumber;
}

String.prototype.isBase64 = String.prototype.isBase64 || function() {
	// Vérifie les caractères autorisés par le base64
	if (!/^[A-Za-z0-9+/=]+$/.test(this)) return false;

	// Longueur multiple de 4
	if (this.length % 4 !== 0) return false;

	try {
		atob(this); // Tentative de décodage
		return true; // OK → c’est du base64
	} catch (e) {
		return false; // Erreur → pas du base64
	}
}

// s'utilise : "ma chaine {0} de caracteres"
if (!String.format) {
	String.format = function(format) {
		let args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, (match, number) => (typeof args[number] != 'undefined' ? args[number] : match));
	};
}

if (!JSON.encodeJsonForDataAttr) {
	JSON.encodeJsonForDataAttr = function(obj) {
		const json = JSON.stringify(obj);
		return btoa(encodeURIComponent(json));
	}
}

if (!JSON.decodeJsonFromDataAttr) {
	JSON.decodeJsonFromDataAttr = function(str) {
		const json = decodeURIComponent(atob(str));
		return JSON.parse(json);
	}
}

/*
function selectionnerContenuNode(node) {
	if (window.getSelection) {
		var selection = window.getSelection();
		var intervalle = document.createRange();
		intervalle.selectNodeContents(node);
		selection.removeAllRanges();
		selection.addRange(intervalle);
	}
	else if (document.body.createTextRange) {
		var intervalle = document.body.createTextRange();
		intervalle.moveToElementText(node);
		intervalle.select();
	}
	return false;
}
*/