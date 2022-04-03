"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hooks = void 0;
class Hooks {
    constructor() { }
    attachRouter(router) {
        this.router = router;
        return (pk, obj, tx) => {
            this.router.next(obj);
        };
    }
}
exports.Hooks = Hooks;
//# sourceMappingURL=hooks.js.map