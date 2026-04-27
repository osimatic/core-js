import { UrlAndQueryString } from './network.js';
import { toEl } from './util.js';

class Pagination {
	static paginateCards(div, nbItemsPerPage) {
		Pagination.paginate(div, div.querySelectorAll('.pagination_item'), nbItemsPerPage, null);
	}

	static paginateTable(table, select=null) {
		Pagination.paginate(table, table.querySelectorAll('tbody tr:not(.hide)'), parseInt(table.dataset.max_rows), select);
	}

	static paginate(div, items, nbItemsPerPage, select=null, labelDisplayAll=null) {
		div = toEl(div);
		if (!div) {
			return;
		}

		let maxItems = nbItemsPerPage;

		select = select != null ? toEl(select) : null;
		if (select) {
			if (!select.children.length) {
				const opt0 = document.createElement('option');
				opt0.value = '0';
				opt0.textContent = labelDisplayAll ?? 'Afficher tout';
				select.appendChild(opt0);

				const nbRowsList = select.dataset.nb_rows_list ? select.dataset.nb_rows_list.split(',') : [5, 10, 25, 50];
				nbRowsList.forEach(nbRows => {
					const opt = document.createElement('option');
					opt.value = nbRows;
					opt.textContent = nbRows;
					select.appendChild(opt);
				});

				if (select.dataset.default_nb_rows) {
					select.value = select.dataset.default_nb_rows;
				}
			}

			maxItems = parseInt(select.value);

			select.addEventListener('change', () => Pagination.paginate(div, items, nbItemsPerPage, select));
		}

		document.querySelectorAll('ul.pagination').forEach(ul => ul.remove());
		Pagination.initPaginationDiv(div, true);  // top
		Pagination.initPaginationDiv(div, false); // bottom

		Pagination.initPaginationItems(items, maxItems);
	}

	static initPaginationDiv(div, onTop) {
		div = toEl(div);
		if (!div) {
			return;
		}

		const ul = document.createElement('ul');
		ul.className = 'pagination';

		const paginationLinks = div.querySelector('.pagination_links');
		if (paginationLinks) {
			if (onTop) {
				paginationLinks.prepend(ul);
			} else {
				paginationLinks.appendChild(ul);
			}
		} else {
			if (onTop) {
				div.before(ul);
			} else {
				div.after(ul);
			}
		}
	}

	static initPaginationItems(items, maxItems) {
		const paginationUls = [...document.querySelectorAll('ul.pagination')];

		const totalItems = items.length;

		let lineNum = 0;
		items.forEach(item => {
			lineNum++;
			if (0 === maxItems || lineNum <= maxItems) {
				item.style.display = '';
			} else {
				item.style.display = 'none';
			}
		});

		paginationUls.forEach(ul => ul.querySelectorAll('li').forEach(li => li.remove()));

		if (0 === maxItems || totalItems < maxItems) {
			paginationUls.forEach(ul => ul.classList.add('hide'));
			return;
		}

		const nbPages = Math.ceil(totalItems / maxItems);
		for (let i = 1; i <= nbPages; i++) {
			paginationUls.forEach(ul => {
				ul.insertAdjacentHTML('beforeend', '<li class="page-item" data-page="' + i + '"><a href="#" class="page-link">' + i + '<span class="sr-only">(current)</span></a></li>');
			});
		}

		paginationUls.forEach(ul => ul.classList.remove('hide'));
		paginationUls.forEach(ul => {
			const firstLi = ul.querySelector('li:first-child');
			if (firstLi) firstLi.classList.add('active');
		});
		paginationUls.forEach(ul => {
			ul.querySelectorAll('li').forEach(li => {
				li.addEventListener('click', function(e) {
					e.preventDefault();
					paginationUls.forEach(ul2 => ul2.querySelectorAll('li').forEach(l => l.classList.remove('active')));

					const pageNum = parseInt(this.dataset.page);
					let trIndex = 0;

					document.querySelectorAll('li[data-page="' + pageNum + '"]').forEach(l => l.classList.add('active'));

					items.forEach(item => {
						trIndex++;
						if (trIndex > (maxItems * pageNum) || trIndex <= ((maxItems * pageNum) - maxItems)) {
							item.style.display = 'none';
						} else {
							item.style.display = '';
						}
					});
				});
			});
		});
	}
}

class Navigation {
	static activateTab(a) {
		a = toEl(a);
		if (!a) {
			return;
		}

		let ulNav = a.closest('.nav');
		if (!ulNav) {
			return;
		}
		let tabContent = ulNav.parentElement.querySelector('.tab-content');

		ulNav.querySelectorAll('a.nav-link').forEach(navLink => {
			navLink.classList.remove('active');
			const id = navLink.getAttribute('href');
			if (id && id.charAt(0) === '#') {
				const pane = tabContent.querySelector(id);
				if (pane) {
					pane.classList.remove('active');
					pane.classList.remove('show');
				}
			}
		});

		a.classList.add('active');
		const targetPane = tabContent.querySelector(a.getAttribute('href'));
		if (targetPane) {
			targetPane.classList.add('active');
			targetPane.classList.add('show');
		}
	}

	static showTab(a) {
		a = toEl(a);
		if (!a || typeof bootstrap == 'undefined') {
			return;
		}

		let tab = new bootstrap.Tab(a);
		tab.show();
	}

	static removeTabFromHistory(queryStringKey='tab') {
		let url = window.location.href;
		url = UrlAndQueryString.deleteParamOfUrl(queryStringKey, url);
		window.history.replaceState('', document.title, url);
	}

	static addTabInHistory(tabId, queryStringKey='tab', replace=true) {
		let url = window.location.href;
		url = UrlAndQueryString.setParamOfUrl(queryStringKey, tabId, url);
		if (replace) {
			window.history.replaceState('', document.title, url);
		}
		else {
			window.history.pushState("", "", url);
		}
	}
}

export { Pagination, Navigation };

// deprecated
/*
function paginationAsList(nbResultatsTotal, nbResultatsParPage, urlPage, nomParamPage) {
	var currentUrl = urlPage || window.location.href;
	var afficherLienFirstLastPage = true;
	var afficherLienPagePrecedenteSuivante = true;
	var emptyStringIfOnlyOnePage = true;
	var nbLiensPageDebutFin = 3;
	var nbLiensPageAvantApresPageCourante = 2;
	var strEntreLiensPageDebutFinEtAvantApresPageCourante = '…';
	nomParamPage = nomParamPage || 'page';

	// Si le nombre de résultat total est inférieur au nombre d'affichage par page, il n'y a qu'une seule page.
	if (nbResultatsTotal < nbResultatsParPage && emptyStringIfOnlyOnePage) {
		return '';
	}

	// Initialisation du nombre de pages
	var nbPages = Math.ceil(nbResultatsTotal/nbResultatsParPage);

	// Initialisation du numéro de la page courante
	//var query = window.location.search.substring(1).query.split("&");

	var url = new URL(currentUrl);
	var params = url.searchParams;

	var numPageCourante = 1;
	if (typeof params.get(nomParamPage) != 'undefined' && params.get(nomParamPage) != null) {
		numPageCourante = parseInt(params.get(nomParamPage));
	}
	if (numPageCourante < 0) {
		numPageCourante = 1;
	}
	if (numPageCourante > nbPages) {
		numPageCourante = nbPages;
	}

	var strPagination = '<ul class="pagination">';

	// Lien pour la première page
	if (afficherLienFirstLastPage) {
		var strLienFirstPage = '&lt;&lt;';
		if (numPageCourante > 1) {
			strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, 1, currentUrl)+'">'+strLienFirstPage+'</a></li>';
		}
		else {
			strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strLienFirstPage+'</a></li>';
		}
	}

	// Lien pour la page précédente
	if (afficherLienPagePrecedenteSuivante) {
		var strLienPagePrecedente = '&lt;';
		if (numPageCourante > 1) {
			strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, (numPageCourante - 1), currentUrl)+'">'+strLienPagePrecedente+'</a></li>';
		}
		else {
			strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strLienPagePrecedente+'</a></li>';
		}
	}

	var strEntreLiensPageDebutEtAvantPageCouranteDejaAffiche = false;
	var strEntreLiensPageFinEtApresPageCouranteDejaAffiche = false;

	for (var numPage=1; numPage<=nbPages; numPage++) {
		if (numPage < numPageCourante) {
			if (numPage <= nbLiensPageDebutFin || numPage >= (numPageCourante-nbLiensPageAvantApresPageCourante)) {
				strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, numPage, currentUrl)+'">'+numPage+'</a></li>';
			}
			else {
				if (!strEntreLiensPageDebutEtAvantPageCouranteDejaAffiche) {
					strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strEntreLiensPageDebutFinEtAvantApresPageCourante+'</a></li>';
					strEntreLiensPageDebutEtAvantPageCouranteDejaAffiche = true;
				}
			}
		}
		else if (numPage > numPageCourante) {
			if (numPage >= (nbPages-(nbLiensPageDebutFin-1)) || numPage <= (numPageCourante+nbLiensPageAvantApresPageCourante)) {
				strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, numPage, currentUrl)+'">'+numPage+'</a></li>';
			}
			else {
				if (!strEntreLiensPageFinEtApresPageCouranteDejaAffiche) {
					strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strEntreLiensPageDebutFinEtAvantApresPageCourante+'</a></li>';
					strEntreLiensPageFinEtApresPageCouranteDejaAffiche = true;
				}
			}
		}
		else {
			strPagination += '<li class="page-item active"><a class="page-link" href="#">'+numPage+'</a></li>';
		}
	}

	// Lien pour la page suivante
	if (afficherLienPagePrecedenteSuivante) {
		var strLienPageSuivante = '&gt;';
		if (numPageCourante < nbPages) {
			strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, (numPageCourante + 1), currentUrl)+'">'+strLienPageSuivante+'</a></li>';
		}
		else {
			strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strLienPageSuivante+'</a></li>';
		}
	}

	// Lien pour la dernière page
	if (afficherLienFirstLastPage) {
		var strLienLastPage = '&gt;&gt;';
		if (numPageCourante < nbPages) {
			strPagination += '<li class="page-item"><a class="page-link" href="'+UrlAndQueryString.setParamOfUrl(nomParamPage, nbPages, currentUrl)+'">'+strLienLastPage+'</a></li>';
		}
		else {
			strPagination += '<li class="page-item disabled"><a class="page-link" href="#">'+strLienLastPage+'</a></li>';
		}
	}

	strPagination += '</ul>';

	return strPagination;
}
*/