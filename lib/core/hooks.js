"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hooks = void 0;
var Hooks = (function () {
    function Hooks() {
    }
    Hooks.prototype.attachRouter = function (router) {
        var _this = this;
        this.router = router;
        return function (pk, obj, tx) {
            _this.router.next(obj);
        };
    };
    return Hooks;
}());
exports.Hooks = Hooks;
//# sourceMappingURL=hooks.js.map