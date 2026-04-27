import { HTTPClient } from './http_client.js';
import { toEl } from './util.js';

class DetailsSubArray {

	static initDetailsLink(table, options = {}) {
		table = toEl(table);
		if (!table) {
			return;
		}

		const {
			onSuccess,
			onError,
			onBeforeSend,
			labelErrorOccurred = 'Une erreur s\'est produite.',
			showDetailsLabel = 'Afficher les détails',
			hideDetailsLabel = 'Masquer les détails',
		} = options;

		function getNbColumns(tr) {
			return tr.closest('table').querySelector('thead tr').children.length;
		}
		function displayErrorRow(tr) {
			tr.insertAdjacentHTML('afterend', '<tr class="text-error"><td colspan="'+getNbColumns(tr)+'">'+labelErrorOccurred+'</td></tr>');
		}
		function displayDetailsRow(tr, content) {
			const td = document.createElement('td');
			td.setAttribute('colspan', getNbColumns(tr));
			if (content instanceof Node) {
				td.appendChild(content);
			} else {
				td.innerHTML = content || '';
			}
			const trContent = document.createElement('tr');
			trContent.className = 'participants';
			trContent.appendChild(td);
			tr.insertAdjacentElement('afterend', trContent);
		}

		function hideDetailsRow(link) {
			const tr = link.closest('tr');
			tr.classList.add('folded');
			const next = tr.nextElementSibling;
			if (next && next.classList.contains('participants')) {
				next.remove();
			}
			showPlusButton(link);
		}

		function showPlusButton(link) {
			link.title = showDetailsLabel;
			link.disabled = false;
			link.innerHTML = '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>';
		}
		function showMinusButton(link) {
			link.title = hideDetailsLabel;
			link.disabled = false;
			link.innerHTML = '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>';
		}

		function displayLoading(link) {
			link.disabled = true;
			link.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i>';
			const tr = link.closest('tr');
			tr.insertAdjacentHTML('afterend', '<tr class="waiting_icon"><td colspan="'+getNbColumns(tr)+'" class="center"><i class="fa fa-circle-notch fa-spin"></i></td></tr>');
		}
		function hideLoading() {
			// todo : cacher que le loader du lien au lieu de tous les loaders (cas ou l'user clique sur tous les boutons rapidement)
			document.querySelectorAll('tr.waiting_icon').forEach(el => el.remove());
		}

		function setHideDetailsLink(link) {
			showMinusButton(link);
			link.onclick = function(e) {
				e.preventDefault();
				hideDetailsRow(link);
				setDisplayDetailsLink(link);
			};
		}

		function setDisplayDetailsLink(link) {
			link.onclick = function(e) {
				e.preventDefault();
				link.onclick = null;
				hideDetailsRow(link);
				doDetailsActionRequest(link);
			};
		}

		function doDetailsActionRequest(link) {
			displayLoading(link);

			if (onBeforeSend != null) {
				displayDetailsRow(link.closest('tr'), onBeforeSend(link));
				hideLoading();
				setHideDetailsLink(link);
				return;
			}

			function onComplete() {
				hideLoading();
				setHideDetailsLink(link);
			}

			HTTPClient.request('GET', link.dataset.url_details, null,
				(jsonObj) => {
					if (jsonObj == null) {
						if (onError != null) {
							onError(link);
							return;
						}
						displayErrorRow(link.closest('tr'));
						return;
					}

					if (onSuccess != null) {
						displayDetailsRow(link.closest('tr'), onSuccess(jsonObj, link));
					}

					onComplete();
				},
				() => {
					if (onError != null) {
						onError(link);
						return;
					}

					link.closest('tr').insertAdjacentHTML('afterend', '<tr class="error"><td colspan="6" class="center">'+(labelErrorOccurred ?? 'Une erreur s\'est produite.')+'</td></tr>');

					onComplete();
				}
			);
		}

		table.querySelectorAll('a.details_link').forEach((link) => {
			link.classList.remove('hide');
			setDisplayDetailsLink(link);
			showPlusButton(link);
		});
	}

}

export { DetailsSubArray };