# AdwordsBannersDev
Gulp configurationa and bootstrap for HTML5 Adwords Banners development

## Installation
clone repository
```
npm install
gulp
```

## Usage
Work in dev directory. Banners list is generated automatically and supports nested directories but make sure that final
directory is called using `[width]x[height]` pattern and includes `index.html` file as both values are used by build scripts.

You can use es6 in javascript file if you use it separately.
Better not, if you decide to place it in index.html file for the banner.

`gulp build` or `gulp` builds the project.

`gulp serve` starts index.html with iframes of correct size. On change, the iframe itself is reloaded.

`gulp zip` creates zipped folders

*NOTE: `gulp serve` should bu used only for development as it doesn't clean output directory before build*

## Remarks about clicktag

Clicktag implementations differ between different adsystems. You don't need clicktag in google Adwords,
you need one in other systems.

## Pro tip:

If you want to debug css for one of the scenes, just comment out scripts from index.html and set the desired scene in css

