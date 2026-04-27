class Cookie {
	static set(name, value, nbValidityDays=30) {
		let d = new Date();
		d.setTime(d.getTime() + (nbValidityDays * 24 * 60 * 60 * 1000));
		let expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	static get(name) {
		let nameWithSeparator = name + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(nameWithSeparator) === 0) {
				return c.substring(nameWithSeparator.length, c.length);
			}
		}
		return null;
	}

	static erase(name) {
		Cookie.set(name, "", -1);
	}
}

class UrlAndQueryString {
	static displayUrl(url, withLink=true) {
		return (withLink ? '<a href="' + url + '">' : '') + UrlAndQueryString.getHost(url, false) + (withLink ? '</a>' : '');
	}

	static displayUrlAndPath(url, withLink=true, displayPathIfEmpty=false) {
		let formattedUrl = UrlAndQueryString.getHostAndPath(url, false);
		if (!displayPathIfEmpty && UrlAndQueryString.getPath(url) === '/') {
			formattedUrl = formattedUrl.slice(-1) === '/' ? formattedUrl.slice(0, -1) : formattedUrl;
		}
		return (withLink ? '<a href="' + url + '">' : '') + formattedUrl + (withLink ? '</a>' : '');
	}

	static #baseFor(url) {
		return /^https?:\/\//.test(url) ? undefined : window.location.origin;
	}

	static urlify(text) {
		return text.replace(/(https?:\/\/[^\s]+)/g, url => '<a href="' + url + '">' + url + '</a>');
		// or alternatively
		// return text.replace(urlRegex, '<a href="$1">$1</a>')
	}

	static getHost(url, withProtocol=true) {
		if (typeof url == 'undefined') {
			return withProtocol ? window.location.origin : window.location.host;
		}
		url = new URL(url, UrlAndQueryString.#baseFor(url));
		return (withProtocol ? url.protocol + '//' : '') + url.host;
	}

	static getPath(url) {
		if (typeof url == 'undefined') {
			return window.location.pathname;
		}
		url = new URL(url, UrlAndQueryString.#baseFor(url));
		return url.pathname;
	}

	static getQueryString(url) {
		if (typeof url == 'undefined') {
			return window.location.search;
		}
		url = new URL(url, UrlAndQueryString.#baseFor(url));
		return url.search;
	}

	static getHostAndPath(url, withProtocol=true) {
		return UrlAndQueryString.getHost(url, withProtocol) + UrlAndQueryString.getPath(url);

		//let strpos = url.indexOf('?');
		//if (strpos === -1) {
		//	return url;
		//}
		//return url.substr(0, strpos);
	}

	static getParam(key, url) {
		let searchParams = new URLSearchParams(UrlAndQueryString.getQueryString(url));
		return searchParams.get(key);
	}

	static setParam(queryString, name, value) {
		// cette solution ne fonctionne pas avec les tableau
		//let params = new URLSearchParams(queryString);
		//params.set(name, value);
		//return params.toString();

		let params = UrlAndQueryString.parseQuery(queryString);
		//console.log(params);
		params[name] = value;
		return new URLSearchParams(params).toString().replace(/\+/g, '%20');
	}

	static setParamOfUrl(name, value, url) {
		let queryString = UrlAndQueryString.setParam(UrlAndQueryString.getQueryString(url), name, value);
		return UrlAndQueryString.getHostAndPath(url) + '?' + queryString;
	}

	static deleteParam(queryString, name) {
		let params = new URLSearchParams(queryString);
		params.delete(name);
		return params.toString().replace(/\+/g, '%20');

		//let params = UrlAndQueryString.parseQuery(queryString);
		//params[name] = null;
		//return $.param(params);
	}

	static deleteParamOfUrl(name, url) {
		let queryString = UrlAndQueryString.deleteParam(UrlAndQueryString.getQueryString(url), name);
		return UrlAndQueryString.getHostAndPath(url) + '?' + queryString;
	}

	static deleteParamsOfUrl(names, url) {
		let queryString = UrlAndQueryString.getQueryString(url);
		names.forEach((name => queryString = UrlAndQueryString.deleteParam(queryString, name)));
		return UrlAndQueryString.getHostAndPath(url) + '?' + queryString;
	}

	static parseQuery(queryString) {
		var params = {};

		function buildParamFromString(param) {
			var p = decodeURIComponent(param);
			var strpos = p.indexOf('=');
			// Si on trouve pas de signe =, on met la valeur ''
			if (strpos === -1) {
				params[p] = '';
				//params.length++;
				return true;
			}
			var name = p.substr(0, strpos);
			var value = p.substr(strpos + 1, p.length);
			var openBracket = name.indexOf('[');
			var closeBracket = name.indexOf(']');
			// On traite les paramètre qui ne sont pas sous forme de tableau
			if (openBracket === -1 || closeBracket === -1) {
				if (!(openBracket === -1 && closeBracket === -1)) {
					name = name.replace(new RegExp('[\\[\\]]'), '_');
				}
				params[name] = value;
				return true;
			}
			var matches = name.match(new RegExp('\\[.*?\\]', 'g'));
			name = name.substr(0, openBracket);
			p = 'params';
			var key = name;
			for (let i in matches) {
				if (typeof (matches[i]) == 'function') {
					continue;
				}

				p += '[\'' + key + '\']';
				if (eval(p) == undefined || typeof (eval(p)) != 'object') {
					eval(p + '= new Array();');
				}
				key = matches[i].substr(1, matches[i].length - 2);
				// si la clé est null on met la longueur du tableau
				if (key == '') {
					key = eval(p).length;
				}

				/*
				p += '[\''+key+'\']';
				if(eval(p) == undefined || typeof(eval(p)) != 'object') {
					eval(p +'= new Array();');
				}
				if (typeof(matches[i]) != 'function') {
					key = matches[i].substr(1,matches[i].length-2);
					// si la clé est null on met la longueur du tableau
					if (key == '') {
						key = eval(p).length;
					}
				}
				else {
					key = eval(p).length;
				}
				*/
			}
			p += '[\'' + key + '\']';
			eval(p + '= \'' + value + '\';');
		}

		var str = queryString;
		if (str.includes('?')) {
			str = str.substring(1);
		}
		if (str === '') {
			return {};
		}
		str = str.replace(new RegExp('&'), '&');
		//params.length = 0;
		str = str.split('&');
		//var p = '';
		//var startPos = -1;
		//var endPos = -1;
		//var arrayName = '';
		//var arrayKey = '';
		for (let i = 0; i < str.length; i++) {
			buildParamFromString(str[i]);
		}
		// return JSON.parse(JSON.stringify(this.params));
		return params;
	}

	static buildQuery(object) {
		var params = [];

		function buildStringFromParam(object, prefix) {
			var p = '';
			var value = '';
			if (prefix !== undefined) {
				p = prefix;
			}
			if (typeof (object) == 'object') {
				for (var name in object) {
					value = object[name];
					// 06/06/2022 : ajout de ce if pour éviter bug sur fonction HTTPClient.formatQueryString
					if (typeof (value) == 'undefined') {
						continue;
					}
					// 14/01/2020 : les tableaux avec param[0], param[1] en query string fonctionne pas, il faut mettre param[]=x&param[]=y
					//name = p == '' ? name : '['+name+']';
					name = p == '' ? name : '[]';
					if (typeof (value) == 'object') {
						buildStringFromParam(value, p + name);
					}
					// 06/06/2022 : ajout null !== value pour éviter bug sur fonction HTTPClient.formatQueryString
					else if (null !== value && typeof (value) != 'function' && name != '') {
						// 27/01/2020 : correction bug boolean affiché en string true/false
						if (typeof (value) == 'boolean') {
							value = (value ? 1 : 0);
						}
						params[params.length] = p + name + '=' + value;
					}
				}
			}
		}

		buildStringFromParam(object);
		return params.join('&');
	}


	// deprecated

	/** @deprecated **/
	static parseQueryString(string) {
		if (string === "" || string == null) return {};
		if (string.charAt(0) === "?") string = string.slice(1);
		var entries = string.split("&"), counters = {}, data0 = {};
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].split("=");
			var key5 = decodeURIComponent(entry[0]);
			var value2 = entry.length === 2 ? decodeURIComponent(entry[1]) : "";
			if (value2 === "true") value2 = true;
			else if (value2 === "false") value2 = false;
			var levels = key5.split(/\]\[?|\[/);
			var cursor = data0;
			if (key5.indexOf("[") > -1) levels.pop();
			for (var j0 = 0; j0 < levels.length; j0++) {
				var level = levels[j0], nextLevel = levels[j0 + 1];
				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
				if (level === "") {
					var key5 = levels.slice(0, j0).join();
					if (counters[key5] == null) {
						counters[key5] = Array.isArray(cursor) ? cursor.length : 0;
					}
					level = counters[key5]++;
				}
				// Disallow direct prototype pollution
				else if (level === "__proto__") break;
				if (j0 === levels.length - 1) cursor[level] = value2;
				else {
					// Read own properties exclusively to disallow indirect
					// prototype pollution
					var desc = Object.getOwnPropertyDescriptor(cursor, level);
					if (desc != null) desc = desc.value;
					if (desc == null) cursor[level] = desc = isNumber ? [] : {};
					cursor = desc;
				}
			}
		}
		return data0;
	}

	/** @deprecated **/
	static getQuery(url) {
		var str = url;
		var strpos = str.indexOf('?');
		// Si on ne trouve pas de queryString on retourne une chaine vide
		if (strpos === -1) {
			return '';
		}
		str = str.substr(strpos + 1, str.length);
		// Maintenant on verifie si on a une anchor ou pas (#) et si c'est le cas on arrete la querystring avant
		strpos = str.indexOf('#');
		if (strpos === -1) {
			return str;
		}
		return str.substr(0, strpos);
	}

	/**
	 * Match query string parameters to a list of known form field names.
	 * Handles array fields (e.g. "foo[]"): if the field expects an array but the value is scalar, it wraps it.
	 * @param {object} queryStringFilters - key/value pairs from the query string
	 * @param {string[]} listOfPossibleFieldNames - list of accepted field names (e.g. ['foo', 'bar[]'])
	 * @returns {object} filtered and normalized parameters
	 */
	static matchQueryParamsToFormFields(queryStringFilters, listOfPossibleFieldNames) {
		const result = {};
		Object.keys(queryStringFilters).forEach(key => {
			const value = queryStringFilters[key];
			if (listOfPossibleFieldNames.indexOf(key + (Array.isArray(value) ? '[]' : '')) !== -1) {
				result[key] = value;
			} else if (!Array.isArray(value) && listOfPossibleFieldNames.indexOf(key + '[]') !== -1) {
				result[key] = [value];
			}
		});
		return result;
	}

}

export { Cookie, UrlAndQueryString };
