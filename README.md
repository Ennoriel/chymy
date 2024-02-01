in chyme, add "preserveModules: true" in rollup.config.mjs to tell rollup to transpile all files separately
in chyme, in package.json, added the following rule (the first one to keep the default import and the second one to import the files separetely)
"exports": {
".": {
"import": "./dist/es/index.js",
"require": "./dist/cjs/index.js",
"types": "./dist/types/index.d.ts"
},
"./_": {
"import": "./dist/es/_.js",
"require": "./dist/cjs/_.js",
"types": "./dist/types/_.d.ts"
}
},
in chymy, added "moduleResolution": "NodeNext" to import submodules
