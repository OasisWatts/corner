/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "src_back_util_setting_ts";
exports.ids = ["src_back_util_setting_ts"];
exports.modules = {

/***/ "./src/back/util/setting.ts":
/*!**********************************!*\
  !*** ./src/back/util/setting.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("var _interopRequireDefault=__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ \"@babel/runtime/helpers/interopRequireDefault\");Object.defineProperty(exports, \"__esModule\", ({value:true}));exports.SETTINGS=exports.CLOTHES=void 0;exports.fileInBuild=fileInBuild;exports.fileInPublic=fileInPublic;exports.schedule=schedule;exports.writeClientConstants=writeClientConstants;var _objectDestructuringEmpty2=_interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/objectDestructuringEmpty */ \"@babel/runtime/helpers/objectDestructuringEmpty\"));var _utility=__webpack_require__(/*! ./utility */ \"./src/back/util/utility.ts\");var _fs=_interopRequireDefault(__webpack_require__(/*! fs */ \"fs\"));var _path=_interopRequireDefault(__webpack_require__(/*! path */ \"path\"));var _ref;function getBoolean(name){return process.argv.includes(name);}var CLOTHES={development:!getBoolean(\"-remote\")};exports.CLOTHES=CLOTHES;var SETTINGS=(_ref=(0,_utility.merge)({},CLOTHES.development?JSON.parse(fileInPublic(\"settings/settings.dev.json\").toString()):JSON.parse(fileInPublic(\"settings/settings.json\").toString())),(0,_objectDestructuringEmpty2.default)(_ref),_ref);exports.SETTINGS=SETTINGS;function fileInPublic(file){return _fs.default.readFileSync(_path.default.resolve(__dirname,\"../public/\"+file));}function fileInBuild(file){return _fs.default.readFileSync(_path.default.resolve(__dirname,\"./\"+file));}function writeClientConstants(){var data=JSON.stringify((0,_utility.pick)(SETTINGS,\"host\",\"board\",\"follow\",\"block\"));_fs.default.writeFileSync(_path.default.resolve(__dirname,\"constants.js\"),`window.__CLIENT_SETTINGS=${data}`);}function schedule(callback,interval,options){if(options!=null&&options.callAtStart){callback();}if(options!=null&&options.punctual){var now=Date.now()+_utility.TIMEZONE_OFFSET;var gap=(1+Math.floor(now/interval))*interval-now;global.setTimeout(function(){callback();global.setInterval(callback,interval);},gap);}else{global.setInterval(callback,interval);}}\n\n//# sourceURL=webpack://cordova/./src/back/util/setting.ts?");

/***/ })

};
;