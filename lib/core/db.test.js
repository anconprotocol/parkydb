"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = __importDefault(require("ava"));
var db_1 = require("./db");
var payload = {
    commitHash: 'xg8pyBr3McqYlUgxAqV0t3s6TRcP+B7MHyPTtyVKMJw=',
    contentHash: {
        '/': 'baguqeerahiqryfzwbjc2fn7is4k2uupilwtoxabtb6noifnwxznxszuvrg6a',
    },
    digest: '0x5ab3124ede7a511fbc7c6302b164d1547aefda8b5909b6bb637c7da025c3ffaf',
    height: 207,
    issuer: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
    key: 'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNi9iYWd1cWVlcmFoaXFyeWZ6d2JqYzJmbjdpczRrMnV1cGlsd3RveGFidGI2bm9pZm53eHpueHN6dXZyZzZh',
    lastBlockHash: {
        '/': 'baguqeeraw4ssfjictj2b47cccep2oioytbjistjke2xuaa35qgdoivtgrwra',
    },
    network: 'anconprotocol',
    parentHash: {
        '/': 'baguqeerakv6jersryhhanjaihmb2ncdujajxt7gpkfzs7rkur7lo4s5uecwa',
    },
    rootKey: 'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNg==',
    signature: '0xa628e3e256a187453c55ffbebc189ec4464c6c0d874a278272d224dbbaa4f6f028d3550651c33edf7af0ea8b3f3806d09ba9135034a61dd1a651c67f83cb06a51b',
    timestamp: 1645384767,
    content: {
        blockchainTokenId: '8',
        blockchainTxHash: '0x977dd680952c4f7da1040d12a0a2c9e68a60f6158edee20b1591f91372030670',
        creator: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
        currentOrderHash: '',
        description: 'me and friends',
        fileExtension: 'jpg',
        image: 'baguqeerar56ywt7p3qbbf6wiqgja5ybvkblz4wx37vyybthr2jl65d657jha',
        name: 'Sweden 90s',
        owner: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
        price: '',
        sources: [
            'https://tensta.did.pa/v0/file/baguqeerar56ywt7p3qbbf6wiqgja5ybvkblz4wx37vyybthr2jl65d657jha/',
        ],
        tags: 'Diseño grafico',
        uuid: '854198e4-1c09-4c27-8103-2ae54adfc681',
    },
};
ava_1.default.beforeEach(function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var db;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = new db_1.ParkyDB();
                return [4, db.initialize()];
            case 1:
                _a.sent();
                t.context = {
                    db: db,
                };
                return [2];
        }
    });
}); });
ava_1.default('foo', function (t) {
    t.pass();
});
ava_1.default('put', function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var db, id, res, q;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = t.context.db;
                return [4, db.putBlock(payload)];
            case 1:
                id = _a.sent();
                return [4, db.get(id, null)];
            case 2:
                res = _a.sent();
                return [4, db.query({
                        cid: id,
                        query: "\n    query{\n       block(cid: \"" + id + "\") {\n         network\n         key\n       }\n    }   \n    ",
                    })];
            case 3:
                q = _a.sent();
                t.is(id, 'baguqeera73x5r73wfcwikxqxm6i3chhbvdhymsrekxkef6ejm3ymi4u2e4zq');
                return [2];
        }
    });
}); });
//# sourceMappingURL=db.test.js.map