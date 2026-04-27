import './string.js';

class SocialNetwork {

	// ---------- Facebook ----------

	static getButtonFacebookShare(appId, urlPage) {
		/*
		<a target="_blank" title="Facebook" href="https://www.facebook.com/sharer.php?u=<?php the_permalink(); ?>&t=<?php the_title(); ?>" rel="nofollow" onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=700');return false;"><img src="http://korben.info/wp-content/themes/korben2013/hab/facebook_icon.png" alt="Facebook" /></a>
		*/

		return ''
			+'<div id="fb-root"></div>'
			+'<script>(function(d, s, id) {'
				+'var js, fjs = d.getElementsByTagName(s)[0];'
				+'if (d.getElementById(id)) return;'
				+'js = d.createElement(s); js.id = id;'
				+'js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId='+appId+'version=v2.0";'
				+'fjs.parentNode.insertBefore(js, fjs);'
			+'}(document, \'script\', \'facebook-jssdk\'));</script>'
			+'<div class="fb-share-button" data-href="'+urlPage+'"></div>'
		;
	}

	static getButtonFacebookLike(appId, urlPage) {
		return ''
			+'<div id="fb-root"></div>'
			+'<script type="text/javascript">(function(d, s, id) {'
				+'var js, fjs = d.getElementsByTagName(s)[0];'
				+'if (d.getElementById(id)) return;'
				+'js = d.createElement(s); js.id = id;'
				+'js.src = "//connect.facebook.net/fr_FR/all.js#xfbml=1&amp;appId='+appId+'";'
				+'fjs.parentNode.insertBefore(js, fjs);'
			+'}(document, \'script\', \'facebook-jssdk\'));</script>'
			+'<div class="fb-like" data-href="'+urlPage+'" data-layout="button_count" data-show-faces="true"></div>'
		;
	}

	// ---------- Twitter ----------

	static getButtonTwitterShare(url, text, hashtags='', lang='fr') {
		/*
		<a target="_blank" title="Twitter" href="https://twitter.com/share?url=<?php the_permalink(); ?>&text=<?php the_title(); ?>&via=korben" rel="nofollow" onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=700');return false;"><img src="http://korben.info/wp-content/themes/korben2013/hab/twitter_icon.png" alt="Twitter" /></a>
		*/
		if (typeof text === 'string' && typeof text.escapeHtml === 'function') {
			text = text.escapeHtml();
		}
		return ''
			+'<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+url+'" data-text="'+text+'" data-lang="'+lang+'" data-hashtags="'+hashtags+'">Tweeter</a>'
			+'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
		;
	}

	// ---------- Google Plus ----------

	static getButtonGooglePlusShare(lang='fr') {
		/*
		<a target="_blank" title="Google +" href="https://plus.google.com/share?url=<?php the_permalink(); ?>&hl=fr" rel="nofollow" onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=450,width=650');return false;"><img src="http://korben.info/wp-content/themes/korben2013/hab/gplus_icon.png" alt="Google Plus" /></a>
		*/
	}

	static getButtonGooglePlusPlusOne(lang='fr') {
		/*
		$str = '
			<!-- Place this tag where you want the +1 button to render -->
			<div class="g-plusone"></div>

			<!-- Place this render call where appropriate -->
			<script type="text/javascript">
				window.___gcfg = {lang: \'fr\'};

				(function() {
					var po = document.createElement(\'script\'); po.type = \'text/javascript\'; po.async = true;
					po.src = \'https://apis.google.com/js/plusone.js\';
					var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(po, s);
				})();
			</script>
		';
		*/

		return ''
			+'<!-- Placez cette balise dans l\'en-tête ou juste avant la balise de fermeture du corps de texte. -->'
			+'<script src="https://apis.google.com/js/platform.js" async defer>{lang: \''+lang+'\'}</script>'
			+'<!-- Placez cette balise où vous souhaitez faire apparaître le gadget Bouton +1. -->'
			+'<div class="g-plusone"></div>'
		;
	}


	// ---------- Linkedin ----------

	static getButtonLinkedinShare() {
		/*
		<a target="_blank" title="Linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=<?php the_permalink(); ?>&title=<?php the_title(); ?>" rel="nofollow" onclick="javascript:window.open(this.href, '','menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=450,width=650');return false;"><img src="http://korben.info/wp-content/themes/korben2013/hab/linkedin_icon.png" alt="Linkedin" /></a>
		*/
	}

	static getButtonLinkedinFollow(id, lang='fr_FR') {
		return ''
			+'<script src="//platform.linkedin.com/in.js" type="text/javascript">lang: '+lang+'</script>'
			+'<script type="IN/FollowCompany" data-id="'+id+'" data-counter="right"></script>'
		;
	}

	// ---------- Flattr ----------

	static getButtonFlattrShare() {
		/*
		<a target="_blank" title="Flattr !" href="https://flattr.com/submit/auto?user_id=Korben&url=<?php the_permalink(); ?>&title=<?php the_title(); ?>&description=<?php bloginfo('description'); ?>&language=fr_FR&tags=blog&category=text" rel="nofollow"><img src="http://korben.info/wp-content/themes/korben2013/hab/flattr_icon.png" alt="Flattr !" /></a>
		*/
	}

}

export { SocialNetwork };