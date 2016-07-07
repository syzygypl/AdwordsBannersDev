# AdwordsBannersDev
Gulp configuration and bootstrap for HTML5 Adwords Banners development

## Installation
clone repository
```
npm install
```

## Usage
Work in `dev` directory. Banners list is generated automatically and supports nested directories but make sure that final
directory is called using **[width]x[height]** (with optional **_anything** suffix) pattern as both values are used by
build scripts. Make sure to include `index.html` in your main directory.

You can use ES6 for external JavaScript files. Better not, if you decide to place it in `index.html` file for the banner.

`gulp clean` removes output files.

`gulp` / `gulp build` cleans `output` and builds the project.

`gulp serve` serves the project with list of banners and refreshes the page on files change in `dev` directory

`gulp zip` creates zipped folders with banners


**NOTE**: *`gulp serve` should bu used only for development as `output` may contain renamed / removed files*

## Remarks about clicktag

Clicktag implementations differ between different adsystems. You don't need clickTag in google Adwords,
you need one in other systems.

## Pro tip:
If you want to debug css for one of the scenes, just comment out scripts from index.html and set the desired scene in css

