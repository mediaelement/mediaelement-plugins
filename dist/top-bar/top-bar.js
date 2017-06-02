'use strict';

/**
 * Download plugin
 *
 * This feature add download button into player.
 * To activate it, one of the nodes contained in the `<video>` tag must be
 * `<link href="http://domain.com/download-page" rel="download">`
 */

// Translations (English required)
mejs.i18n.en["mejs.download"] = "Download";
mejs.i18n.en["mejs.share"] = "Share";
mejs.i18n.en["mejs.report"] = "Report";
mejs.i18n.en["mejs.embed"] = "Embed";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
	 * @type {?String}
	 * @type {?String}
	 * @type {?String}
	 * @type function
	 */
	downloadText: null,
	shareButton: false,
	shareURL: null,
	shareText: null,
	reportButton: null,
	reportText: null,
	reportCallback: null
});

Object.assign(MediaElementPlayer.prototype, {

	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {$} controls
	 * @param {$} layers
	 * @param {HTMLElement} media
	 */
	buildtopbar (player, controls, layers, media)  {
		const
			t = this,
			downloadText = mejs.Utils.isString(t.options.downloadText) ? t.options.downloadText : mejs.i18n.t('mejs.download'),
			shareText = mejs.Utils.isString(t.options.shareText) ? t.options.shareText : mejs.i18n.t('mejs.share'),
			shareURL = mejs.Utils.isString(t.options.shareURL) ? t.options.shareURL : window.location.href,
			reportText = mejs.Utils.isString(t.options.reportText) ? t.options.reportText : mejs.i18n.t('mejs.report'),
			reportCallback = typeof t.options.reportCallback === 'function' ? t.options.reportCallback : null,
			downloadElement = t.container.querySelector('link[rel="download"]'),
			titleElement = t.container.querySelector('link[rel="title"]')
		;



		// Create top control container
		if(document.getElementById(`${t.options.classPrefix}top_controls`) === null)
		{
			player.top_controls = document.createElement('div');
			player.top_controls.id = `${t.options.classPrefix}top_controls`;
			player.top_controls.className = `${t.options.classPrefix}top_controls`;
			player.top_controls.style.display = 'none';

			layers.insertBefore(player.top_controls, layers.firstChild);

			player.top_controls.innerHTML = `<div id="${t.options.classPrefix}top_controls_left" class="${t.options.classPrefix}top_controls_left"></div><div id="${t.options.classPrefix}top_controls_right" class="${t.options.classPrefix}top_controls_right"></div>`;

			media.closest('.mejs__container').addEventListener('controlsshown', function() {
           		player.top_controls.style.display = '';
    		});
    		media.closest('.mejs__container').addEventListener('controlshidden', function() {
           		player.top_controls.style.display = 'none';
    		});
		}

		player.top_controls_left = document.getElementById(`${t.options.classPrefix}top_controls_left`);
		player.top_controls_right = document.getElementById(`${t.options.classPrefix}top_controls_right`);

		if(titleElement)
		{
			var title_href = titleElement.getAttribute('href'), title = titleElement.getAttribute('title');
			player.top_controls_left.innerHTML = title_href ? `<a href="${title_href}" title="${title}" target="_blank">${title}</a>` : title;
		}

		
		if(reportCallback !== null && t.options.reportButton)
		{
			player.report_button = document.createElement('button');
			player.report_button.className = `${t.options.classPrefix}top_btn`;
			player.report_button.title = reportText;
			player.report_button.innerHTML = '<i class="fa icon-flag" aria-hidden="true"></i>';

			player.report_button.addEventListener('click', reportCallback);

			player.top_controls_right.insertBefore(player.report_button, player.top_controls_right.firstChild);
		}
		

		if(t.options.shareButton)
		{
			var array_share_networks = [], page_title = window.document.title, poster = t.container.querySelector('video').getAttribute('poster');

			array_share_networks.push({ name: 'Facebook', class: 'icon-facebook-squared', link: 'https://www.facebook.com/sharer/sharer.php?u='+encodeURI(shareURL) });
			array_share_networks.push({ name: 'Twitter', class: 'icon-twitter-squared', link: 'https://twitter.com/intent/tweet?url='+encodeURI(shareURL)+'&text='+encodeURI(page_title) });
			array_share_networks.push({ name: 'G+', class: 'icon-gplus-squared', link: 'https://plus.google.com/u/0/share?url='+encodeURI(shareURL) });
			array_share_networks.push({ name: 'Reddit', class: 'icon-reddit-squared', link: 'https://www.reddit.com/submit?url='+encodeURI(shareURL)+'&title='+encodeURI(page_title) });
			array_share_networks.push({ name: 'Tumblr', class: 'icon-tumblr-squared', link: 'https://www.tumblr.com/widgets/share/tool/preview?shareSource=legacy&canonicalUrl=&posttype=video&content='+encodeURI(shareURL)+'&url='+encodeURI(shareURL)+'&caption=&_format=html' });
			array_share_networks.push({ name: 'Pinterest', class: 'icon-pinterest-squared', link: 'https://www.pinterest.com/pin/create/button/?url='+encodeURI(shareURL)+'&description='+encodeURI(page_title)+'&is_video=true&media='+encodeURI(poster) });
			array_share_networks.push({ name: 'Vkontakte', class: 'icon-vkontakte', link: 'http://vk.com/share.php?url='+encodeURI(shareURL) });

			var ul_share = '<ul>';
			for(var i=0; i<array_share_networks.length; i++) ul_share+= `<li><button class="${t.options.classPrefix}share_btn" share-url="${array_share_networks[i].link}" title="${array_share_networks[i].name}"><span class="${array_share_networks[i].class}"></span></button></li>`;
			ul_share+= `</ul><input type="text" value="${shareURL}" onfocus="this.select()" /><button id="${t.options.classPrefix}share_close_btn" class="${t.options.classPrefix}share_close_btn">Close</button>`;

			// Add share wrapper
			player.share_wrapper = document.createElement('div');
			player.share_wrapper.className = `${t.options.classPrefix}share_wrapper`;
			player.share_wrapper.id = `${t.options.classPrefix}share_wrapper`;
			player.share_wrapper.innerHTML = `<div id="${t.options.classPrefix}share_container" class="${t.options.classPrefix}share_container">${ul_share}</div>`;
			layers.insertBefore(player.share_wrapper, layers.firstChild);

			var share_btns = player.share_wrapper.getElementsByClassName(`${t.options.classPrefix}share_btn`);
			for(var i=0; i<share_btns.length; i++)
			{
				share_btns[i].addEventListener('click', function()
				{
					var popup_window = window.open(this.getAttribute('share-url'), '_blank', 'scrollbars=1,toolbar=0,location=0,menubar=0,height=500,width=auto');
					// popup_window.width = parseInt(popup_window.innerWidth);
					popup_window.onload = function()
					{
						this.width = parseInt(this.innerWidth);
					}
				});
			}

			document.getElementById(`${t.options.classPrefix}share_close_btn`).addEventListener('click', function()
				{
					player.share_wrapper.style.visibility = 'hidden';
				});

			player.share_button = document.createElement('button');
			player.share_button.className = `${t.options.classPrefix}top_btn`;
			player.share_button.title = shareText;
			player.share_button.innerHTML = '<i class="fa icon-share" aria-hidden="true"></i>';

			player.share_button.addEventListener('click', function()
				{
					player.share_wrapper.style.visibility = 'visible';
				});

			player.top_controls_right.insertBefore(player.share_button, player.top_controls_right.firstChild);
		}

		

		if(downloadElement)
		{
			player.download = document.createElement('a');
			player.download.href = downloadElement.getAttribute('href');
			player.download.className = `${t.options.classPrefix}top_btn`;
			player.download.target = '_blank';
			player.download.title = downloadText;
			player.download.innerHTML = '<i class="fa icon-download" aria-hidden="true"></i>';

			player.top_controls_right.insertBefore(player.download, player.top_controls_right.firstChild);
		}
	}
});