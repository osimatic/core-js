class ListBox {
	/*
	<div class="form-group">
		<div class="listebox_left">
			<span class="titre_listebox">Services interdits :</span><br/>
			<select name="liste_services" id="liste_services" class="liste_box liste_box_grand" size="10" multiple="multiple">
				<?php foreach ($listeServicesClient as $arbo) : ?>
					<option value="<?php echo $arbo->getIdArbo(); ?>"><?php echo $arbo->getLibelleAffiche(); ?></option>
				<?php endforeach ?>
			</select>
		</div>

		<div class="listebox_cmd">
			<a href="#" id="listebox_lien_right"><img src="<?php echo ROOT_PATH.DOSSIER_IMAGES; ?>icone_listbox_right.png" /></a><br/>
			<a href="#" id="listebox_lien_left"><img src="<?php echo ROOT_PATH.DOSSIER_IMAGES; ?>icone_listbox_left.png" /></a>
		</div>

		<div class="listebox_right">
			<span class="titre_listebox">Services autorisés :</span><br/>
			<select name="liste_services_stats[]" id="liste_services_stats" class="liste_box liste_box_grand" size="10" multiple="multiple">
				<?php foreach ($listeServicesStatsConsultant as $arbo) : ?>
					<option value="<?php echo $arbo->getIdArbo(); ?>"><?php echo $arbo->getLibelleAffiche(); ?></option>
				<?php endforeach ?>
			</select>
		</div>
		<div class="cl"></div>
	</div>
	*/

	/*
	Listbox Select All / Deselect All JavaScript
	Use :
	listbox_selectall('countryList', true); //select all the options
	listbox_selectall('countryList', false); //deselect all the options
	*/
	static selectall(listID, isSelect) {
		var listbox = document.getElementById(listID);
		for (var count=0; count < listbox.options.length; count++) {
			listbox.options[count].selected = isSelect;
		}
	}

	/*
	Listbox Move up/down options JavaScript
	Use :
	listbox_move('countryList', 'up'); //move up the selected option
	listbox_move('countryList', 'down'); //move down the selected option
	*/
	static move(listID, direction) {
		var listbox = document.getElementById(listID);
		var selIndex = listbox.selectedIndex;

		if (-1 === selIndex) {
			alert("Please select an option to move.");
			return;
		}

		var increment = -1;
		if (direction == 'up') {
			increment = -1;
		}
		else {
			increment = 1;
		}

		if ((selIndex + increment) < 0 || (selIndex + increment) > (listbox.options.length-1)) {
			return;
		}

		var selValue = listbox.options[selIndex].value;
		var selText = listbox.options[selIndex].text;
		listbox.options[selIndex].value = listbox.options[selIndex + increment].value
		listbox.options[selIndex].text = listbox.options[selIndex + increment].text

		listbox.options[selIndex + increment].value = selValue;
		listbox.options[selIndex + increment].text = selText;

		listbox.selectedIndex = selIndex + increment;
	}

	/*
	Listbox swap/move left-right options JavaScript
	Use :
	listbox_moveacross('countryList', 'selectedCountryList');
	*/
	static moveacross(sourceID, destID) {
		var src = document.getElementById(sourceID);
		var dest = document.getElementById(destID);

		for (var count=0; count < src.options.length; count++) {
			if (src.options[count].selected == true) {
				var option = src.options[count];

				var newOption = document.createElement("option");
				newOption.value = option.value;
				newOption.text = option.text;
				newOption.selected = true;
				try {
					dest.add(newOption, null); //Standard
					src.remove(count, null);
				}
				catch(error) {
					dest.add(newOption); // IE only
					src.remove(count);
				}
				count--;
			}
		}
	}

}

export { ListBox };