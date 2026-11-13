import '../utils/string.js';
import { Locale } from '../location/Locale.js';

export class SocialNetwork {

	// ---------- Facebook ----------

	// Loading the Facebook SDK (shared by the share and like buttons)
	static getFacebookSdkScript(appId, locale) {
		return ''
			+'<div id="fb-root"></div>'
			+'<script>(function(d, s, id) {'
				+'var js, fjs = d.getElementsByTagName(s)[0];'
				+'if (d.getElementById(id)) return;'
				+'js = d.createElement(s); js.id = id;'
				+'js.src = "//connect.facebook.net/'+locale.replace('-', '_')+'/sdk.js#xfbml=1&appId='+appId+'&version=v2.0";'
				+'fjs.parentNode.insertBefore(js, fjs);'
			+'}(document, \'script\', \'facebook-jssdk\'));</script>'
		;
	}

	static getButtonFacebookShare(appId, urlPage, locale=Locale.getDefault()) {
		/*
		<a target="_blank" title="Facebook" href="https://www.facebook.com/sharer.php?u=<?php the_permalink(); ?>&t=<?php the_title(); ?>" rel="nofollow" onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=700');return false;"><img src="http://korben.info/wp-content/themes/korben2013/hab/facebook_icon.png" alt="Facebook" /></a>
		*/

		return SocialNetwork.getFacebookSdkScript(appId, locale)
			+'<div class="fb-share-button" data-href="'+urlPage+'"></div>'
		;
	}

	static getButtonFacebookLike(appId, urlPage, locale=Locale.getDefault()) {
		return SocialNetwork.getFacebookSdkScript(appId, locale)
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

	// ---------- Instagram ----------

	// Instagram handle (@…) derived from the profile URL
	static getInstagramHandle(url) {
		var path = new URL(url).pathname.replace(/\/+$/, '');
		return '@' + path.split('/').pop();
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
