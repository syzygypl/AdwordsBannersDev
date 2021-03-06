# AdwordsBannersDev
Gulp configuration and bootstrap for HTML5 Adwords Banners development


## Installation
clone repository
```
npm install
```


## Configuration
Work in `src` directory. Banners are stored in `src/banners`. Each banners needs to contain `config.json` file with
banner's configuration. Overlay masks (to preview banner on mock website) are stored in `src/masks`.

```javascript
{
	"title": "Example - screening with 750x200 banner",
	// banners can contain multiple objects
	"banners": [
		{
			"path": "750x200_double-bilboard/index.html", // required - relative path, can be path to *.html or static image
			"styles": {
				"width": 750, // required - unitless or with unit as string (e.g. "50%")
				"height": 200, // required
				"margin-top": 50 // space from top - overwrites default value
			}
		}
	],
	// optional - background image
	"wallpaper": {
		"path": "wallpaper.jpg", // relative path
		"color": "#fff"
	},
	// optional - overlay mask from `src/masks`
	"mask": "~example.png"
}
```

Banners list is generated on the fly (gulp locates all `config.json` files and lists values from `banners.path` object)
and supports nested directories.

You can use ES6 for external JavaScript files. Better not, if you decide to place it in `index.html` file for the banner.


## Usage

`gulp clean` removes output files - `build`, `zipped` and `urls.json`.

`gulp` / `gulp build` cleans and builds the project.

`gulp serve` serves the project with list of banners and refreshes the page on file change in `src` directory

`gulp zip` creates zipped folders from **current** content of `build` directory

**NOTE**: *`gulp serve` should bu used only for development as `build` may contain renamed / removed files*

### Stream filtering

To narrow working stream to specific directory `--filter` parameter can be applied. It works with both `gulp build` and
 `gulp serve` tasks. For example `gulp serve --filter ~example` will build and serve only banners located inside
 `banners/~example` directory.


## Remarks about clicktag

Clicktag implementations differ between different adsystems. You don't need clickTag in google Adwords,
you need one in other systems.


## Pro tip:
If you want to debug css for one of the scenes, just comment out scripts from index.html and set the desired scene in css
