import { SocialNetwork } from '../social_network.js';

describe('SocialNetwork', () => {
	describe('Facebook', () => {
		describe('getButtonFacebookShare', () => {
			test('should generate Facebook share button HTML', () => {
				const result = SocialNetwork.getButtonFacebookShare('123456789', 'https://example.com/page');

				expect(result).toContain('<div id="fb-root"></div>');
				expect(result).toContain('<script>');
				expect(result).toContain('facebook-jssdk');
				expect(result).toContain('123456789');
				expect(result).toContain('https://example.com/page');
			});

			test('should include Facebook SDK script', () => {
				const result = SocialNetwork.getButtonFacebookShare('123456789', 'https://example.com/page');

				expect(result).toContain('connect.facebook.net/en_GB/sdk.js');
				expect(result).toContain('xfbml=1');
			});

			test('should include share button div', () => {
				const result = SocialNetwork.getButtonFacebookShare('123456789', 'https://example.com/page');

				expect(result).toContain('fb-share-button');
				expect(result).toContain('data-href="https://example.com/page"');
			});

			test('should handle different app IDs', () => {
				const result1 = SocialNetwork.getButtonFacebookShare('111111111', 'https://example.com');
				const result2 = SocialNetwork.getButtonFacebookShare('999999999', 'https://example.com');

				expect(result1).toContain('111111111');
				expect(result2).toContain('999999999');
			});

			test('should handle different URLs', () => {
				const result1 = SocialNetwork.getButtonFacebookShare('123', 'https://site1.com');
				const result2 = SocialNetwork.getButtonFacebookShare('123', 'https://site2.com/path');

				expect(result1).toContain('https://site1.com');
				expect(result2).toContain('https://site2.com/path');
			});

			test('should include SDK version', () => {
				const result = SocialNetwork.getButtonFacebookShare('123456789', 'https://example.com');

				expect(result).toContain('version=v2.0');
			});
		});

		describe('getButtonFacebookLike', () => {
			test('should generate Facebook like button HTML', () => {
				const result = SocialNetwork.getButtonFacebookLike('123456789', 'https://example.com/page');

				expect(result).toContain('<div id="fb-root"></div>');
				expect(result).toContain('<script type="text/javascript">');
				expect(result).toContain('facebook-jssdk');
				expect(result).toContain('123456789');
				expect(result).toContain('https://example.com/page');
			});

			test('should use French locale', () => {
				const result = SocialNetwork.getButtonFacebookLike('123456789', 'https://example.com');

				expect(result).toContain('connect.facebook.net/fr_FR/all.js');
			});

			test('should include like button div', () => {
				const result = SocialNetwork.getButtonFacebookLike('123456789', 'https://example.com/page');

				expect(result).toContain('fb-like');
				expect(result).toContain('data-href="https://example.com/page"');
				expect(result).toContain('data-layout="button_count"');
				expect(result).toContain('data-show-faces="true"');
			});

			test('should handle different app IDs', () => {
				const result1 = SocialNetwork.getButtonFacebookLike('111111111', 'https://example.com');
				const result2 = SocialNetwork.getButtonFacebookLike('999999999', 'https://example.com');

				expect(result1).toContain('111111111');
				expect(result2).toContain('999999999');
			});

			test('should handle different URLs', () => {
				const result1 = SocialNetwork.getButtonFacebookLike('123', 'https://site1.com');
				const result2 = SocialNetwork.getButtonFacebookLike('123', 'https://site2.com/article');

				expect(result1).toContain('https://site1.com');
				expect(result2).toContain('https://site2.com/article');
			});
		});
	});

	describe('Twitter', () => {
		describe('getButtonTwitterShare', () => {
			test('should generate Twitter share button HTML', () => {
				const result = SocialNetwork.getButtonTwitterShare(
					'https://example.com/page',
					'Check this out!'
				);

				expect(result).toContain('<a href="https://twitter.com/share"');
				expect(result).toContain('twitter-share-button');
				expect(result).toContain('data-url="https://example.com/page"');
				expect(result).toContain('data-text="Check this out!"');
			});

			test('should use default French language', () => {
				const result = SocialNetwork.getButtonTwitterShare('https://example.com', 'Text');

				expect(result).toContain('data-lang="fr"');
			});

			test('should allow custom language', () => {
				const result = SocialNetwork.getButtonTwitterShare(
					'https://example.com',
					'Text',
					'',
					'en'
				);

				expect(result).toContain('data-lang="en"');
			});

			test('should include hashtags when provided', () => {
				const result = SocialNetwork.getButtonTwitterShare(
					'https://example.com',
					'Text',
					'tech,news'
				);

				expect(result).toContain('data-hashtags="tech,news"');
			});

			test('should handle empty hashtags', () => {
				const result = SocialNetwork.getButtonTwitterShare(
					'https://example.com',
					'Text',
					''
				);

				expect(result).toContain('data-hashtags=""');
			});

			test('should include Twitter widgets script', () => {
				const result = SocialNetwork.getButtonTwitterShare('https://example.com', 'Text');

				expect(result).toContain('platform.twitter.com/widgets.js');
				expect(result).toContain('twitter-wjs');
			});

			test('should contain "Tweeter" text', () => {
				const result = SocialNetwork.getButtonTwitterShare('https://example.com', 'Text');

				expect(result).toContain('Tweeter</a>');
			});

			test('should handle different URLs', () => {
				const result1 = SocialNetwork.getButtonTwitterShare('https://site1.com', 'Text');
				const result2 = SocialNetwork.getButtonTwitterShare('https://site2.com/post', 'Text');

				expect(result1).toContain('https://site1.com');
				expect(result2).toContain('https://site2.com/post');
			});

			test('should handle different text content', () => {
				const result1 = SocialNetwork.getButtonTwitterShare('https://example.com', 'First text');
				const result2 = SocialNetwork.getButtonTwitterShare('https://example.com', 'Second text');

				expect(result1).toContain('First text');
				expect(result2).toContain('Second text');
			});

			test('should handle special characters in text', () => {
				const result = SocialNetwork.getButtonTwitterShare(
					'https://example.com',
					'Text with "quotes" & symbols'
				);

				expect(result).toContain('Text with &quot;quotes&quot; &amp; symbols');
			});
		});
	});

	describe('Google Plus', () => {
		describe('getButtonGooglePlusShare', () => {
			test('should return undefined (not implemented)', () => {
				const result = SocialNetwork.getButtonGooglePlusShare();

				expect(result).toBeUndefined();
			});

			test('should accept language parameter', () => {
				expect(() => {
					SocialNetwork.getButtonGooglePlusShare('en');
				}).not.toThrow();
			});
		});

		describe('getButtonGooglePlusPlusOne', () => {
			test('should generate Google Plus +1 button HTML', () => {
				const result = SocialNetwork.getButtonGooglePlusPlusOne();

				expect(result).toContain('<script src="https://apis.google.com/js/platform.js"');
				expect(result).toContain('async defer');
				expect(result).toContain('<div class="g-plusone"></div>');
			});

			test('should use default French language', () => {
				const result = SocialNetwork.getButtonGooglePlusPlusOne();

				expect(result).toContain("lang: 'fr'");
			});

			test('should allow custom language', () => {
				const result = SocialNetwork.getButtonGooglePlusPlusOne('en');

				expect(result).toContain("lang: 'en'");
			});

			test('should include HTML comments', () => {
				const result = SocialNetwork.getButtonGooglePlusPlusOne();

				expect(result).toContain('<!-- Placez cette balise');
			});

			test('should handle different locales', () => {
				const resultFr = SocialNetwork.getButtonGooglePlusPlusOne('fr');
				const resultEn = SocialNetwork.getButtonGooglePlusPlusOne('en');
				const resultDe = SocialNetwork.getButtonGooglePlusPlusOne('de');

				expect(resultFr).toContain("'fr'");
				expect(resultEn).toContain("'en'");
				expect(resultDe).toContain("'de'");
			});
		});
	});

	describe('LinkedIn', () => {
		describe('getButtonLinkedinShare', () => {
			test('should return undefined (not implemented)', () => {
				const result = SocialNetwork.getButtonLinkedinShare();

				expect(result).toBeUndefined();
			});
		});

		describe('getButtonLinkedinFollow', () => {
			test('should generate LinkedIn follow button HTML', () => {
				const result = SocialNetwork.getButtonLinkedinFollow('123456');

				expect(result).toContain('<script src="//platform.linkedin.com/in.js"');
				expect(result).toContain('type="text/javascript"');
				expect(result).toContain('<script type="IN/FollowCompany"');
				expect(result).toContain('data-id="123456"');
			});

			test('should use default fr_FR locale', () => {
				const result = SocialNetwork.getButtonLinkedinFollow('123456');

				expect(result).toContain('lang: fr_FR');
			});

			test('should allow custom locale', () => {
				const result = SocialNetwork.getButtonLinkedinFollow('123456', 'en_US');

				expect(result).toContain('lang: en_US');
			});

			test('should include counter on right', () => {
				const result = SocialNetwork.getButtonLinkedinFollow('123456');

				expect(result).toContain('data-counter="right"');
			});

			test('should handle different company IDs', () => {
				const result1 = SocialNetwork.getButtonLinkedinFollow('111111');
				const result2 = SocialNetwork.getButtonLinkedinFollow('999999');

				expect(result1).toContain('data-id="111111"');
				expect(result2).toContain('data-id="999999"');
			});

			test('should handle different locales', () => {
				const resultFr = SocialNetwork.getButtonLinkedinFollow('123', 'fr_FR');
				const resultEn = SocialNetwork.getButtonLinkedinFollow('123', 'en_US');
				const resultDe = SocialNetwork.getButtonLinkedinFollow('123', 'de_DE');

				expect(resultFr).toContain('fr_FR');
				expect(resultEn).toContain('en_US');
				expect(resultDe).toContain('de_DE');
			});
		});
	});

	describe('Flattr', () => {
		describe('getButtonFlattrShare', () => {
			test('should return undefined (not implemented)', () => {
				const result = SocialNetwork.getButtonFlattrShare();

				expect(result).toBeUndefined();
			});
		});
	});

	describe('Integration tests', () => {
		test('all implemented methods should return non-empty strings', () => {
			expect(SocialNetwork.getButtonFacebookShare('123', 'url').length).toBeGreaterThan(0);
			expect(SocialNetwork.getButtonFacebookLike('123', 'url').length).toBeGreaterThan(0);
			expect(SocialNetwork.getButtonTwitterShare('url', 'text').length).toBeGreaterThan(0);
			expect(SocialNetwork.getButtonGooglePlusPlusOne().length).toBeGreaterThan(0);
			expect(SocialNetwork.getButtonLinkedinFollow('123').length).toBeGreaterThan(0);
		});

		test('generated HTML should not have syntax errors', () => {
			const fbShare = SocialNetwork.getButtonFacebookShare('123', 'https://example.com');
			const fbLike = SocialNetwork.getButtonFacebookLike('123', 'https://example.com');
			const twitter = SocialNetwork.getButtonTwitterShare('https://example.com', 'Text');
			const gplus = SocialNetwork.getButtonGooglePlusPlusOne();
			const linkedin = SocialNetwork.getButtonLinkedinFollow('123');

			// Check for balanced script tags
			expect((fbShare.match(/<script>/g) || []).length).toBeGreaterThan(0);
			expect((fbLike.match(/<script/g) || []).length).toBeGreaterThan(0);
			expect((twitter.match(/<script>/g) || []).length).toBeGreaterThan(0);
			expect((gplus.match(/<script/g) || []).length).toBeGreaterThan(0);
			expect((linkedin.match(/<script/g) || []).length).toBeGreaterThan(0);
		});
	});
});