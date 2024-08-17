"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats = __importStar(require("nats"));
class Nats {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Nats.connection == null && !Nats.lock) {
                Nats.lock = true;
                Nats.connection = yield nats.connect({ servers: "nats://nats:4222" });
                // console.log(`Connected to NATS ${Nats.connection.getServer()} `);
            }
        });
    }
    static subscribeJsonResult(subject, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const sub = Nats.connection.subscribe(subject);
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                try {
                    for (var _d = true, sub_1 = __asyncValues(sub), sub_1_1; sub_1_1 = yield sub_1.next(), _a = sub_1_1.done, !_a; _d = true) {
                        _c = sub_1_1.value;
                        _d = false;
                        const m = _c;
                        const result = JSON.parse(nats.StringCodec().decode(m.data));
                        callback(m.subject, result);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = sub_1.return)) yield _b.call(sub_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }))();
            return sub;
        });
    }
    static subscribeUint8ArrayResult(subject, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const sub = Nats.connection.subscribe(subject);
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a, e_2, _b, _c;
                try {
                    for (var _d = true, sub_2 = __asyncValues(sub), sub_2_1; sub_2_1 = yield sub_2.next(), _a = sub_2_1.done, !_a; _d = true) {
                        _c = sub_2_1.value;
                        _d = false;
                        const m = _c;
                        console.log("Received a message:", m.subject, m.data);
                        callback(m.subject, m.data);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = sub_2.return)) yield _b.call(sub_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }))();
            return sub;
        });
    }
    static publish(subject, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = "";
            if (data instanceof Object) {
                msg = JSON.stringify(data);
            }
            Nats.connection.publish(subject, nats.StringCodec().encode(msg));
        });
    }
}
Nats.lock = false;
exports.default = {
    s: Nats,
    n: new Nats(),
};
