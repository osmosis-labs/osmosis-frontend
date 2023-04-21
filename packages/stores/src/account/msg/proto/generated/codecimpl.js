"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.google = exports.osmosis = exports.cosmos = void 0;
var $protobuf = require("protobufjs/minimal");
const $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;
const $root = {};
exports.cosmos = $root.cosmos = (() => {
  const cosmos = {};
  cosmos.base = (function () {
    const base = {};
    base.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Coin = (function () {
        function Coin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Coin.prototype.denom = "";
        Coin.prototype.amount = "";
        Coin.create = function create(properties) {
          return new Coin(properties);
        };
        Coin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            w.uint32(18).string(m.amount);
          return w;
        };
        Coin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.Coin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Coin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.Coin) return d;
          var m = new $root.cosmos.base.v1beta1.Coin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        Coin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.amount = "";
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = m.amount;
          }
          return d;
        };
        Coin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Coin;
      })();
      v1beta1.DecCoin = (function () {
        function DecCoin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecCoin.prototype.denom = "";
        DecCoin.prototype.amount = "";
        DecCoin.create = function create(properties) {
          return new DecCoin(properties);
        };
        DecCoin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            w.uint32(18).string(m.amount);
          return w;
        };
        DecCoin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecCoin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecCoin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecCoin) return d;
          var m = new $root.cosmos.base.v1beta1.DecCoin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        DecCoin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.amount = "";
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = m.amount;
          }
          return d;
        };
        DecCoin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecCoin;
      })();
      v1beta1.IntProto = (function () {
        function IntProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        IntProto.prototype.int = "";
        IntProto.create = function create(properties) {
          return new IntProto(properties);
        };
        IntProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.int != null && Object.hasOwnProperty.call(m, "int"))
            w.uint32(10).string(m.int);
          return w;
        };
        IntProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.IntProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.int = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        IntProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.IntProto) return d;
          var m = new $root.cosmos.base.v1beta1.IntProto();
          if (d.int != null) {
            m.int = String(d.int);
          }
          return m;
        };
        IntProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.int = "";
          }
          if (m.int != null && m.hasOwnProperty("int")) {
            d.int = m.int;
          }
          return d;
        };
        IntProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return IntProto;
      })();
      v1beta1.DecProto = (function () {
        function DecProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecProto.prototype.dec = "";
        DecProto.create = function create(properties) {
          return new DecProto(properties);
        };
        DecProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.dec != null && Object.hasOwnProperty.call(m, "dec"))
            w.uint32(10).string(m.dec);
          return w;
        };
        DecProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.dec = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecProto) return d;
          var m = new $root.cosmos.base.v1beta1.DecProto();
          if (d.dec != null) {
            m.dec = String(d.dec);
          }
          return m;
        };
        DecProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.dec = "";
          }
          if (m.dec != null && m.hasOwnProperty("dec")) {
            d.dec = m.dec;
          }
          return d;
        };
        DecProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecProto;
      })();
      return v1beta1;
    })();
    return base;
  })();
  cosmos.bank = (function () {
    const bank = {};
    bank.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Params = (function () {
        function Params(p) {
          this.sendEnabled = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Params.prototype.sendEnabled = $util.emptyArray;
        Params.prototype.defaultSendEnabled = false;
        Params.create = function create(properties) {
          return new Params(properties);
        };
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sendEnabled != null && m.sendEnabled.length) {
            for (var i = 0; i < m.sendEnabled.length; ++i)
              $root.cosmos.bank.v1beta1.SendEnabled.encode(
                m.sendEnabled[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.defaultSendEnabled != null &&
            Object.hasOwnProperty.call(m, "defaultSendEnabled")
          )
            w.uint32(16).bool(m.defaultSendEnabled);
          return w;
        };
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.sendEnabled && m.sendEnabled.length))
                  m.sendEnabled = [];
                m.sendEnabled.push(
                  $root.cosmos.bank.v1beta1.SendEnabled.decode(r, r.uint32())
                );
                break;
              case 2:
                m.defaultSendEnabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Params.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Params) return d;
          var m = new $root.cosmos.bank.v1beta1.Params();
          if (d.sendEnabled) {
            if (!Array.isArray(d.sendEnabled))
              throw TypeError(
                ".cosmos.bank.v1beta1.Params.sendEnabled: array expected"
              );
            m.sendEnabled = [];
            for (var i = 0; i < d.sendEnabled.length; ++i) {
              if (typeof d.sendEnabled[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Params.sendEnabled: object expected"
                );
              m.sendEnabled[i] =
                $root.cosmos.bank.v1beta1.SendEnabled.fromObject(
                  d.sendEnabled[i]
                );
            }
          }
          if (d.defaultSendEnabled != null) {
            m.defaultSendEnabled = Boolean(d.defaultSendEnabled);
          }
          return m;
        };
        Params.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.sendEnabled = [];
          }
          if (o.defaults) {
            d.defaultSendEnabled = false;
          }
          if (m.sendEnabled && m.sendEnabled.length) {
            d.sendEnabled = [];
            for (var j = 0; j < m.sendEnabled.length; ++j) {
              d.sendEnabled[j] = $root.cosmos.bank.v1beta1.SendEnabled.toObject(
                m.sendEnabled[j],
                o
              );
            }
          }
          if (
            m.defaultSendEnabled != null &&
            m.hasOwnProperty("defaultSendEnabled")
          ) {
            d.defaultSendEnabled = m.defaultSendEnabled;
          }
          return d;
        };
        Params.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Params;
      })();
      v1beta1.SendEnabled = (function () {
        function SendEnabled(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SendEnabled.prototype.denom = "";
        SendEnabled.prototype.enabled = false;
        SendEnabled.create = function create(properties) {
          return new SendEnabled(properties);
        };
        SendEnabled.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled"))
            w.uint32(16).bool(m.enabled);
          return w;
        };
        SendEnabled.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.SendEnabled();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.enabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SendEnabled.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.SendEnabled) return d;
          var m = new $root.cosmos.bank.v1beta1.SendEnabled();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.enabled != null) {
            m.enabled = Boolean(d.enabled);
          }
          return m;
        };
        SendEnabled.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.enabled = false;
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.enabled != null && m.hasOwnProperty("enabled")) {
            d.enabled = m.enabled;
          }
          return d;
        };
        SendEnabled.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SendEnabled;
      })();
      v1beta1.Input = (function () {
        function Input(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Input.prototype.address = "";
        Input.prototype.coins = $util.emptyArray;
        Input.create = function create(properties) {
          return new Input(properties);
        };
        Input.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Input.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Input();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Input.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Input) return d;
          var m = new $root.cosmos.bank.v1beta1.Input();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                ".cosmos.bank.v1beta1.Input.coins: array expected"
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Input.coins: object expected"
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Input.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Input.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Input;
      })();
      v1beta1.Output = (function () {
        function Output(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Output.prototype.address = "";
        Output.prototype.coins = $util.emptyArray;
        Output.create = function create(properties) {
          return new Output(properties);
        };
        Output.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Output.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Output();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Output.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Output) return d;
          var m = new $root.cosmos.bank.v1beta1.Output();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                ".cosmos.bank.v1beta1.Output.coins: array expected"
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Output.coins: object expected"
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Output.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Output.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Output;
      })();
      v1beta1.Supply = (function () {
        function Supply(p) {
          this.total = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Supply.prototype.total = $util.emptyArray;
        Supply.create = function create(properties) {
          return new Supply(properties);
        };
        Supply.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.total != null && m.total.length) {
            for (var i = 0; i < m.total.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.total[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        Supply.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Supply();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.total && m.total.length)) m.total = [];
                m.total.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Supply.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Supply) return d;
          var m = new $root.cosmos.bank.v1beta1.Supply();
          if (d.total) {
            if (!Array.isArray(d.total))
              throw TypeError(
                ".cosmos.bank.v1beta1.Supply.total: array expected"
              );
            m.total = [];
            for (var i = 0; i < d.total.length; ++i) {
              if (typeof d.total[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Supply.total: object expected"
                );
              m.total[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.total[i]
              );
            }
          }
          return m;
        };
        Supply.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.total = [];
          }
          if (m.total && m.total.length) {
            d.total = [];
            for (var j = 0; j < m.total.length; ++j) {
              d.total[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.total[j],
                o
              );
            }
          }
          return d;
        };
        Supply.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Supply;
      })();
      v1beta1.DenomUnit = (function () {
        function DenomUnit(p) {
          this.aliases = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DenomUnit.prototype.denom = "";
        DenomUnit.prototype.exponent = 0;
        DenomUnit.prototype.aliases = $util.emptyArray;
        DenomUnit.create = function create(properties) {
          return new DenomUnit(properties);
        };
        DenomUnit.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.exponent != null && Object.hasOwnProperty.call(m, "exponent"))
            w.uint32(16).uint32(m.exponent);
          if (m.aliases != null && m.aliases.length) {
            for (var i = 0; i < m.aliases.length; ++i)
              w.uint32(26).string(m.aliases[i]);
          }
          return w;
        };
        DenomUnit.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.DenomUnit();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.exponent = r.uint32();
                break;
              case 3:
                if (!(m.aliases && m.aliases.length)) m.aliases = [];
                m.aliases.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DenomUnit.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.DenomUnit) return d;
          var m = new $root.cosmos.bank.v1beta1.DenomUnit();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.exponent != null) {
            m.exponent = d.exponent >>> 0;
          }
          if (d.aliases) {
            if (!Array.isArray(d.aliases))
              throw TypeError(
                ".cosmos.bank.v1beta1.DenomUnit.aliases: array expected"
              );
            m.aliases = [];
            for (var i = 0; i < d.aliases.length; ++i) {
              m.aliases[i] = String(d.aliases[i]);
            }
          }
          return m;
        };
        DenomUnit.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.aliases = [];
          }
          if (o.defaults) {
            d.denom = "";
            d.exponent = 0;
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.exponent != null && m.hasOwnProperty("exponent")) {
            d.exponent = m.exponent;
          }
          if (m.aliases && m.aliases.length) {
            d.aliases = [];
            for (var j = 0; j < m.aliases.length; ++j) {
              d.aliases[j] = m.aliases[j];
            }
          }
          return d;
        };
        DenomUnit.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DenomUnit;
      })();
      v1beta1.Metadata = (function () {
        function Metadata(p) {
          this.denomUnits = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Metadata.prototype.description = "";
        Metadata.prototype.denomUnits = $util.emptyArray;
        Metadata.prototype.base = "";
        Metadata.prototype.display = "";
        Metadata.prototype.name = "";
        Metadata.prototype.symbol = "";
        Metadata.prototype.uri = "";
        Metadata.prototype.uriHash = "";
        Metadata.create = function create(properties) {
          return new Metadata(properties);
        };
        Metadata.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, "description")
          )
            w.uint32(10).string(m.description);
          if (m.denomUnits != null && m.denomUnits.length) {
            for (var i = 0; i < m.denomUnits.length; ++i)
              $root.cosmos.bank.v1beta1.DenomUnit.encode(
                m.denomUnits[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.base != null && Object.hasOwnProperty.call(m, "base"))
            w.uint32(26).string(m.base);
          if (m.display != null && Object.hasOwnProperty.call(m, "display"))
            w.uint32(34).string(m.display);
          if (m.name != null && Object.hasOwnProperty.call(m, "name"))
            w.uint32(42).string(m.name);
          if (m.symbol != null && Object.hasOwnProperty.call(m, "symbol"))
            w.uint32(50).string(m.symbol);
          if (m.uri != null && Object.hasOwnProperty.call(m, "uri"))
            w.uint32(58).string(m.uri);
          if (m.uriHash != null && Object.hasOwnProperty.call(m, "uriHash"))
            w.uint32(66).string(m.uriHash);
          return w;
        };
        Metadata.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Metadata();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.description = r.string();
                break;
              case 2:
                if (!(m.denomUnits && m.denomUnits.length)) m.denomUnits = [];
                m.denomUnits.push(
                  $root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32())
                );
                break;
              case 3:
                m.base = r.string();
                break;
              case 4:
                m.display = r.string();
                break;
              case 5:
                m.name = r.string();
                break;
              case 6:
                m.symbol = r.string();
                break;
              case 7:
                m.uri = r.string();
                break;
              case 8:
                m.uriHash = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Metadata.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Metadata) return d;
          var m = new $root.cosmos.bank.v1beta1.Metadata();
          if (d.description != null) {
            m.description = String(d.description);
          }
          if (d.denomUnits) {
            if (!Array.isArray(d.denomUnits))
              throw TypeError(
                ".cosmos.bank.v1beta1.Metadata.denomUnits: array expected"
              );
            m.denomUnits = [];
            for (var i = 0; i < d.denomUnits.length; ++i) {
              if (typeof d.denomUnits[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Metadata.denomUnits: object expected"
                );
              m.denomUnits[i] = $root.cosmos.bank.v1beta1.DenomUnit.fromObject(
                d.denomUnits[i]
              );
            }
          }
          if (d.base != null) {
            m.base = String(d.base);
          }
          if (d.display != null) {
            m.display = String(d.display);
          }
          if (d.name != null) {
            m.name = String(d.name);
          }
          if (d.symbol != null) {
            m.symbol = String(d.symbol);
          }
          if (d.uri != null) {
            m.uri = String(d.uri);
          }
          if (d.uriHash != null) {
            m.uriHash = String(d.uriHash);
          }
          return m;
        };
        Metadata.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.denomUnits = [];
          }
          if (o.defaults) {
            d.description = "";
            d.base = "";
            d.display = "";
            d.name = "";
            d.symbol = "";
            d.uri = "";
            d.uriHash = "";
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = m.description;
          }
          if (m.denomUnits && m.denomUnits.length) {
            d.denomUnits = [];
            for (var j = 0; j < m.denomUnits.length; ++j) {
              d.denomUnits[j] = $root.cosmos.bank.v1beta1.DenomUnit.toObject(
                m.denomUnits[j],
                o
              );
            }
          }
          if (m.base != null && m.hasOwnProperty("base")) {
            d.base = m.base;
          }
          if (m.display != null && m.hasOwnProperty("display")) {
            d.display = m.display;
          }
          if (m.name != null && m.hasOwnProperty("name")) {
            d.name = m.name;
          }
          if (m.symbol != null && m.hasOwnProperty("symbol")) {
            d.symbol = m.symbol;
          }
          if (m.uri != null && m.hasOwnProperty("uri")) {
            d.uri = m.uri;
          }
          if (m.uriHash != null && m.hasOwnProperty("uriHash")) {
            d.uriHash = m.uriHash;
          }
          return d;
        };
        Metadata.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Metadata;
      })();
      return v1beta1;
    })();
    return bank;
  })();
  return cosmos;
})();
exports.osmosis = $root.osmosis = (() => {
  const osmosis = {};
  osmosis.poolmanager = (function () {
    const poolmanager = {};
    poolmanager.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.swapExactAmountIn = function swapExactAmountIn(
            request,
            callback
          ) {
            return this.rpcCall(
              swapExactAmountIn,
              $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn,
              $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "SwapExactAmountIn" }
        );
        Object.defineProperty(
          (Msg.prototype.swapExactAmountOut = function swapExactAmountOut(
            request,
            callback
          ) {
            return this.rpcCall(
              swapExactAmountOut,
              $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut,
              $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "SwapExactAmountOut" }
        );
        return Msg;
      })();
      v1beta1.MsgSwapExactAmountIn = (function () {
        function MsgSwapExactAmountIn(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountIn.prototype.sender = "";
        MsgSwapExactAmountIn.prototype.routes = $util.emptyArray;
        MsgSwapExactAmountIn.prototype.tokenIn = null;
        MsgSwapExactAmountIn.prototype.tokenOutMinAmount = "";
        MsgSwapExactAmountIn.create = function create(properties) {
          return new MsgSwapExactAmountIn(properties);
        };
        MsgSwapExactAmountIn.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.tokenIn != null && Object.hasOwnProperty.call(m, "tokenIn"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenIn,
              w.uint32(26).fork()
            ).ldelim();
          if (
            m.tokenOutMinAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutMinAmount")
          )
            w.uint32(34).string(m.tokenOutMinAmount);
          return w;
        };
        MsgSwapExactAmountIn.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenIn = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.tokenOutMinAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountIn.fromObject = function fromObject(d) {
          if (
            d instanceof $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn
          )
            return d;
          var m = new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenIn != null) {
            if (typeof d.tokenIn !== "object")
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn.tokenIn: object expected"
              );
            m.tokenIn = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenIn);
          }
          if (d.tokenOutMinAmount != null) {
            m.tokenOutMinAmount = String(d.tokenOutMinAmount);
          }
          return m;
        };
        MsgSwapExactAmountIn.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenIn = null;
            d.tokenOutMinAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (m.tokenIn != null && m.hasOwnProperty("tokenIn")) {
            d.tokenIn = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenIn, o);
          }
          if (
            m.tokenOutMinAmount != null &&
            m.hasOwnProperty("tokenOutMinAmount")
          ) {
            d.tokenOutMinAmount = m.tokenOutMinAmount;
          }
          return d;
        };
        MsgSwapExactAmountIn.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountIn;
      })();
      v1beta1.MsgSwapExactAmountInResponse = (function () {
        function MsgSwapExactAmountInResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountInResponse.prototype.tokenOutAmount = "";
        MsgSwapExactAmountInResponse.create = function create(properties) {
          return new MsgSwapExactAmountInResponse(properties);
        };
        MsgSwapExactAmountInResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenOutAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutAmount")
          )
            w.uint32(10).string(m.tokenOutAmount);
          return w;
        };
        MsgSwapExactAmountInResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountInResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse();
          if (d.tokenOutAmount != null) {
            m.tokenOutAmount = String(d.tokenOutAmount);
          }
          return m;
        };
        MsgSwapExactAmountInResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenOutAmount = "";
          }
          if (m.tokenOutAmount != null && m.hasOwnProperty("tokenOutAmount")) {
            d.tokenOutAmount = m.tokenOutAmount;
          }
          return d;
        };
        MsgSwapExactAmountInResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountInResponse;
      })();
      v1beta1.MsgSplitRouteSwapExactAmountIn = (function () {
        function MsgSplitRouteSwapExactAmountIn(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSplitRouteSwapExactAmountIn.prototype.sender = "";
        MsgSplitRouteSwapExactAmountIn.prototype.routes = $util.emptyArray;
        MsgSplitRouteSwapExactAmountIn.prototype.tokenInDenom = "";
        MsgSplitRouteSwapExactAmountIn.prototype.tokenOutMinAmount = "";
        MsgSplitRouteSwapExactAmountIn.create = function create(properties) {
          return new MsgSplitRouteSwapExactAmountIn(properties);
        };
        MsgSplitRouteSwapExactAmountIn.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (
            m.tokenInDenom != null &&
            Object.hasOwnProperty.call(m, "tokenInDenom")
          )
            w.uint32(26).string(m.tokenInDenom);
          if (
            m.tokenOutMinAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutMinAmount")
          )
            w.uint32(34).string(m.tokenOutMinAmount);
          return w;
        };
        MsgSplitRouteSwapExactAmountIn.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenInDenom = r.string();
                break;
              case 4:
                m.tokenOutMinAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountIn.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenInDenom != null) {
            m.tokenInDenom = String(d.tokenInDenom);
          }
          if (d.tokenOutMinAmount != null) {
            m.tokenOutMinAmount = String(d.tokenOutMinAmount);
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountIn.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenInDenom = "";
            d.tokenOutMinAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (m.tokenInDenom != null && m.hasOwnProperty("tokenInDenom")) {
            d.tokenInDenom = m.tokenInDenom;
          }
          if (
            m.tokenOutMinAmount != null &&
            m.hasOwnProperty("tokenOutMinAmount")
          ) {
            d.tokenOutMinAmount = m.tokenOutMinAmount;
          }
          return d;
        };
        MsgSplitRouteSwapExactAmountIn.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSplitRouteSwapExactAmountIn;
      })();
      v1beta1.MsgSplitRouteSwapExactAmountInResponse = (function () {
        function MsgSplitRouteSwapExactAmountInResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSplitRouteSwapExactAmountInResponse.prototype.tokenOutAmount = "";
        MsgSplitRouteSwapExactAmountInResponse.create = function create(
          properties
        ) {
          return new MsgSplitRouteSwapExactAmountInResponse(properties);
        };
        MsgSplitRouteSwapExactAmountInResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenOutAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutAmount")
          )
            w.uint32(10).string(m.tokenOutAmount);
          return w;
        };
        MsgSplitRouteSwapExactAmountInResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountInResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountInResponse.fromObject = function fromObject(
          d
        ) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1
              .MsgSplitRouteSwapExactAmountInResponse
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountInResponse();
          if (d.tokenOutAmount != null) {
            m.tokenOutAmount = String(d.tokenOutAmount);
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountInResponse.toObject = function toObject(
          m,
          o
        ) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenOutAmount = "";
          }
          if (m.tokenOutAmount != null && m.hasOwnProperty("tokenOutAmount")) {
            d.tokenOutAmount = m.tokenOutAmount;
          }
          return d;
        };
        MsgSplitRouteSwapExactAmountInResponse.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgSplitRouteSwapExactAmountInResponse;
      })();
      v1beta1.MsgSwapExactAmountOut = (function () {
        function MsgSwapExactAmountOut(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountOut.prototype.sender = "";
        MsgSwapExactAmountOut.prototype.routes = $util.emptyArray;
        MsgSwapExactAmountOut.prototype.tokenInMaxAmount = "";
        MsgSwapExactAmountOut.prototype.tokenOut = null;
        MsgSwapExactAmountOut.create = function create(properties) {
          return new MsgSwapExactAmountOut(properties);
        };
        MsgSwapExactAmountOut.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (
            m.tokenInMaxAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInMaxAmount")
          )
            w.uint32(26).string(m.tokenInMaxAmount);
          if (m.tokenOut != null && Object.hasOwnProperty.call(m, "tokenOut"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenOut,
              w.uint32(34).fork()
            ).ldelim();
          return w;
        };
        MsgSwapExactAmountOut.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenInMaxAmount = r.string();
                break;
              case 4:
                m.tokenOut = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountOut.fromObject = function fromObject(d) {
          if (
            d instanceof $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut
          )
            return d;
          var m = new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenInMaxAmount != null) {
            m.tokenInMaxAmount = String(d.tokenInMaxAmount);
          }
          if (d.tokenOut != null) {
            if (typeof d.tokenOut !== "object")
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut.tokenOut: object expected"
              );
            m.tokenOut = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenOut);
          }
          return m;
        };
        MsgSwapExactAmountOut.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenInMaxAmount = "";
            d.tokenOut = null;
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (
            m.tokenInMaxAmount != null &&
            m.hasOwnProperty("tokenInMaxAmount")
          ) {
            d.tokenInMaxAmount = m.tokenInMaxAmount;
          }
          if (m.tokenOut != null && m.hasOwnProperty("tokenOut")) {
            d.tokenOut = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOut, o);
          }
          return d;
        };
        MsgSwapExactAmountOut.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountOut;
      })();
      v1beta1.MsgSwapExactAmountOutResponse = (function () {
        function MsgSwapExactAmountOutResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountOutResponse.prototype.tokenInAmount = "";
        MsgSwapExactAmountOutResponse.create = function create(properties) {
          return new MsgSwapExactAmountOutResponse(properties);
        };
        MsgSwapExactAmountOutResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenInAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInAmount")
          )
            w.uint32(10).string(m.tokenInAmount);
          return w;
        };
        MsgSwapExactAmountOutResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountOutResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse();
          if (d.tokenInAmount != null) {
            m.tokenInAmount = String(d.tokenInAmount);
          }
          return m;
        };
        MsgSwapExactAmountOutResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenInAmount = "";
          }
          if (m.tokenInAmount != null && m.hasOwnProperty("tokenInAmount")) {
            d.tokenInAmount = m.tokenInAmount;
          }
          return d;
        };
        MsgSwapExactAmountOutResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountOutResponse;
      })();
      v1beta1.MsgSplitRouteSwapExactAmountOut = (function () {
        function MsgSplitRouteSwapExactAmountOut(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSplitRouteSwapExactAmountOut.prototype.sender = "";
        MsgSplitRouteSwapExactAmountOut.prototype.routes = $util.emptyArray;
        MsgSplitRouteSwapExactAmountOut.prototype.tokenOutDenom = "";
        MsgSplitRouteSwapExactAmountOut.prototype.tokenInMaxAmount = "";
        MsgSplitRouteSwapExactAmountOut.create = function create(properties) {
          return new MsgSplitRouteSwapExactAmountOut(properties);
        };
        MsgSplitRouteSwapExactAmountOut.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (
            m.tokenOutDenom != null &&
            Object.hasOwnProperty.call(m, "tokenOutDenom")
          )
            w.uint32(26).string(m.tokenOutDenom);
          if (
            m.tokenInMaxAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInMaxAmount")
          )
            w.uint32(34).string(m.tokenInMaxAmount);
          return w;
        };
        MsgSplitRouteSwapExactAmountOut.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenOutDenom = r.string();
                break;
              case 4:
                m.tokenInMaxAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountOut.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenOutDenom != null) {
            m.tokenOutDenom = String(d.tokenOutDenom);
          }
          if (d.tokenInMaxAmount != null) {
            m.tokenInMaxAmount = String(d.tokenInMaxAmount);
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountOut.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenOutDenom = "";
            d.tokenInMaxAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (m.tokenOutDenom != null && m.hasOwnProperty("tokenOutDenom")) {
            d.tokenOutDenom = m.tokenOutDenom;
          }
          if (
            m.tokenInMaxAmount != null &&
            m.hasOwnProperty("tokenInMaxAmount")
          ) {
            d.tokenInMaxAmount = m.tokenInMaxAmount;
          }
          return d;
        };
        MsgSplitRouteSwapExactAmountOut.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSplitRouteSwapExactAmountOut;
      })();
      v1beta1.MsgSplitRouteSwapExactAmountOutResponse = (function () {
        function MsgSplitRouteSwapExactAmountOutResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSplitRouteSwapExactAmountOutResponse.prototype.tokenInAmount = "";
        MsgSplitRouteSwapExactAmountOutResponse.create = function create(
          properties
        ) {
          return new MsgSplitRouteSwapExactAmountOutResponse(properties);
        };
        MsgSplitRouteSwapExactAmountOutResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenInAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInAmount")
          )
            w.uint32(10).string(m.tokenInAmount);
          return w;
        };
        MsgSplitRouteSwapExactAmountOutResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOutResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSplitRouteSwapExactAmountOutResponse.fromObject =
          function fromObject(d) {
            if (
              d instanceof
              $root.osmosis.poolmanager.v1beta1
                .MsgSplitRouteSwapExactAmountOutResponse
            )
              return d;
            var m =
              new $root.osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOutResponse();
            if (d.tokenInAmount != null) {
              m.tokenInAmount = String(d.tokenInAmount);
            }
            return m;
          };
        MsgSplitRouteSwapExactAmountOutResponse.toObject = function toObject(
          m,
          o
        ) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenInAmount = "";
          }
          if (m.tokenInAmount != null && m.hasOwnProperty("tokenInAmount")) {
            d.tokenInAmount = m.tokenInAmount;
          }
          return d;
        };
        MsgSplitRouteSwapExactAmountOutResponse.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgSplitRouteSwapExactAmountOutResponse;
      })();
      v1beta1.SwapAmountInRoute = (function () {
        function SwapAmountInRoute(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SwapAmountInRoute.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SwapAmountInRoute.prototype.tokenOutDenom = "";
        SwapAmountInRoute.create = function create(properties) {
          return new SwapAmountInRoute(properties);
        };
        SwapAmountInRoute.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          if (
            m.tokenOutDenom != null &&
            Object.hasOwnProperty.call(m, "tokenOutDenom")
          )
            w.uint32(18).string(m.tokenOutDenom);
          return w;
        };
        SwapAmountInRoute.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              case 2:
                m.tokenOutDenom = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SwapAmountInRoute.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute)
            return d;
          var m = new $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenOutDenom != null) {
            m.tokenOutDenom = String(d.tokenOutDenom);
          }
          return m;
        };
        SwapAmountInRoute.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenOutDenom = "";
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenOutDenom != null && m.hasOwnProperty("tokenOutDenom")) {
            d.tokenOutDenom = m.tokenOutDenom;
          }
          return d;
        };
        SwapAmountInRoute.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SwapAmountInRoute;
      })();
      v1beta1.SwapAmountOutRoute = (function () {
        function SwapAmountOutRoute(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SwapAmountOutRoute.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SwapAmountOutRoute.prototype.tokenInDenom = "";
        SwapAmountOutRoute.create = function create(properties) {
          return new SwapAmountOutRoute(properties);
        };
        SwapAmountOutRoute.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          if (
            m.tokenInDenom != null &&
            Object.hasOwnProperty.call(m, "tokenInDenom")
          )
            w.uint32(18).string(m.tokenInDenom);
          return w;
        };
        SwapAmountOutRoute.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              case 2:
                m.tokenInDenom = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SwapAmountOutRoute.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute)
            return d;
          var m = new $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenInDenom != null) {
            m.tokenInDenom = String(d.tokenInDenom);
          }
          return m;
        };
        SwapAmountOutRoute.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenInDenom = "";
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenInDenom != null && m.hasOwnProperty("tokenInDenom")) {
            d.tokenInDenom = m.tokenInDenom;
          }
          return d;
        };
        SwapAmountOutRoute.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SwapAmountOutRoute;
      })();
      v1beta1.SwapAmountInSplitRoute = (function () {
        function SwapAmountInSplitRoute(p) {
          this.pools = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SwapAmountInSplitRoute.prototype.pools = $util.emptyArray;
        SwapAmountInSplitRoute.prototype.tokenInAmount = "";
        SwapAmountInSplitRoute.create = function create(properties) {
          return new SwapAmountInSplitRoute(properties);
        };
        SwapAmountInSplitRoute.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.pools != null && m.pools.length) {
            for (var i = 0; i < m.pools.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.encode(
                m.pools[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.tokenInAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInAmount")
          )
            w.uint32(18).string(m.tokenInAmount);
          return w;
        };
        SwapAmountInSplitRoute.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.pools && m.pools.length)) m.pools = [];
                m.pools.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 2:
                m.tokenInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SwapAmountInSplitRoute.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute();
          if (d.pools) {
            if (!Array.isArray(d.pools))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.pools: array expected"
              );
            m.pools = [];
            for (var i = 0; i < d.pools.length; ++i) {
              if (typeof d.pools[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.SwapAmountInSplitRoute.pools: object expected"
                );
              m.pools[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.fromObject(
                  d.pools[i]
                );
            }
          }
          if (d.tokenInAmount != null) {
            m.tokenInAmount = String(d.tokenInAmount);
          }
          return m;
        };
        SwapAmountInSplitRoute.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.pools = [];
          }
          if (o.defaults) {
            d.tokenInAmount = "";
          }
          if (m.pools && m.pools.length) {
            d.pools = [];
            for (var j = 0; j < m.pools.length; ++j) {
              d.pools[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.toObject(
                  m.pools[j],
                  o
                );
            }
          }
          if (m.tokenInAmount != null && m.hasOwnProperty("tokenInAmount")) {
            d.tokenInAmount = m.tokenInAmount;
          }
          return d;
        };
        SwapAmountInSplitRoute.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SwapAmountInSplitRoute;
      })();
      v1beta1.SwapAmountOutSplitRoute = (function () {
        function SwapAmountOutSplitRoute(p) {
          this.pools = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SwapAmountOutSplitRoute.prototype.pools = $util.emptyArray;
        SwapAmountOutSplitRoute.prototype.tokenOutAmount = "";
        SwapAmountOutSplitRoute.create = function create(properties) {
          return new SwapAmountOutSplitRoute(properties);
        };
        SwapAmountOutSplitRoute.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.pools != null && m.pools.length) {
            for (var i = 0; i < m.pools.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.encode(
                m.pools[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.tokenOutAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutAmount")
          )
            w.uint32(18).string(m.tokenOutAmount);
          return w;
        };
        SwapAmountOutSplitRoute.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.pools && m.pools.length)) m.pools = [];
                m.pools.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 2:
                m.tokenOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SwapAmountOutSplitRoute.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute
          )
            return d;
          var m =
            new $root.osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute();
          if (d.pools) {
            if (!Array.isArray(d.pools))
              throw TypeError(
                ".osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.pools: array expected"
              );
            m.pools = [];
            for (var i = 0; i < d.pools.length; ++i) {
              if (typeof d.pools[i] !== "object")
                throw TypeError(
                  ".osmosis.poolmanager.v1beta1.SwapAmountOutSplitRoute.pools: object expected"
                );
              m.pools[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.fromObject(
                  d.pools[i]
                );
            }
          }
          if (d.tokenOutAmount != null) {
            m.tokenOutAmount = String(d.tokenOutAmount);
          }
          return m;
        };
        SwapAmountOutSplitRoute.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.pools = [];
          }
          if (o.defaults) {
            d.tokenOutAmount = "";
          }
          if (m.pools && m.pools.length) {
            d.pools = [];
            for (var j = 0; j < m.pools.length; ++j) {
              d.pools[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.toObject(
                  m.pools[j],
                  o
                );
            }
          }
          if (m.tokenOutAmount != null && m.hasOwnProperty("tokenOutAmount")) {
            d.tokenOutAmount = m.tokenOutAmount;
          }
          return d;
        };
        SwapAmountOutSplitRoute.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SwapAmountOutSplitRoute;
      })();
      return v1beta1;
    })();
    return poolmanager;
  })();
  osmosis.gamm = (function () {
    const gamm = {};
    gamm.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.joinPool = function joinPool(request, callback) {
            return this.rpcCall(
              joinPool,
              $root.osmosis.gamm.v1beta1.MsgJoinPool,
              $root.osmosis.gamm.v1beta1.MsgJoinPoolResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "JoinPool" }
        );
        Object.defineProperty(
          (Msg.prototype.exitPool = function exitPool(request, callback) {
            return this.rpcCall(
              exitPool,
              $root.osmosis.gamm.v1beta1.MsgExitPool,
              $root.osmosis.gamm.v1beta1.MsgExitPoolResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "ExitPool" }
        );
        Object.defineProperty(
          (Msg.prototype.swapExactAmountIn = function swapExactAmountIn(
            request,
            callback
          ) {
            return this.rpcCall(
              swapExactAmountIn,
              $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn,
              $root.osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "SwapExactAmountIn" }
        );
        Object.defineProperty(
          (Msg.prototype.swapExactAmountOut = function swapExactAmountOut(
            request,
            callback
          ) {
            return this.rpcCall(
              swapExactAmountOut,
              $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut,
              $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "SwapExactAmountOut" }
        );
        Object.defineProperty(
          (Msg.prototype.joinSwapExternAmountIn =
            function joinSwapExternAmountIn(request, callback) {
              return this.rpcCall(
                joinSwapExternAmountIn,
                $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn,
                $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse,
                request,
                callback
              );
            }),
          "name",
          { value: "JoinSwapExternAmountIn" }
        );
        Object.defineProperty(
          (Msg.prototype.joinSwapShareAmountOut =
            function joinSwapShareAmountOut(request, callback) {
              return this.rpcCall(
                joinSwapShareAmountOut,
                $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut,
                $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse,
                request,
                callback
              );
            }),
          "name",
          { value: "JoinSwapShareAmountOut" }
        );
        Object.defineProperty(
          (Msg.prototype.exitSwapExternAmountOut =
            function exitSwapExternAmountOut(request, callback) {
              return this.rpcCall(
                exitSwapExternAmountOut,
                $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut,
                $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse,
                request,
                callback
              );
            }),
          "name",
          { value: "ExitSwapExternAmountOut" }
        );
        Object.defineProperty(
          (Msg.prototype.exitSwapShareAmountIn = function exitSwapShareAmountIn(
            request,
            callback
          ) {
            return this.rpcCall(
              exitSwapShareAmountIn,
              $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn,
              $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "ExitSwapShareAmountIn" }
        );
        return Msg;
      })();
      v1beta1.MsgJoinPool = (function () {
        function MsgJoinPool(p) {
          this.tokenInMaxs = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinPool.prototype.sender = "";
        MsgJoinPool.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgJoinPool.prototype.shareOutAmount = "";
        MsgJoinPool.prototype.tokenInMaxs = $util.emptyArray;
        MsgJoinPool.create = function create(properties) {
          return new MsgJoinPool(properties);
        };
        MsgJoinPool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (
            m.shareOutAmount != null &&
            Object.hasOwnProperty.call(m, "shareOutAmount")
          )
            w.uint32(26).string(m.shareOutAmount);
          if (m.tokenInMaxs != null && m.tokenInMaxs.length) {
            for (var i = 0; i < m.tokenInMaxs.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.tokenInMaxs[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          return w;
        };
        MsgJoinPool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgJoinPool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.shareOutAmount = r.string();
                break;
              case 4:
                if (!(m.tokenInMaxs && m.tokenInMaxs.length))
                  m.tokenInMaxs = [];
                m.tokenInMaxs.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinPool.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinPool) return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgJoinPool();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.shareOutAmount != null) {
            m.shareOutAmount = String(d.shareOutAmount);
          }
          if (d.tokenInMaxs) {
            if (!Array.isArray(d.tokenInMaxs))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgJoinPool.tokenInMaxs: array expected"
              );
            m.tokenInMaxs = [];
            for (var i = 0; i < d.tokenInMaxs.length; ++i) {
              if (typeof d.tokenInMaxs[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgJoinPool.tokenInMaxs: object expected"
                );
              m.tokenInMaxs[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.tokenInMaxs[i]
              );
            }
          }
          return m;
        };
        MsgJoinPool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.tokenInMaxs = [];
          }
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.shareOutAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.shareOutAmount != null && m.hasOwnProperty("shareOutAmount")) {
            d.shareOutAmount = m.shareOutAmount;
          }
          if (m.tokenInMaxs && m.tokenInMaxs.length) {
            d.tokenInMaxs = [];
            for (var j = 0; j < m.tokenInMaxs.length; ++j) {
              d.tokenInMaxs[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.tokenInMaxs[j],
                o
              );
            }
          }
          return d;
        };
        MsgJoinPool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinPool;
      })();
      v1beta1.MsgJoinPoolResponse = (function () {
        function MsgJoinPoolResponse(p) {
          this.tokenIn = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinPoolResponse.prototype.shareOutAmount = "";
        MsgJoinPoolResponse.prototype.tokenIn = $util.emptyArray;
        MsgJoinPoolResponse.create = function create(properties) {
          return new MsgJoinPoolResponse(properties);
        };
        MsgJoinPoolResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.shareOutAmount != null &&
            Object.hasOwnProperty.call(m, "shareOutAmount")
          )
            w.uint32(10).string(m.shareOutAmount);
          if (m.tokenIn != null && m.tokenIn.length) {
            for (var i = 0; i < m.tokenIn.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.tokenIn[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        MsgJoinPoolResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgJoinPoolResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.shareOutAmount = r.string();
                break;
              case 2:
                if (!(m.tokenIn && m.tokenIn.length)) m.tokenIn = [];
                m.tokenIn.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinPoolResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinPoolResponse)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgJoinPoolResponse();
          if (d.shareOutAmount != null) {
            m.shareOutAmount = String(d.shareOutAmount);
          }
          if (d.tokenIn) {
            if (!Array.isArray(d.tokenIn))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgJoinPoolResponse.tokenIn: array expected"
              );
            m.tokenIn = [];
            for (var i = 0; i < d.tokenIn.length; ++i) {
              if (typeof d.tokenIn[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgJoinPoolResponse.tokenIn: object expected"
                );
              m.tokenIn[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.tokenIn[i]
              );
            }
          }
          return m;
        };
        MsgJoinPoolResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.tokenIn = [];
          }
          if (o.defaults) {
            d.shareOutAmount = "";
          }
          if (m.shareOutAmount != null && m.hasOwnProperty("shareOutAmount")) {
            d.shareOutAmount = m.shareOutAmount;
          }
          if (m.tokenIn && m.tokenIn.length) {
            d.tokenIn = [];
            for (var j = 0; j < m.tokenIn.length; ++j) {
              d.tokenIn[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.tokenIn[j],
                o
              );
            }
          }
          return d;
        };
        MsgJoinPoolResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinPoolResponse;
      })();
      v1beta1.MsgExitPool = (function () {
        function MsgExitPool(p) {
          this.tokenOutMins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitPool.prototype.sender = "";
        MsgExitPool.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgExitPool.prototype.shareInAmount = "";
        MsgExitPool.prototype.tokenOutMins = $util.emptyArray;
        MsgExitPool.create = function create(properties) {
          return new MsgExitPool(properties);
        };
        MsgExitPool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (
            m.shareInAmount != null &&
            Object.hasOwnProperty.call(m, "shareInAmount")
          )
            w.uint32(26).string(m.shareInAmount);
          if (m.tokenOutMins != null && m.tokenOutMins.length) {
            for (var i = 0; i < m.tokenOutMins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.tokenOutMins[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          return w;
        };
        MsgExitPool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgExitPool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.shareInAmount = r.string();
                break;
              case 4:
                if (!(m.tokenOutMins && m.tokenOutMins.length))
                  m.tokenOutMins = [];
                m.tokenOutMins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitPool.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgExitPool) return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgExitPool();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.shareInAmount != null) {
            m.shareInAmount = String(d.shareInAmount);
          }
          if (d.tokenOutMins) {
            if (!Array.isArray(d.tokenOutMins))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgExitPool.tokenOutMins: array expected"
              );
            m.tokenOutMins = [];
            for (var i = 0; i < d.tokenOutMins.length; ++i) {
              if (typeof d.tokenOutMins[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgExitPool.tokenOutMins: object expected"
                );
              m.tokenOutMins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.tokenOutMins[i]
              );
            }
          }
          return m;
        };
        MsgExitPool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.tokenOutMins = [];
          }
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.shareInAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.shareInAmount != null && m.hasOwnProperty("shareInAmount")) {
            d.shareInAmount = m.shareInAmount;
          }
          if (m.tokenOutMins && m.tokenOutMins.length) {
            d.tokenOutMins = [];
            for (var j = 0; j < m.tokenOutMins.length; ++j) {
              d.tokenOutMins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.tokenOutMins[j],
                o
              );
            }
          }
          return d;
        };
        MsgExitPool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExitPool;
      })();
      v1beta1.MsgExitPoolResponse = (function () {
        function MsgExitPoolResponse(p) {
          this.tokenOut = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitPoolResponse.prototype.tokenOut = $util.emptyArray;
        MsgExitPoolResponse.create = function create(properties) {
          return new MsgExitPoolResponse(properties);
        };
        MsgExitPoolResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.tokenOut != null && m.tokenOut.length) {
            for (var i = 0; i < m.tokenOut.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.tokenOut[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        MsgExitPoolResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgExitPoolResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.tokenOut && m.tokenOut.length)) m.tokenOut = [];
                m.tokenOut.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitPoolResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgExitPoolResponse)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgExitPoolResponse();
          if (d.tokenOut) {
            if (!Array.isArray(d.tokenOut))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgExitPoolResponse.tokenOut: array expected"
              );
            m.tokenOut = [];
            for (var i = 0; i < d.tokenOut.length; ++i) {
              if (typeof d.tokenOut[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgExitPoolResponse.tokenOut: object expected"
                );
              m.tokenOut[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.tokenOut[i]
              );
            }
          }
          return m;
        };
        MsgExitPoolResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.tokenOut = [];
          }
          if (m.tokenOut && m.tokenOut.length) {
            d.tokenOut = [];
            for (var j = 0; j < m.tokenOut.length; ++j) {
              d.tokenOut[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.tokenOut[j],
                o
              );
            }
          }
          return d;
        };
        MsgExitPoolResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExitPoolResponse;
      })();
      v1beta1.MsgSwapExactAmountIn = (function () {
        function MsgSwapExactAmountIn(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountIn.prototype.sender = "";
        MsgSwapExactAmountIn.prototype.routes = $util.emptyArray;
        MsgSwapExactAmountIn.prototype.tokenIn = null;
        MsgSwapExactAmountIn.prototype.tokenOutMinAmount = "";
        MsgSwapExactAmountIn.create = function create(properties) {
          return new MsgSwapExactAmountIn(properties);
        };
        MsgSwapExactAmountIn.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.tokenIn != null && Object.hasOwnProperty.call(m, "tokenIn"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenIn,
              w.uint32(26).fork()
            ).ldelim();
          if (
            m.tokenOutMinAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutMinAmount")
          )
            w.uint32(34).string(m.tokenOutMinAmount);
          return w;
        };
        MsgSwapExactAmountIn.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenIn = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.tokenOutMinAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountIn.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgSwapExactAmountIn.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgSwapExactAmountIn.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenIn != null) {
            if (typeof d.tokenIn !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgSwapExactAmountIn.tokenIn: object expected"
              );
            m.tokenIn = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenIn);
          }
          if (d.tokenOutMinAmount != null) {
            m.tokenOutMinAmount = String(d.tokenOutMinAmount);
          }
          return m;
        };
        MsgSwapExactAmountIn.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenIn = null;
            d.tokenOutMinAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountInRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (m.tokenIn != null && m.hasOwnProperty("tokenIn")) {
            d.tokenIn = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenIn, o);
          }
          if (
            m.tokenOutMinAmount != null &&
            m.hasOwnProperty("tokenOutMinAmount")
          ) {
            d.tokenOutMinAmount = m.tokenOutMinAmount;
          }
          return d;
        };
        MsgSwapExactAmountIn.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountIn;
      })();
      v1beta1.MsgSwapExactAmountInResponse = (function () {
        function MsgSwapExactAmountInResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountInResponse.prototype.tokenOutAmount = "";
        MsgSwapExactAmountInResponse.create = function create(properties) {
          return new MsgSwapExactAmountInResponse(properties);
        };
        MsgSwapExactAmountInResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenOutAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutAmount")
          )
            w.uint32(10).string(m.tokenOutAmount);
          return w;
        };
        MsgSwapExactAmountInResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountInResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse
          )
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse();
          if (d.tokenOutAmount != null) {
            m.tokenOutAmount = String(d.tokenOutAmount);
          }
          return m;
        };
        MsgSwapExactAmountInResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenOutAmount = "";
          }
          if (m.tokenOutAmount != null && m.hasOwnProperty("tokenOutAmount")) {
            d.tokenOutAmount = m.tokenOutAmount;
          }
          return d;
        };
        MsgSwapExactAmountInResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountInResponse;
      })();
      v1beta1.MsgSwapExactAmountOut = (function () {
        function MsgSwapExactAmountOut(p) {
          this.routes = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountOut.prototype.sender = "";
        MsgSwapExactAmountOut.prototype.routes = $util.emptyArray;
        MsgSwapExactAmountOut.prototype.tokenInMaxAmount = "";
        MsgSwapExactAmountOut.prototype.tokenOut = null;
        MsgSwapExactAmountOut.create = function create(properties) {
          return new MsgSwapExactAmountOut(properties);
        };
        MsgSwapExactAmountOut.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.routes != null && m.routes.length) {
            for (var i = 0; i < m.routes.length; ++i)
              $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.encode(
                m.routes[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (
            m.tokenInMaxAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInMaxAmount")
          )
            w.uint32(26).string(m.tokenInMaxAmount);
          if (m.tokenOut != null && Object.hasOwnProperty.call(m, "tokenOut"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenOut,
              w.uint32(34).fork()
            ).ldelim();
          return w;
        };
        MsgSwapExactAmountOut.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                if (!(m.routes && m.routes.length)) m.routes = [];
                m.routes.push(
                  $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              case 3:
                m.tokenInMaxAmount = r.string();
                break;
              case 4:
                m.tokenOut = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountOut.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.routes) {
            if (!Array.isArray(d.routes))
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgSwapExactAmountOut.routes: array expected"
              );
            m.routes = [];
            for (var i = 0; i < d.routes.length; ++i) {
              if (typeof d.routes[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.MsgSwapExactAmountOut.routes: object expected"
                );
              m.routes[i] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.fromObject(
                  d.routes[i]
                );
            }
          }
          if (d.tokenInMaxAmount != null) {
            m.tokenInMaxAmount = String(d.tokenInMaxAmount);
          }
          if (d.tokenOut != null) {
            if (typeof d.tokenOut !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgSwapExactAmountOut.tokenOut: object expected"
              );
            m.tokenOut = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenOut);
          }
          return m;
        };
        MsgSwapExactAmountOut.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.routes = [];
          }
          if (o.defaults) {
            d.sender = "";
            d.tokenInMaxAmount = "";
            d.tokenOut = null;
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.routes && m.routes.length) {
            d.routes = [];
            for (var j = 0; j < m.routes.length; ++j) {
              d.routes[j] =
                $root.osmosis.poolmanager.v1beta1.SwapAmountOutRoute.toObject(
                  m.routes[j],
                  o
                );
            }
          }
          if (
            m.tokenInMaxAmount != null &&
            m.hasOwnProperty("tokenInMaxAmount")
          ) {
            d.tokenInMaxAmount = m.tokenInMaxAmount;
          }
          if (m.tokenOut != null && m.hasOwnProperty("tokenOut")) {
            d.tokenOut = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOut, o);
          }
          return d;
        };
        MsgSwapExactAmountOut.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountOut;
      })();
      v1beta1.MsgSwapExactAmountOutResponse = (function () {
        function MsgSwapExactAmountOutResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSwapExactAmountOutResponse.prototype.tokenInAmount = "";
        MsgSwapExactAmountOutResponse.create = function create(properties) {
          return new MsgSwapExactAmountOutResponse(properties);
        };
        MsgSwapExactAmountOutResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenInAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInAmount")
          )
            w.uint32(10).string(m.tokenInAmount);
          return w;
        };
        MsgSwapExactAmountOutResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSwapExactAmountOutResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse
          )
            return d;
          var m =
            new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse();
          if (d.tokenInAmount != null) {
            m.tokenInAmount = String(d.tokenInAmount);
          }
          return m;
        };
        MsgSwapExactAmountOutResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenInAmount = "";
          }
          if (m.tokenInAmount != null && m.hasOwnProperty("tokenInAmount")) {
            d.tokenInAmount = m.tokenInAmount;
          }
          return d;
        };
        MsgSwapExactAmountOutResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSwapExactAmountOutResponse;
      })();
      v1beta1.MsgJoinSwapExternAmountIn = (function () {
        function MsgJoinSwapExternAmountIn(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinSwapExternAmountIn.prototype.sender = "";
        MsgJoinSwapExternAmountIn.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgJoinSwapExternAmountIn.prototype.tokenIn = null;
        MsgJoinSwapExternAmountIn.prototype.shareOutMinAmount = "";
        MsgJoinSwapExternAmountIn.create = function create(properties) {
          return new MsgJoinSwapExternAmountIn(properties);
        };
        MsgJoinSwapExternAmountIn.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (m.tokenIn != null && Object.hasOwnProperty.call(m, "tokenIn"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenIn,
              w.uint32(26).fork()
            ).ldelim();
          if (
            m.shareOutMinAmount != null &&
            Object.hasOwnProperty.call(m, "shareOutMinAmount")
          )
            w.uint32(34).string(m.shareOutMinAmount);
          return w;
        };
        MsgJoinSwapExternAmountIn.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.tokenIn = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.shareOutMinAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinSwapExternAmountIn.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenIn != null) {
            if (typeof d.tokenIn !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.tokenIn: object expected"
              );
            m.tokenIn = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenIn);
          }
          if (d.shareOutMinAmount != null) {
            m.shareOutMinAmount = String(d.shareOutMinAmount);
          }
          return m;
        };
        MsgJoinSwapExternAmountIn.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenIn = null;
            d.shareOutMinAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenIn != null && m.hasOwnProperty("tokenIn")) {
            d.tokenIn = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenIn, o);
          }
          if (
            m.shareOutMinAmount != null &&
            m.hasOwnProperty("shareOutMinAmount")
          ) {
            d.shareOutMinAmount = m.shareOutMinAmount;
          }
          return d;
        };
        MsgJoinSwapExternAmountIn.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinSwapExternAmountIn;
      })();
      v1beta1.MsgJoinSwapExternAmountInResponse = (function () {
        function MsgJoinSwapExternAmountInResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinSwapExternAmountInResponse.prototype.shareOutAmount = "";
        MsgJoinSwapExternAmountInResponse.create = function create(properties) {
          return new MsgJoinSwapExternAmountInResponse(properties);
        };
        MsgJoinSwapExternAmountInResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.shareOutAmount != null &&
            Object.hasOwnProperty.call(m, "shareOutAmount")
          )
            w.uint32(10).string(m.shareOutAmount);
          return w;
        };
        MsgJoinSwapExternAmountInResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.shareOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinSwapExternAmountInResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse
          )
            return d;
          var m =
            new $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse();
          if (d.shareOutAmount != null) {
            m.shareOutAmount = String(d.shareOutAmount);
          }
          return m;
        };
        MsgJoinSwapExternAmountInResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.shareOutAmount = "";
          }
          if (m.shareOutAmount != null && m.hasOwnProperty("shareOutAmount")) {
            d.shareOutAmount = m.shareOutAmount;
          }
          return d;
        };
        MsgJoinSwapExternAmountInResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinSwapExternAmountInResponse;
      })();
      v1beta1.MsgJoinSwapShareAmountOut = (function () {
        function MsgJoinSwapShareAmountOut(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinSwapShareAmountOut.prototype.sender = "";
        MsgJoinSwapShareAmountOut.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgJoinSwapShareAmountOut.prototype.tokenInDenom = "";
        MsgJoinSwapShareAmountOut.prototype.shareOutAmount = "";
        MsgJoinSwapShareAmountOut.prototype.tokenInMaxAmount = "";
        MsgJoinSwapShareAmountOut.create = function create(properties) {
          return new MsgJoinSwapShareAmountOut(properties);
        };
        MsgJoinSwapShareAmountOut.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (
            m.tokenInDenom != null &&
            Object.hasOwnProperty.call(m, "tokenInDenom")
          )
            w.uint32(26).string(m.tokenInDenom);
          if (
            m.shareOutAmount != null &&
            Object.hasOwnProperty.call(m, "shareOutAmount")
          )
            w.uint32(34).string(m.shareOutAmount);
          if (
            m.tokenInMaxAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInMaxAmount")
          )
            w.uint32(42).string(m.tokenInMaxAmount);
          return w;
        };
        MsgJoinSwapShareAmountOut.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.tokenInDenom = r.string();
                break;
              case 4:
                m.shareOutAmount = r.string();
                break;
              case 5:
                m.tokenInMaxAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinSwapShareAmountOut.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenInDenom != null) {
            m.tokenInDenom = String(d.tokenInDenom);
          }
          if (d.shareOutAmount != null) {
            m.shareOutAmount = String(d.shareOutAmount);
          }
          if (d.tokenInMaxAmount != null) {
            m.tokenInMaxAmount = String(d.tokenInMaxAmount);
          }
          return m;
        };
        MsgJoinSwapShareAmountOut.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenInDenom = "";
            d.shareOutAmount = "";
            d.tokenInMaxAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenInDenom != null && m.hasOwnProperty("tokenInDenom")) {
            d.tokenInDenom = m.tokenInDenom;
          }
          if (m.shareOutAmount != null && m.hasOwnProperty("shareOutAmount")) {
            d.shareOutAmount = m.shareOutAmount;
          }
          if (
            m.tokenInMaxAmount != null &&
            m.hasOwnProperty("tokenInMaxAmount")
          ) {
            d.tokenInMaxAmount = m.tokenInMaxAmount;
          }
          return d;
        };
        MsgJoinSwapShareAmountOut.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinSwapShareAmountOut;
      })();
      v1beta1.MsgJoinSwapShareAmountOutResponse = (function () {
        function MsgJoinSwapShareAmountOutResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgJoinSwapShareAmountOutResponse.prototype.tokenInAmount = "";
        MsgJoinSwapShareAmountOutResponse.create = function create(properties) {
          return new MsgJoinSwapShareAmountOutResponse(properties);
        };
        MsgJoinSwapShareAmountOutResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenInAmount != null &&
            Object.hasOwnProperty.call(m, "tokenInAmount")
          )
            w.uint32(10).string(m.tokenInAmount);
          return w;
        };
        MsgJoinSwapShareAmountOutResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgJoinSwapShareAmountOutResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse
          )
            return d;
          var m =
            new $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse();
          if (d.tokenInAmount != null) {
            m.tokenInAmount = String(d.tokenInAmount);
          }
          return m;
        };
        MsgJoinSwapShareAmountOutResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenInAmount = "";
          }
          if (m.tokenInAmount != null && m.hasOwnProperty("tokenInAmount")) {
            d.tokenInAmount = m.tokenInAmount;
          }
          return d;
        };
        MsgJoinSwapShareAmountOutResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgJoinSwapShareAmountOutResponse;
      })();
      v1beta1.MsgExitSwapShareAmountIn = (function () {
        function MsgExitSwapShareAmountIn(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitSwapShareAmountIn.prototype.sender = "";
        MsgExitSwapShareAmountIn.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgExitSwapShareAmountIn.prototype.tokenOutDenom = "";
        MsgExitSwapShareAmountIn.prototype.shareInAmount = "";
        MsgExitSwapShareAmountIn.prototype.tokenOutMinAmount = "";
        MsgExitSwapShareAmountIn.create = function create(properties) {
          return new MsgExitSwapShareAmountIn(properties);
        };
        MsgExitSwapShareAmountIn.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (
            m.tokenOutDenom != null &&
            Object.hasOwnProperty.call(m, "tokenOutDenom")
          )
            w.uint32(26).string(m.tokenOutDenom);
          if (
            m.shareInAmount != null &&
            Object.hasOwnProperty.call(m, "shareInAmount")
          )
            w.uint32(34).string(m.shareInAmount);
          if (
            m.tokenOutMinAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutMinAmount")
          )
            w.uint32(42).string(m.tokenOutMinAmount);
          return w;
        };
        MsgExitSwapShareAmountIn.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.tokenOutDenom = r.string();
                break;
              case 4:
                m.shareInAmount = r.string();
                break;
              case 5:
                m.tokenOutMinAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitSwapShareAmountIn.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenOutDenom != null) {
            m.tokenOutDenom = String(d.tokenOutDenom);
          }
          if (d.shareInAmount != null) {
            m.shareInAmount = String(d.shareInAmount);
          }
          if (d.tokenOutMinAmount != null) {
            m.tokenOutMinAmount = String(d.tokenOutMinAmount);
          }
          return m;
        };
        MsgExitSwapShareAmountIn.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenOutDenom = "";
            d.shareInAmount = "";
            d.tokenOutMinAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenOutDenom != null && m.hasOwnProperty("tokenOutDenom")) {
            d.tokenOutDenom = m.tokenOutDenom;
          }
          if (m.shareInAmount != null && m.hasOwnProperty("shareInAmount")) {
            d.shareInAmount = m.shareInAmount;
          }
          if (
            m.tokenOutMinAmount != null &&
            m.hasOwnProperty("tokenOutMinAmount")
          ) {
            d.tokenOutMinAmount = m.tokenOutMinAmount;
          }
          return d;
        };
        MsgExitSwapShareAmountIn.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExitSwapShareAmountIn;
      })();
      v1beta1.MsgExitSwapShareAmountInResponse = (function () {
        function MsgExitSwapShareAmountInResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitSwapShareAmountInResponse.prototype.tokenOutAmount = "";
        MsgExitSwapShareAmountInResponse.create = function create(properties) {
          return new MsgExitSwapShareAmountInResponse(properties);
        };
        MsgExitSwapShareAmountInResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.tokenOutAmount != null &&
            Object.hasOwnProperty.call(m, "tokenOutAmount")
          )
            w.uint32(10).string(m.tokenOutAmount);
          return w;
        };
        MsgExitSwapShareAmountInResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.tokenOutAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitSwapShareAmountInResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse
          )
            return d;
          var m =
            new $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse();
          if (d.tokenOutAmount != null) {
            m.tokenOutAmount = String(d.tokenOutAmount);
          }
          return m;
        };
        MsgExitSwapShareAmountInResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.tokenOutAmount = "";
          }
          if (m.tokenOutAmount != null && m.hasOwnProperty("tokenOutAmount")) {
            d.tokenOutAmount = m.tokenOutAmount;
          }
          return d;
        };
        MsgExitSwapShareAmountInResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExitSwapShareAmountInResponse;
      })();
      v1beta1.MsgExitSwapExternAmountOut = (function () {
        function MsgExitSwapExternAmountOut(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitSwapExternAmountOut.prototype.sender = "";
        MsgExitSwapExternAmountOut.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgExitSwapExternAmountOut.prototype.tokenOut = null;
        MsgExitSwapExternAmountOut.prototype.shareInMaxAmount = "";
        MsgExitSwapExternAmountOut.create = function create(properties) {
          return new MsgExitSwapExternAmountOut(properties);
        };
        MsgExitSwapExternAmountOut.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(16).uint64(m.poolId);
          if (m.tokenOut != null && Object.hasOwnProperty.call(m, "tokenOut"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenOut,
              w.uint32(26).fork()
            ).ldelim();
          if (
            m.shareInMaxAmount != null &&
            Object.hasOwnProperty.call(m, "shareInMaxAmount")
          )
            w.uint32(34).string(m.shareInMaxAmount);
          return w;
        };
        MsgExitSwapExternAmountOut.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.poolId = r.uint64();
                break;
              case 3:
                m.tokenOut = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.shareInMaxAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitSwapExternAmountOut.fromObject = function fromObject(d) {
          if (
            d instanceof $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut
          )
            return d;
          var m = new $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.tokenOut != null) {
            if (typeof d.tokenOut !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut.tokenOut: object expected"
              );
            m.tokenOut = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenOut);
          }
          if (d.shareInMaxAmount != null) {
            m.shareInMaxAmount = String(d.shareInMaxAmount);
          }
          return m;
        };
        MsgExitSwapExternAmountOut.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.tokenOut = null;
            d.shareInMaxAmount = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.tokenOut != null && m.hasOwnProperty("tokenOut")) {
            d.tokenOut = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOut, o);
          }
          if (
            m.shareInMaxAmount != null &&
            m.hasOwnProperty("shareInMaxAmount")
          ) {
            d.shareInMaxAmount = m.shareInMaxAmount;
          }
          return d;
        };
        MsgExitSwapExternAmountOut.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgExitSwapExternAmountOut;
      })();
      v1beta1.MsgExitSwapExternAmountOutResponse = (function () {
        function MsgExitSwapExternAmountOutResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgExitSwapExternAmountOutResponse.prototype.shareInAmount = "";
        MsgExitSwapExternAmountOutResponse.create = function create(
          properties
        ) {
          return new MsgExitSwapExternAmountOutResponse(properties);
        };
        MsgExitSwapExternAmountOutResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.shareInAmount != null &&
            Object.hasOwnProperty.call(m, "shareInAmount")
          )
            w.uint32(10).string(m.shareInAmount);
          return w;
        };
        MsgExitSwapExternAmountOutResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.shareInAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgExitSwapExternAmountOutResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse
          )
            return d;
          var m =
            new $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse();
          if (d.shareInAmount != null) {
            m.shareInAmount = String(d.shareInAmount);
          }
          return m;
        };
        MsgExitSwapExternAmountOutResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.shareInAmount = "";
          }
          if (m.shareInAmount != null && m.hasOwnProperty("shareInAmount")) {
            d.shareInAmount = m.shareInAmount;
          }
          return d;
        };
        MsgExitSwapExternAmountOutResponse.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgExitSwapExternAmountOutResponse;
      })();
      v1beta1.SmoothWeightChangeParams = (function () {
        function SmoothWeightChangeParams(p) {
          this.initialPoolWeights = [];
          this.targetPoolWeights = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SmoothWeightChangeParams.prototype.startTime = null;
        SmoothWeightChangeParams.prototype.duration = null;
        SmoothWeightChangeParams.prototype.initialPoolWeights =
          $util.emptyArray;
        SmoothWeightChangeParams.prototype.targetPoolWeights = $util.emptyArray;
        SmoothWeightChangeParams.create = function create(properties) {
          return new SmoothWeightChangeParams(properties);
        };
        SmoothWeightChangeParams.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.startTime != null && Object.hasOwnProperty.call(m, "startTime"))
            $root.google.protobuf.Timestamp.encode(
              m.startTime,
              w.uint32(10).fork()
            ).ldelim();
          if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
            $root.google.protobuf.Duration.encode(
              m.duration,
              w.uint32(18).fork()
            ).ldelim();
          if (m.initialPoolWeights != null && m.initialPoolWeights.length) {
            for (var i = 0; i < m.initialPoolWeights.length; ++i)
              $root.osmosis.gamm.v1beta1.PoolAsset.encode(
                m.initialPoolWeights[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          if (m.targetPoolWeights != null && m.targetPoolWeights.length) {
            for (var i = 0; i < m.targetPoolWeights.length; ++i)
              $root.osmosis.gamm.v1beta1.PoolAsset.encode(
                m.targetPoolWeights[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          return w;
        };
        SmoothWeightChangeParams.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.startTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.duration = $root.google.protobuf.Duration.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                if (!(m.initialPoolWeights && m.initialPoolWeights.length))
                  m.initialPoolWeights = [];
                m.initialPoolWeights.push(
                  $root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32())
                );
                break;
              case 4:
                if (!(m.targetPoolWeights && m.targetPoolWeights.length))
                  m.targetPoolWeights = [];
                m.targetPoolWeights.push(
                  $root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SmoothWeightChangeParams.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams)
            return d;
          var m = new $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams();
          if (d.startTime != null) {
            if (typeof d.startTime !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.startTime: object expected"
              );
            m.startTime = $root.google.protobuf.Timestamp.fromObject(
              d.startTime
            );
          }
          if (d.duration != null) {
            if (typeof d.duration !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.duration: object expected"
              );
            m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
          }
          if (d.initialPoolWeights) {
            if (!Array.isArray(d.initialPoolWeights))
              throw TypeError(
                ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.initialPoolWeights: array expected"
              );
            m.initialPoolWeights = [];
            for (var i = 0; i < d.initialPoolWeights.length; ++i) {
              if (typeof d.initialPoolWeights[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.initialPoolWeights: object expected"
                );
              m.initialPoolWeights[i] =
                $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(
                  d.initialPoolWeights[i]
                );
            }
          }
          if (d.targetPoolWeights) {
            if (!Array.isArray(d.targetPoolWeights))
              throw TypeError(
                ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.targetPoolWeights: array expected"
              );
            m.targetPoolWeights = [];
            for (var i = 0; i < d.targetPoolWeights.length; ++i) {
              if (typeof d.targetPoolWeights[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.SmoothWeightChangeParams.targetPoolWeights: object expected"
                );
              m.targetPoolWeights[i] =
                $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(
                  d.targetPoolWeights[i]
                );
            }
          }
          return m;
        };
        SmoothWeightChangeParams.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.initialPoolWeights = [];
            d.targetPoolWeights = [];
          }
          if (o.defaults) {
            d.startTime = null;
            d.duration = null;
          }
          if (m.startTime != null && m.hasOwnProperty("startTime")) {
            d.startTime = $root.google.protobuf.Timestamp.toObject(
              m.startTime,
              o
            );
          }
          if (m.duration != null && m.hasOwnProperty("duration")) {
            d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
          }
          if (m.initialPoolWeights && m.initialPoolWeights.length) {
            d.initialPoolWeights = [];
            for (var j = 0; j < m.initialPoolWeights.length; ++j) {
              d.initialPoolWeights[j] =
                $root.osmosis.gamm.v1beta1.PoolAsset.toObject(
                  m.initialPoolWeights[j],
                  o
                );
            }
          }
          if (m.targetPoolWeights && m.targetPoolWeights.length) {
            d.targetPoolWeights = [];
            for (var j = 0; j < m.targetPoolWeights.length; ++j) {
              d.targetPoolWeights[j] =
                $root.osmosis.gamm.v1beta1.PoolAsset.toObject(
                  m.targetPoolWeights[j],
                  o
                );
            }
          }
          return d;
        };
        SmoothWeightChangeParams.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SmoothWeightChangeParams;
      })();
      v1beta1.PoolParams = (function () {
        function PoolParams(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PoolParams.prototype.swapFee = "";
        PoolParams.prototype.exitFee = "";
        PoolParams.prototype.smoothWeightChangeParams = null;
        PoolParams.create = function create(properties) {
          return new PoolParams(properties);
        };
        PoolParams.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.swapFee != null && Object.hasOwnProperty.call(m, "swapFee"))
            w.uint32(10).string(m.swapFee);
          if (m.exitFee != null && Object.hasOwnProperty.call(m, "exitFee"))
            w.uint32(18).string(m.exitFee);
          if (
            m.smoothWeightChangeParams != null &&
            Object.hasOwnProperty.call(m, "smoothWeightChangeParams")
          )
            $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.encode(
              m.smoothWeightChangeParams,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        PoolParams.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.PoolParams();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.swapFee = r.string();
                break;
              case 2:
                m.exitFee = r.string();
                break;
              case 3:
                m.smoothWeightChangeParams =
                  $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.decode(
                    r,
                    r.uint32()
                  );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PoolParams.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.PoolParams) return d;
          var m = new $root.osmosis.gamm.v1beta1.PoolParams();
          if (d.swapFee != null) {
            m.swapFee = String(d.swapFee);
          }
          if (d.exitFee != null) {
            m.exitFee = String(d.exitFee);
          }
          if (d.smoothWeightChangeParams != null) {
            if (typeof d.smoothWeightChangeParams !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.PoolParams.smoothWeightChangeParams: object expected"
              );
            m.smoothWeightChangeParams =
              $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.fromObject(
                d.smoothWeightChangeParams
              );
          }
          return m;
        };
        PoolParams.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.swapFee = "";
            d.exitFee = "";
            d.smoothWeightChangeParams = null;
          }
          if (m.swapFee != null && m.hasOwnProperty("swapFee")) {
            d.swapFee = m.swapFee;
          }
          if (m.exitFee != null && m.hasOwnProperty("exitFee")) {
            d.exitFee = m.exitFee;
          }
          if (
            m.smoothWeightChangeParams != null &&
            m.hasOwnProperty("smoothWeightChangeParams")
          ) {
            d.smoothWeightChangeParams =
              $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.toObject(
                m.smoothWeightChangeParams,
                o
              );
          }
          return d;
        };
        PoolParams.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PoolParams;
      })();
      v1beta1.PoolAsset = (function () {
        function PoolAsset(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PoolAsset.prototype.token = null;
        PoolAsset.prototype.weight = "";
        PoolAsset.create = function create(properties) {
          return new PoolAsset(properties);
        };
        PoolAsset.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.token != null && Object.hasOwnProperty.call(m, "token"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.token,
              w.uint32(10).fork()
            ).ldelim();
          if (m.weight != null && Object.hasOwnProperty.call(m, "weight"))
            w.uint32(18).string(m.weight);
          return w;
        };
        PoolAsset.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.PoolAsset();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.token = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              case 2:
                m.weight = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PoolAsset.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.PoolAsset) return d;
          var m = new $root.osmosis.gamm.v1beta1.PoolAsset();
          if (d.token != null) {
            if (typeof d.token !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.PoolAsset.token: object expected"
              );
            m.token = $root.cosmos.base.v1beta1.Coin.fromObject(d.token);
          }
          if (d.weight != null) {
            m.weight = String(d.weight);
          }
          return m;
        };
        PoolAsset.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.token = null;
            d.weight = "";
          }
          if (m.token != null && m.hasOwnProperty("token")) {
            d.token = $root.cosmos.base.v1beta1.Coin.toObject(m.token, o);
          }
          if (m.weight != null && m.hasOwnProperty("weight")) {
            d.weight = m.weight;
          }
          return d;
        };
        PoolAsset.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PoolAsset;
      })();
      v1beta1.Pool = (function () {
        function Pool(p) {
          this.poolAssets = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Pool.prototype.address = "";
        Pool.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        Pool.prototype.poolParams = null;
        Pool.prototype.futurePoolGovernor = "";
        Pool.prototype.totalShares = null;
        Pool.prototype.poolAssets = $util.emptyArray;
        Pool.prototype.totalWeight = "";
        Pool.create = function create(properties) {
          return new Pool(properties);
        };
        Pool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.id != null && Object.hasOwnProperty.call(m, "id"))
            w.uint32(16).uint64(m.id);
          if (
            m.poolParams != null &&
            Object.hasOwnProperty.call(m, "poolParams")
          )
            $root.osmosis.gamm.v1beta1.PoolParams.encode(
              m.poolParams,
              w.uint32(26).fork()
            ).ldelim();
          if (
            m.futurePoolGovernor != null &&
            Object.hasOwnProperty.call(m, "futurePoolGovernor")
          )
            w.uint32(34).string(m.futurePoolGovernor);
          if (
            m.totalShares != null &&
            Object.hasOwnProperty.call(m, "totalShares")
          )
            $root.cosmos.base.v1beta1.Coin.encode(
              m.totalShares,
              w.uint32(42).fork()
            ).ldelim();
          if (m.poolAssets != null && m.poolAssets.length) {
            for (var i = 0; i < m.poolAssets.length; ++i)
              $root.osmosis.gamm.v1beta1.PoolAsset.encode(
                m.poolAssets[i],
                w.uint32(50).fork()
              ).ldelim();
          }
          if (
            m.totalWeight != null &&
            Object.hasOwnProperty.call(m, "totalWeight")
          )
            w.uint32(58).string(m.totalWeight);
          return w;
        };
        Pool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.gamm.v1beta1.Pool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.id = r.uint64();
                break;
              case 3:
                m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.futurePoolGovernor = r.string();
                break;
              case 5:
                m.totalShares = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 6:
                if (!(m.poolAssets && m.poolAssets.length)) m.poolAssets = [];
                m.poolAssets.push(
                  $root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32())
                );
                break;
              case 7:
                m.totalWeight = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Pool.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.gamm.v1beta1.Pool) return d;
          var m = new $root.osmosis.gamm.v1beta1.Pool();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.id != null) {
            if ($util.Long) (m.id = $util.Long.fromValue(d.id)).unsigned = true;
            else if (typeof d.id === "string") m.id = parseInt(d.id, 10);
            else if (typeof d.id === "number") m.id = d.id;
            else if (typeof d.id === "object")
              m.id = new $util.LongBits(
                d.id.low >>> 0,
                d.id.high >>> 0
              ).toNumber(true);
          }
          if (d.poolParams != null) {
            if (typeof d.poolParams !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.Pool.poolParams: object expected"
              );
            m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.fromObject(
              d.poolParams
            );
          }
          if (d.futurePoolGovernor != null) {
            m.futurePoolGovernor = String(d.futurePoolGovernor);
          }
          if (d.totalShares != null) {
            if (typeof d.totalShares !== "object")
              throw TypeError(
                ".osmosis.gamm.v1beta1.Pool.totalShares: object expected"
              );
            m.totalShares = $root.cosmos.base.v1beta1.Coin.fromObject(
              d.totalShares
            );
          }
          if (d.poolAssets) {
            if (!Array.isArray(d.poolAssets))
              throw TypeError(
                ".osmosis.gamm.v1beta1.Pool.poolAssets: array expected"
              );
            m.poolAssets = [];
            for (var i = 0; i < d.poolAssets.length; ++i) {
              if (typeof d.poolAssets[i] !== "object")
                throw TypeError(
                  ".osmosis.gamm.v1beta1.Pool.poolAssets: object expected"
                );
              m.poolAssets[i] = $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(
                d.poolAssets[i]
              );
            }
          }
          if (d.totalWeight != null) {
            m.totalWeight = String(d.totalWeight);
          }
          return m;
        };
        Pool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.poolAssets = [];
          }
          if (o.defaults) {
            d.address = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.id =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.id = o.longs === String ? "0" : 0;
            d.poolParams = null;
            d.futurePoolGovernor = "";
            d.totalShares = null;
            d.totalWeight = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.id != null && m.hasOwnProperty("id")) {
            if (typeof m.id === "number")
              d.id = o.longs === String ? String(m.id) : m.id;
            else
              d.id =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.id)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.id.low >>> 0,
                      m.id.high >>> 0
                    ).toNumber(true)
                  : m.id;
          }
          if (m.poolParams != null && m.hasOwnProperty("poolParams")) {
            d.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.toObject(
              m.poolParams,
              o
            );
          }
          if (
            m.futurePoolGovernor != null &&
            m.hasOwnProperty("futurePoolGovernor")
          ) {
            d.futurePoolGovernor = m.futurePoolGovernor;
          }
          if (m.totalShares != null && m.hasOwnProperty("totalShares")) {
            d.totalShares = $root.cosmos.base.v1beta1.Coin.toObject(
              m.totalShares,
              o
            );
          }
          if (m.poolAssets && m.poolAssets.length) {
            d.poolAssets = [];
            for (var j = 0; j < m.poolAssets.length; ++j) {
              d.poolAssets[j] = $root.osmosis.gamm.v1beta1.PoolAsset.toObject(
                m.poolAssets[j],
                o
              );
            }
          }
          if (m.totalWeight != null && m.hasOwnProperty("totalWeight")) {
            d.totalWeight = m.totalWeight;
          }
          return d;
        };
        Pool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Pool;
      })();
      return v1beta1;
    })();
    gamm.poolmodels = (function () {
      const poolmodels = {};
      poolmodels.balancer = (function () {
        const balancer = {};
        balancer.v1beta1 = (function () {
          const v1beta1 = {};
          v1beta1.Msg = (function () {
            function Msg(rpcImpl, requestDelimited, responseDelimited) {
              $protobuf.rpc.Service.call(
                this,
                rpcImpl,
                requestDelimited,
                responseDelimited
              );
            }
            (Msg.prototype = Object.create(
              $protobuf.rpc.Service.prototype
            )).constructor = Msg;
            Msg.create = function create(
              rpcImpl,
              requestDelimited,
              responseDelimited
            ) {
              return new this(rpcImpl, requestDelimited, responseDelimited);
            };
            Object.defineProperty(
              (Msg.prototype.createBalancerPool = function createBalancerPool(
                request,
                callback
              ) {
                return this.rpcCall(
                  createBalancerPool,
                  $root.osmosis.gamm.poolmodels.balancer.v1beta1
                    .MsgCreateBalancerPool,
                  $root.osmosis.gamm.poolmodels.balancer.v1beta1
                    .MsgCreateBalancerPoolResponse,
                  request,
                  callback
                );
              }),
              "name",
              { value: "CreateBalancerPool" }
            );
            Object.defineProperty(
              (Msg.prototype.migrateSharesToFullRangeConcentratedPosition =
                function migrateSharesToFullRangeConcentratedPosition(
                  request,
                  callback
                ) {
                  return this.rpcCall(
                    migrateSharesToFullRangeConcentratedPosition,
                    $root.osmosis.gamm.poolmodels.balancer.v1beta1
                      .MsgMigrateSharesToFullRangeConcentratedPosition,
                    $root.osmosis.gamm.poolmodels.balancer.v1beta1
                      .MsgMigrateSharesToFullRangeConcentratedPositionResponse,
                    request,
                    callback
                  );
                }),
              "name",
              { value: "MigrateSharesToFullRangeConcentratedPosition" }
            );
            return Msg;
          })();
          v1beta1.MsgCreateBalancerPool = (function () {
            function MsgCreateBalancerPool(p) {
              this.poolAssets = [];
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgCreateBalancerPool.prototype.sender = "";
            MsgCreateBalancerPool.prototype.poolParams = null;
            MsgCreateBalancerPool.prototype.poolAssets = $util.emptyArray;
            MsgCreateBalancerPool.prototype.futurePoolGovernor = "";
            MsgCreateBalancerPool.create = function create(properties) {
              return new MsgCreateBalancerPool(properties);
            };
            MsgCreateBalancerPool.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                w.uint32(10).string(m.sender);
              if (
                m.poolParams != null &&
                Object.hasOwnProperty.call(m, "poolParams")
              )
                $root.osmosis.gamm.v1beta1.PoolParams.encode(
                  m.poolParams,
                  w.uint32(18).fork()
                ).ldelim();
              if (m.poolAssets != null && m.poolAssets.length) {
                for (var i = 0; i < m.poolAssets.length; ++i)
                  $root.osmosis.gamm.v1beta1.PoolAsset.encode(
                    m.poolAssets[i],
                    w.uint32(26).fork()
                  ).ldelim();
              }
              if (
                m.futurePoolGovernor != null &&
                Object.hasOwnProperty.call(m, "futurePoolGovernor")
              )
                w.uint32(34).string(m.futurePoolGovernor);
              return w;
            };
            MsgCreateBalancerPool.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.sender = r.string();
                    break;
                  case 2:
                    m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  case 3:
                    if (!(m.poolAssets && m.poolAssets.length))
                      m.poolAssets = [];
                    m.poolAssets.push(
                      $root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32())
                    );
                    break;
                  case 4:
                    m.futurePoolGovernor = r.string();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgCreateBalancerPool.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.balancer.v1beta1
                  .MsgCreateBalancerPool
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool();
              if (d.sender != null) {
                m.sender = String(d.sender);
              }
              if (d.poolParams != null) {
                if (typeof d.poolParams !== "object")
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool.poolParams: object expected"
                  );
                m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.fromObject(
                  d.poolParams
                );
              }
              if (d.poolAssets) {
                if (!Array.isArray(d.poolAssets))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool.poolAssets: array expected"
                  );
                m.poolAssets = [];
                for (var i = 0; i < d.poolAssets.length; ++i) {
                  if (typeof d.poolAssets[i] !== "object")
                    throw TypeError(
                      ".osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool.poolAssets: object expected"
                    );
                  m.poolAssets[i] =
                    $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(
                      d.poolAssets[i]
                    );
                }
              }
              if (d.futurePoolGovernor != null) {
                m.futurePoolGovernor = String(d.futurePoolGovernor);
              }
              return m;
            };
            MsgCreateBalancerPool.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.arrays || o.defaults) {
                d.poolAssets = [];
              }
              if (o.defaults) {
                d.sender = "";
                d.poolParams = null;
                d.futurePoolGovernor = "";
              }
              if (m.sender != null && m.hasOwnProperty("sender")) {
                d.sender = m.sender;
              }
              if (m.poolParams != null && m.hasOwnProperty("poolParams")) {
                d.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.toObject(
                  m.poolParams,
                  o
                );
              }
              if (m.poolAssets && m.poolAssets.length) {
                d.poolAssets = [];
                for (var j = 0; j < m.poolAssets.length; ++j) {
                  d.poolAssets[j] =
                    $root.osmosis.gamm.v1beta1.PoolAsset.toObject(
                      m.poolAssets[j],
                      o
                    );
                }
              }
              if (
                m.futurePoolGovernor != null &&
                m.hasOwnProperty("futurePoolGovernor")
              ) {
                d.futurePoolGovernor = m.futurePoolGovernor;
              }
              return d;
            };
            MsgCreateBalancerPool.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            return MsgCreateBalancerPool;
          })();
          v1beta1.MsgCreateBalancerPoolResponse = (function () {
            function MsgCreateBalancerPoolResponse(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgCreateBalancerPoolResponse.prototype.poolId = $util.Long
              ? $util.Long.fromBits(0, 0, true)
              : 0;
            MsgCreateBalancerPoolResponse.create = function create(properties) {
              return new MsgCreateBalancerPoolResponse(properties);
            };
            MsgCreateBalancerPoolResponse.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
                w.uint32(8).uint64(m.poolId);
              return w;
            };
            MsgCreateBalancerPoolResponse.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.poolId = r.uint64();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgCreateBalancerPoolResponse.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.balancer.v1beta1
                  .MsgCreateBalancerPoolResponse
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse();
              if (d.poolId != null) {
                if ($util.Long)
                  (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
                else if (typeof d.poolId === "string")
                  m.poolId = parseInt(d.poolId, 10);
                else if (typeof d.poolId === "number") m.poolId = d.poolId;
                else if (typeof d.poolId === "object")
                  m.poolId = new $util.LongBits(
                    d.poolId.low >>> 0,
                    d.poolId.high >>> 0
                  ).toNumber(true);
              }
              return m;
            };
            MsgCreateBalancerPoolResponse.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.defaults) {
                if ($util.Long) {
                  var n = new $util.Long(0, 0, true);
                  d.poolId =
                    o.longs === String
                      ? n.toString()
                      : o.longs === Number
                      ? n.toNumber()
                      : n;
                } else d.poolId = o.longs === String ? "0" : 0;
              }
              if (m.poolId != null && m.hasOwnProperty("poolId")) {
                if (typeof m.poolId === "number")
                  d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
                else
                  d.poolId =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.poolId)
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.poolId.low >>> 0,
                          m.poolId.high >>> 0
                        ).toNumber(true)
                      : m.poolId;
              }
              return d;
            };
            MsgCreateBalancerPoolResponse.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            return MsgCreateBalancerPoolResponse;
          })();
          v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition =
            (function () {
              function MsgMigrateSharesToFullRangeConcentratedPosition(p) {
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              MsgMigrateSharesToFullRangeConcentratedPosition.prototype.sender =
                "";
              MsgMigrateSharesToFullRangeConcentratedPosition.prototype.sharesToMigrate =
                null;
              MsgMigrateSharesToFullRangeConcentratedPosition.create =
                function create(properties) {
                  return new MsgMigrateSharesToFullRangeConcentratedPosition(
                    properties
                  );
                };
              MsgMigrateSharesToFullRangeConcentratedPosition.encode =
                function encode(m, w) {
                  if (!w) w = $Writer.create();
                  if (
                    m.sender != null &&
                    Object.hasOwnProperty.call(m, "sender")
                  )
                    w.uint32(10).string(m.sender);
                  if (
                    m.sharesToMigrate != null &&
                    Object.hasOwnProperty.call(m, "sharesToMigrate")
                  )
                    $root.cosmos.base.v1beta1.Coin.encode(
                      m.sharesToMigrate,
                      w.uint32(18).fork()
                    ).ldelim();
                  return w;
                };
              MsgMigrateSharesToFullRangeConcentratedPosition.decode =
                function decode(r, l) {
                  if (!(r instanceof $Reader)) r = $Reader.create(r);
                  var c = l === undefined ? r.len : r.pos + l,
                    m =
                      new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition();
                  while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                      case 1:
                        m.sender = r.string();
                        break;
                      case 2:
                        m.sharesToMigrate =
                          $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                        break;
                      default:
                        r.skipType(t & 7);
                        break;
                    }
                  }
                  return m;
                };
              MsgMigrateSharesToFullRangeConcentratedPosition.fromObject =
                function fromObject(d) {
                  if (
                    d instanceof
                    $root.osmosis.gamm.poolmodels.balancer.v1beta1
                      .MsgMigrateSharesToFullRangeConcentratedPosition
                  )
                    return d;
                  var m =
                    new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition();
                  if (d.sender != null) {
                    m.sender = String(d.sender);
                  }
                  if (d.sharesToMigrate != null) {
                    if (typeof d.sharesToMigrate !== "object")
                      throw TypeError(
                        ".osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition.sharesToMigrate: object expected"
                      );
                    m.sharesToMigrate =
                      $root.cosmos.base.v1beta1.Coin.fromObject(
                        d.sharesToMigrate
                      );
                  }
                  return m;
                };
              MsgMigrateSharesToFullRangeConcentratedPosition.toObject =
                function toObject(m, o) {
                  if (!o) o = {};
                  var d = {};
                  if (o.defaults) {
                    d.sender = "";
                    d.sharesToMigrate = null;
                  }
                  if (m.sender != null && m.hasOwnProperty("sender")) {
                    d.sender = m.sender;
                  }
                  if (
                    m.sharesToMigrate != null &&
                    m.hasOwnProperty("sharesToMigrate")
                  ) {
                    d.sharesToMigrate = $root.cosmos.base.v1beta1.Coin.toObject(
                      m.sharesToMigrate,
                      o
                    );
                  }
                  return d;
                };
              MsgMigrateSharesToFullRangeConcentratedPosition.prototype.toJSON =
                function toJSON() {
                  return this.constructor.toObject(
                    this,
                    $protobuf.util.toJSONOptions
                  );
                };
              return MsgMigrateSharesToFullRangeConcentratedPosition;
            })();
          v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse =
            (function () {
              function MsgMigrateSharesToFullRangeConcentratedPositionResponse(
                p
              ) {
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.prototype.amount0 =
                "";
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.prototype.amount1 =
                "";
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.prototype.liquidityCreated =
                "";
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.prototype.joinTime =
                null;
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.create =
                function create(properties) {
                  return new MsgMigrateSharesToFullRangeConcentratedPositionResponse(
                    properties
                  );
                };
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.encode =
                function encode(m, w) {
                  if (!w) w = $Writer.create();
                  if (
                    m.amount0 != null &&
                    Object.hasOwnProperty.call(m, "amount0")
                  )
                    w.uint32(10).string(m.amount0);
                  if (
                    m.amount1 != null &&
                    Object.hasOwnProperty.call(m, "amount1")
                  )
                    w.uint32(18).string(m.amount1);
                  if (
                    m.liquidityCreated != null &&
                    Object.hasOwnProperty.call(m, "liquidityCreated")
                  )
                    w.uint32(26).string(m.liquidityCreated);
                  if (
                    m.joinTime != null &&
                    Object.hasOwnProperty.call(m, "joinTime")
                  )
                    $root.google.protobuf.Timestamp.encode(
                      m.joinTime,
                      w.uint32(34).fork()
                    ).ldelim();
                  return w;
                };
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.decode =
                function decode(r, l) {
                  if (!(r instanceof $Reader)) r = $Reader.create(r);
                  var c = l === undefined ? r.len : r.pos + l,
                    m =
                      new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse();
                  while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                      case 1:
                        m.amount0 = r.string();
                        break;
                      case 2:
                        m.amount1 = r.string();
                        break;
                      case 3:
                        m.liquidityCreated = r.string();
                        break;
                      case 4:
                        m.joinTime = $root.google.protobuf.Timestamp.decode(
                          r,
                          r.uint32()
                        );
                        break;
                      default:
                        r.skipType(t & 7);
                        break;
                    }
                  }
                  return m;
                };
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.fromObject =
                function fromObject(d) {
                  if (
                    d instanceof
                    $root.osmosis.gamm.poolmodels.balancer.v1beta1
                      .MsgMigrateSharesToFullRangeConcentratedPositionResponse
                  )
                    return d;
                  var m =
                    new $root.osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse();
                  if (d.amount0 != null) {
                    m.amount0 = String(d.amount0);
                  }
                  if (d.amount1 != null) {
                    m.amount1 = String(d.amount1);
                  }
                  if (d.liquidityCreated != null) {
                    m.liquidityCreated = String(d.liquidityCreated);
                  }
                  if (d.joinTime != null) {
                    if (typeof d.joinTime !== "object")
                      throw TypeError(
                        ".osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse.joinTime: object expected"
                      );
                    m.joinTime = $root.google.protobuf.Timestamp.fromObject(
                      d.joinTime
                    );
                  }
                  return m;
                };
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.toObject =
                function toObject(m, o) {
                  if (!o) o = {};
                  var d = {};
                  if (o.defaults) {
                    d.amount0 = "";
                    d.amount1 = "";
                    d.liquidityCreated = "";
                    d.joinTime = null;
                  }
                  if (m.amount0 != null && m.hasOwnProperty("amount0")) {
                    d.amount0 = m.amount0;
                  }
                  if (m.amount1 != null && m.hasOwnProperty("amount1")) {
                    d.amount1 = m.amount1;
                  }
                  if (
                    m.liquidityCreated != null &&
                    m.hasOwnProperty("liquidityCreated")
                  ) {
                    d.liquidityCreated = m.liquidityCreated;
                  }
                  if (m.joinTime != null && m.hasOwnProperty("joinTime")) {
                    d.joinTime = $root.google.protobuf.Timestamp.toObject(
                      m.joinTime,
                      o
                    );
                  }
                  return d;
                };
              MsgMigrateSharesToFullRangeConcentratedPositionResponse.prototype.toJSON =
                function toJSON() {
                  return this.constructor.toObject(
                    this,
                    $protobuf.util.toJSONOptions
                  );
                };
              return MsgMigrateSharesToFullRangeConcentratedPositionResponse;
            })();
          return v1beta1;
        })();
        return balancer;
      })();
      poolmodels.stableswap = (function () {
        const stableswap = {};
        stableswap.v1beta1 = (function () {
          const v1beta1 = {};
          v1beta1.PoolParams = (function () {
            function PoolParams(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            PoolParams.prototype.swapFee = "";
            PoolParams.prototype.exitFee = "";
            PoolParams.create = function create(properties) {
              return new PoolParams(properties);
            };
            PoolParams.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.swapFee != null && Object.hasOwnProperty.call(m, "swapFee"))
                w.uint32(10).string(m.swapFee);
              if (m.exitFee != null && Object.hasOwnProperty.call(m, "exitFee"))
                w.uint32(18).string(m.exitFee);
              return w;
            };
            PoolParams.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.swapFee = r.string();
                    break;
                  case 2:
                    m.exitFee = r.string();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            PoolParams.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams();
              if (d.swapFee != null) {
                m.swapFee = String(d.swapFee);
              }
              if (d.exitFee != null) {
                m.exitFee = String(d.exitFee);
              }
              return m;
            };
            PoolParams.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.defaults) {
                d.swapFee = "";
                d.exitFee = "";
              }
              if (m.swapFee != null && m.hasOwnProperty("swapFee")) {
                d.swapFee = m.swapFee;
              }
              if (m.exitFee != null && m.hasOwnProperty("exitFee")) {
                d.exitFee = m.exitFee;
              }
              return d;
            };
            PoolParams.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            return PoolParams;
          })();
          v1beta1.Pool = (function () {
            function Pool(p) {
              this.poolLiquidity = [];
              this.scalingFactors = [];
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            Pool.prototype.address = "";
            Pool.prototype.id = $util.Long
              ? $util.Long.fromBits(0, 0, true)
              : 0;
            Pool.prototype.poolParams = null;
            Pool.prototype.futurePoolGovernor = "";
            Pool.prototype.totalShares = null;
            Pool.prototype.poolLiquidity = $util.emptyArray;
            Pool.prototype.scalingFactors = $util.emptyArray;
            Pool.prototype.scalingFactorController = "";
            Pool.create = function create(properties) {
              return new Pool(properties);
            };
            Pool.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.address != null && Object.hasOwnProperty.call(m, "address"))
                w.uint32(10).string(m.address);
              if (m.id != null && Object.hasOwnProperty.call(m, "id"))
                w.uint32(16).uint64(m.id);
              if (
                m.poolParams != null &&
                Object.hasOwnProperty.call(m, "poolParams")
              )
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.encode(
                  m.poolParams,
                  w.uint32(26).fork()
                ).ldelim();
              if (
                m.futurePoolGovernor != null &&
                Object.hasOwnProperty.call(m, "futurePoolGovernor")
              )
                w.uint32(34).string(m.futurePoolGovernor);
              if (
                m.totalShares != null &&
                Object.hasOwnProperty.call(m, "totalShares")
              )
                $root.cosmos.base.v1beta1.Coin.encode(
                  m.totalShares,
                  w.uint32(42).fork()
                ).ldelim();
              if (m.poolLiquidity != null && m.poolLiquidity.length) {
                for (var i = 0; i < m.poolLiquidity.length; ++i)
                  $root.cosmos.base.v1beta1.Coin.encode(
                    m.poolLiquidity[i],
                    w.uint32(50).fork()
                  ).ldelim();
              }
              if (m.scalingFactors != null && m.scalingFactors.length) {
                w.uint32(58).fork();
                for (var i = 0; i < m.scalingFactors.length; ++i)
                  w.uint64(m.scalingFactors[i]);
                w.ldelim();
              }
              if (
                m.scalingFactorController != null &&
                Object.hasOwnProperty.call(m, "scalingFactorController")
              )
                w.uint32(66).string(m.scalingFactorController);
              return w;
            };
            Pool.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m = new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.Pool();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.address = r.string();
                    break;
                  case 2:
                    m.id = r.uint64();
                    break;
                  case 3:
                    m.poolParams =
                      $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.decode(
                        r,
                        r.uint32()
                      );
                    break;
                  case 4:
                    m.futurePoolGovernor = r.string();
                    break;
                  case 5:
                    m.totalShares = $root.cosmos.base.v1beta1.Coin.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  case 6:
                    if (!(m.poolLiquidity && m.poolLiquidity.length))
                      m.poolLiquidity = [];
                    m.poolLiquidity.push(
                      $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                    );
                    break;
                  case 7:
                    if (!(m.scalingFactors && m.scalingFactors.length))
                      m.scalingFactors = [];
                    if ((t & 7) === 2) {
                      var c2 = r.uint32() + r.pos;
                      while (r.pos < c2) m.scalingFactors.push(r.uint64());
                    } else m.scalingFactors.push(r.uint64());
                    break;
                  case 8:
                    m.scalingFactorController = r.string();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            Pool.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1.Pool
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.Pool();
              if (d.address != null) {
                m.address = String(d.address);
              }
              if (d.id != null) {
                if ($util.Long)
                  (m.id = $util.Long.fromValue(d.id)).unsigned = true;
                else if (typeof d.id === "string") m.id = parseInt(d.id, 10);
                else if (typeof d.id === "number") m.id = d.id;
                else if (typeof d.id === "object")
                  m.id = new $util.LongBits(
                    d.id.low >>> 0,
                    d.id.high >>> 0
                  ).toNumber(true);
              }
              if (d.poolParams != null) {
                if (typeof d.poolParams !== "object")
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.poolParams: object expected"
                  );
                m.poolParams =
                  $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.fromObject(
                    d.poolParams
                  );
              }
              if (d.futurePoolGovernor != null) {
                m.futurePoolGovernor = String(d.futurePoolGovernor);
              }
              if (d.totalShares != null) {
                if (typeof d.totalShares !== "object")
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.totalShares: object expected"
                  );
                m.totalShares = $root.cosmos.base.v1beta1.Coin.fromObject(
                  d.totalShares
                );
              }
              if (d.poolLiquidity) {
                if (!Array.isArray(d.poolLiquidity))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.poolLiquidity: array expected"
                  );
                m.poolLiquidity = [];
                for (var i = 0; i < d.poolLiquidity.length; ++i) {
                  if (typeof d.poolLiquidity[i] !== "object")
                    throw TypeError(
                      ".osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.poolLiquidity: object expected"
                    );
                  m.poolLiquidity[i] =
                    $root.cosmos.base.v1beta1.Coin.fromObject(
                      d.poolLiquidity[i]
                    );
                }
              }
              if (d.scalingFactors) {
                if (!Array.isArray(d.scalingFactors))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.Pool.scalingFactors: array expected"
                  );
                m.scalingFactors = [];
                for (var i = 0; i < d.scalingFactors.length; ++i) {
                  if ($util.Long)
                    (m.scalingFactors[i] = $util.Long.fromValue(
                      d.scalingFactors[i]
                    )).unsigned = true;
                  else if (typeof d.scalingFactors[i] === "string")
                    m.scalingFactors[i] = parseInt(d.scalingFactors[i], 10);
                  else if (typeof d.scalingFactors[i] === "number")
                    m.scalingFactors[i] = d.scalingFactors[i];
                  else if (typeof d.scalingFactors[i] === "object")
                    m.scalingFactors[i] = new $util.LongBits(
                      d.scalingFactors[i].low >>> 0,
                      d.scalingFactors[i].high >>> 0
                    ).toNumber(true);
                }
              }
              if (d.scalingFactorController != null) {
                m.scalingFactorController = String(d.scalingFactorController);
              }
              return m;
            };
            Pool.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.arrays || o.defaults) {
                d.poolLiquidity = [];
                d.scalingFactors = [];
              }
              if (o.defaults) {
                d.address = "";
                if ($util.Long) {
                  var n = new $util.Long(0, 0, true);
                  d.id =
                    o.longs === String
                      ? n.toString()
                      : o.longs === Number
                      ? n.toNumber()
                      : n;
                } else d.id = o.longs === String ? "0" : 0;
                d.poolParams = null;
                d.futurePoolGovernor = "";
                d.totalShares = null;
                d.scalingFactorController = "";
              }
              if (m.address != null && m.hasOwnProperty("address")) {
                d.address = m.address;
              }
              if (m.id != null && m.hasOwnProperty("id")) {
                if (typeof m.id === "number")
                  d.id = o.longs === String ? String(m.id) : m.id;
                else
                  d.id =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.id)
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.id.low >>> 0,
                          m.id.high >>> 0
                        ).toNumber(true)
                      : m.id;
              }
              if (m.poolParams != null && m.hasOwnProperty("poolParams")) {
                d.poolParams =
                  $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.toObject(
                    m.poolParams,
                    o
                  );
              }
              if (
                m.futurePoolGovernor != null &&
                m.hasOwnProperty("futurePoolGovernor")
              ) {
                d.futurePoolGovernor = m.futurePoolGovernor;
              }
              if (m.totalShares != null && m.hasOwnProperty("totalShares")) {
                d.totalShares = $root.cosmos.base.v1beta1.Coin.toObject(
                  m.totalShares,
                  o
                );
              }
              if (m.poolLiquidity && m.poolLiquidity.length) {
                d.poolLiquidity = [];
                for (var j = 0; j < m.poolLiquidity.length; ++j) {
                  d.poolLiquidity[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                    m.poolLiquidity[j],
                    o
                  );
                }
              }
              if (m.scalingFactors && m.scalingFactors.length) {
                d.scalingFactors = [];
                for (var j = 0; j < m.scalingFactors.length; ++j) {
                  if (typeof m.scalingFactors[j] === "number")
                    d.scalingFactors[j] =
                      o.longs === String
                        ? String(m.scalingFactors[j])
                        : m.scalingFactors[j];
                  else
                    d.scalingFactors[j] =
                      o.longs === String
                        ? $util.Long.prototype.toString.call(
                            m.scalingFactors[j]
                          )
                        : o.longs === Number
                        ? new $util.LongBits(
                            m.scalingFactors[j].low >>> 0,
                            m.scalingFactors[j].high >>> 0
                          ).toNumber(true)
                        : m.scalingFactors[j];
                }
              }
              if (
                m.scalingFactorController != null &&
                m.hasOwnProperty("scalingFactorController")
              ) {
                d.scalingFactorController = m.scalingFactorController;
              }
              return d;
            };
            Pool.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            return Pool;
          })();
          v1beta1.Msg = (function () {
            function Msg(rpcImpl, requestDelimited, responseDelimited) {
              $protobuf.rpc.Service.call(
                this,
                rpcImpl,
                requestDelimited,
                responseDelimited
              );
            }
            (Msg.prototype = Object.create(
              $protobuf.rpc.Service.prototype
            )).constructor = Msg;
            Msg.create = function create(
              rpcImpl,
              requestDelimited,
              responseDelimited
            ) {
              return new this(rpcImpl, requestDelimited, responseDelimited);
            };
            Object.defineProperty(
              (Msg.prototype.createStableswapPool =
                function createStableswapPool(request, callback) {
                  return this.rpcCall(
                    createStableswapPool,
                    $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                      .MsgCreateStableswapPool,
                    $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                      .MsgCreateStableswapPoolResponse,
                    request,
                    callback
                  );
                }),
              "name",
              { value: "CreateStableswapPool" }
            );
            Object.defineProperty(
              (Msg.prototype.stableSwapAdjustScalingFactors =
                function stableSwapAdjustScalingFactors(request, callback) {
                  return this.rpcCall(
                    stableSwapAdjustScalingFactors,
                    $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                      .MsgStableSwapAdjustScalingFactors,
                    $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                      .MsgStableSwapAdjustScalingFactorsResponse,
                    request,
                    callback
                  );
                }),
              "name",
              { value: "StableSwapAdjustScalingFactors" }
            );
            return Msg;
          })();
          v1beta1.MsgCreateStableswapPool = (function () {
            function MsgCreateStableswapPool(p) {
              this.initialPoolLiquidity = [];
              this.scalingFactors = [];
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgCreateStableswapPool.prototype.sender = "";
            MsgCreateStableswapPool.prototype.poolParams = null;
            MsgCreateStableswapPool.prototype.initialPoolLiquidity =
              $util.emptyArray;
            MsgCreateStableswapPool.prototype.scalingFactors = $util.emptyArray;
            MsgCreateStableswapPool.prototype.futurePoolGovernor = "";
            MsgCreateStableswapPool.prototype.scalingFactorController = "";
            MsgCreateStableswapPool.create = function create(properties) {
              return new MsgCreateStableswapPool(properties);
            };
            MsgCreateStableswapPool.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                w.uint32(10).string(m.sender);
              if (
                m.poolParams != null &&
                Object.hasOwnProperty.call(m, "poolParams")
              )
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.encode(
                  m.poolParams,
                  w.uint32(18).fork()
                ).ldelim();
              if (
                m.initialPoolLiquidity != null &&
                m.initialPoolLiquidity.length
              ) {
                for (var i = 0; i < m.initialPoolLiquidity.length; ++i)
                  $root.cosmos.base.v1beta1.Coin.encode(
                    m.initialPoolLiquidity[i],
                    w.uint32(26).fork()
                  ).ldelim();
              }
              if (m.scalingFactors != null && m.scalingFactors.length) {
                w.uint32(34).fork();
                for (var i = 0; i < m.scalingFactors.length; ++i)
                  w.uint64(m.scalingFactors[i]);
                w.ldelim();
              }
              if (
                m.futurePoolGovernor != null &&
                Object.hasOwnProperty.call(m, "futurePoolGovernor")
              )
                w.uint32(42).string(m.futurePoolGovernor);
              if (
                m.scalingFactorController != null &&
                Object.hasOwnProperty.call(m, "scalingFactorController")
              )
                w.uint32(50).string(m.scalingFactorController);
              return w;
            };
            MsgCreateStableswapPool.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.sender = r.string();
                    break;
                  case 2:
                    m.poolParams =
                      $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.decode(
                        r,
                        r.uint32()
                      );
                    break;
                  case 3:
                    if (
                      !(m.initialPoolLiquidity && m.initialPoolLiquidity.length)
                    )
                      m.initialPoolLiquidity = [];
                    m.initialPoolLiquidity.push(
                      $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                    );
                    break;
                  case 4:
                    if (!(m.scalingFactors && m.scalingFactors.length))
                      m.scalingFactors = [];
                    if ((t & 7) === 2) {
                      var c2 = r.uint32() + r.pos;
                      while (r.pos < c2) m.scalingFactors.push(r.uint64());
                    } else m.scalingFactors.push(r.uint64());
                    break;
                  case 5:
                    m.futurePoolGovernor = r.string();
                    break;
                  case 6:
                    m.scalingFactorController = r.string();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgCreateStableswapPool.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                  .MsgCreateStableswapPool
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool();
              if (d.sender != null) {
                m.sender = String(d.sender);
              }
              if (d.poolParams != null) {
                if (typeof d.poolParams !== "object")
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.poolParams: object expected"
                  );
                m.poolParams =
                  $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.fromObject(
                    d.poolParams
                  );
              }
              if (d.initialPoolLiquidity) {
                if (!Array.isArray(d.initialPoolLiquidity))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.initialPoolLiquidity: array expected"
                  );
                m.initialPoolLiquidity = [];
                for (var i = 0; i < d.initialPoolLiquidity.length; ++i) {
                  if (typeof d.initialPoolLiquidity[i] !== "object")
                    throw TypeError(
                      ".osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.initialPoolLiquidity: object expected"
                    );
                  m.initialPoolLiquidity[i] =
                    $root.cosmos.base.v1beta1.Coin.fromObject(
                      d.initialPoolLiquidity[i]
                    );
                }
              }
              if (d.scalingFactors) {
                if (!Array.isArray(d.scalingFactors))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.scalingFactors: array expected"
                  );
                m.scalingFactors = [];
                for (var i = 0; i < d.scalingFactors.length; ++i) {
                  if ($util.Long)
                    (m.scalingFactors[i] = $util.Long.fromValue(
                      d.scalingFactors[i]
                    )).unsigned = true;
                  else if (typeof d.scalingFactors[i] === "string")
                    m.scalingFactors[i] = parseInt(d.scalingFactors[i], 10);
                  else if (typeof d.scalingFactors[i] === "number")
                    m.scalingFactors[i] = d.scalingFactors[i];
                  else if (typeof d.scalingFactors[i] === "object")
                    m.scalingFactors[i] = new $util.LongBits(
                      d.scalingFactors[i].low >>> 0,
                      d.scalingFactors[i].high >>> 0
                    ).toNumber(true);
                }
              }
              if (d.futurePoolGovernor != null) {
                m.futurePoolGovernor = String(d.futurePoolGovernor);
              }
              if (d.scalingFactorController != null) {
                m.scalingFactorController = String(d.scalingFactorController);
              }
              return m;
            };
            MsgCreateStableswapPool.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.arrays || o.defaults) {
                d.initialPoolLiquidity = [];
                d.scalingFactors = [];
              }
              if (o.defaults) {
                d.sender = "";
                d.poolParams = null;
                d.futurePoolGovernor = "";
                d.scalingFactorController = "";
              }
              if (m.sender != null && m.hasOwnProperty("sender")) {
                d.sender = m.sender;
              }
              if (m.poolParams != null && m.hasOwnProperty("poolParams")) {
                d.poolParams =
                  $root.osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams.toObject(
                    m.poolParams,
                    o
                  );
              }
              if (m.initialPoolLiquidity && m.initialPoolLiquidity.length) {
                d.initialPoolLiquidity = [];
                for (var j = 0; j < m.initialPoolLiquidity.length; ++j) {
                  d.initialPoolLiquidity[j] =
                    $root.cosmos.base.v1beta1.Coin.toObject(
                      m.initialPoolLiquidity[j],
                      o
                    );
                }
              }
              if (m.scalingFactors && m.scalingFactors.length) {
                d.scalingFactors = [];
                for (var j = 0; j < m.scalingFactors.length; ++j) {
                  if (typeof m.scalingFactors[j] === "number")
                    d.scalingFactors[j] =
                      o.longs === String
                        ? String(m.scalingFactors[j])
                        : m.scalingFactors[j];
                  else
                    d.scalingFactors[j] =
                      o.longs === String
                        ? $util.Long.prototype.toString.call(
                            m.scalingFactors[j]
                          )
                        : o.longs === Number
                        ? new $util.LongBits(
                            m.scalingFactors[j].low >>> 0,
                            m.scalingFactors[j].high >>> 0
                          ).toNumber(true)
                        : m.scalingFactors[j];
                }
              }
              if (
                m.futurePoolGovernor != null &&
                m.hasOwnProperty("futurePoolGovernor")
              ) {
                d.futurePoolGovernor = m.futurePoolGovernor;
              }
              if (
                m.scalingFactorController != null &&
                m.hasOwnProperty("scalingFactorController")
              ) {
                d.scalingFactorController = m.scalingFactorController;
              }
              return d;
            };
            MsgCreateStableswapPool.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            return MsgCreateStableswapPool;
          })();
          v1beta1.MsgCreateStableswapPoolResponse = (function () {
            function MsgCreateStableswapPoolResponse(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgCreateStableswapPoolResponse.prototype.poolId = $util.Long
              ? $util.Long.fromBits(0, 0, true)
              : 0;
            MsgCreateStableswapPoolResponse.create = function create(
              properties
            ) {
              return new MsgCreateStableswapPoolResponse(properties);
            };
            MsgCreateStableswapPoolResponse.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
                w.uint32(8).uint64(m.poolId);
              return w;
            };
            MsgCreateStableswapPoolResponse.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.poolId = r.uint64();
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgCreateStableswapPoolResponse.fromObject = function fromObject(
              d
            ) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                  .MsgCreateStableswapPoolResponse
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse();
              if (d.poolId != null) {
                if ($util.Long)
                  (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
                else if (typeof d.poolId === "string")
                  m.poolId = parseInt(d.poolId, 10);
                else if (typeof d.poolId === "number") m.poolId = d.poolId;
                else if (typeof d.poolId === "object")
                  m.poolId = new $util.LongBits(
                    d.poolId.low >>> 0,
                    d.poolId.high >>> 0
                  ).toNumber(true);
              }
              return m;
            };
            MsgCreateStableswapPoolResponse.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (o.defaults) {
                if ($util.Long) {
                  var n = new $util.Long(0, 0, true);
                  d.poolId =
                    o.longs === String
                      ? n.toString()
                      : o.longs === Number
                      ? n.toNumber()
                      : n;
                } else d.poolId = o.longs === String ? "0" : 0;
              }
              if (m.poolId != null && m.hasOwnProperty("poolId")) {
                if (typeof m.poolId === "number")
                  d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
                else
                  d.poolId =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.poolId)
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.poolId.low >>> 0,
                          m.poolId.high >>> 0
                        ).toNumber(true)
                      : m.poolId;
              }
              return d;
            };
            MsgCreateStableswapPoolResponse.prototype.toJSON =
              function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
            return MsgCreateStableswapPoolResponse;
          })();
          v1beta1.MsgStableSwapAdjustScalingFactors = (function () {
            function MsgStableSwapAdjustScalingFactors(p) {
              this.scalingFactors = [];
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgStableSwapAdjustScalingFactors.prototype.sender = "";
            MsgStableSwapAdjustScalingFactors.prototype.poolId = $util.Long
              ? $util.Long.fromBits(0, 0, true)
              : 0;
            MsgStableSwapAdjustScalingFactors.prototype.scalingFactors =
              $util.emptyArray;
            MsgStableSwapAdjustScalingFactors.create = function create(
              properties
            ) {
              return new MsgStableSwapAdjustScalingFactors(properties);
            };
            MsgStableSwapAdjustScalingFactors.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                w.uint32(10).string(m.sender);
              if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
                w.uint32(16).uint64(m.poolId);
              if (m.scalingFactors != null && m.scalingFactors.length) {
                w.uint32(26).fork();
                for (var i = 0; i < m.scalingFactors.length; ++i)
                  w.uint64(m.scalingFactors[i]);
                w.ldelim();
              }
              return w;
            };
            MsgStableSwapAdjustScalingFactors.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.sender = r.string();
                    break;
                  case 2:
                    m.poolId = r.uint64();
                    break;
                  case 3:
                    if (!(m.scalingFactors && m.scalingFactors.length))
                      m.scalingFactors = [];
                    if ((t & 7) === 2) {
                      var c2 = r.uint32() + r.pos;
                      while (r.pos < c2) m.scalingFactors.push(r.uint64());
                    } else m.scalingFactors.push(r.uint64());
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgStableSwapAdjustScalingFactors.fromObject = function fromObject(
              d
            ) {
              if (
                d instanceof
                $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                  .MsgStableSwapAdjustScalingFactors
              )
                return d;
              var m =
                new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors();
              if (d.sender != null) {
                m.sender = String(d.sender);
              }
              if (d.poolId != null) {
                if ($util.Long)
                  (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
                else if (typeof d.poolId === "string")
                  m.poolId = parseInt(d.poolId, 10);
                else if (typeof d.poolId === "number") m.poolId = d.poolId;
                else if (typeof d.poolId === "object")
                  m.poolId = new $util.LongBits(
                    d.poolId.low >>> 0,
                    d.poolId.high >>> 0
                  ).toNumber(true);
              }
              if (d.scalingFactors) {
                if (!Array.isArray(d.scalingFactors))
                  throw TypeError(
                    ".osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors.scalingFactors: array expected"
                  );
                m.scalingFactors = [];
                for (var i = 0; i < d.scalingFactors.length; ++i) {
                  if ($util.Long)
                    (m.scalingFactors[i] = $util.Long.fromValue(
                      d.scalingFactors[i]
                    )).unsigned = true;
                  else if (typeof d.scalingFactors[i] === "string")
                    m.scalingFactors[i] = parseInt(d.scalingFactors[i], 10);
                  else if (typeof d.scalingFactors[i] === "number")
                    m.scalingFactors[i] = d.scalingFactors[i];
                  else if (typeof d.scalingFactors[i] === "object")
                    m.scalingFactors[i] = new $util.LongBits(
                      d.scalingFactors[i].low >>> 0,
                      d.scalingFactors[i].high >>> 0
                    ).toNumber(true);
                }
              }
              return m;
            };
            MsgStableSwapAdjustScalingFactors.toObject = function toObject(
              m,
              o
            ) {
              if (!o) o = {};
              var d = {};
              if (o.arrays || o.defaults) {
                d.scalingFactors = [];
              }
              if (o.defaults) {
                d.sender = "";
                if ($util.Long) {
                  var n = new $util.Long(0, 0, true);
                  d.poolId =
                    o.longs === String
                      ? n.toString()
                      : o.longs === Number
                      ? n.toNumber()
                      : n;
                } else d.poolId = o.longs === String ? "0" : 0;
              }
              if (m.sender != null && m.hasOwnProperty("sender")) {
                d.sender = m.sender;
              }
              if (m.poolId != null && m.hasOwnProperty("poolId")) {
                if (typeof m.poolId === "number")
                  d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
                else
                  d.poolId =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.poolId)
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.poolId.low >>> 0,
                          m.poolId.high >>> 0
                        ).toNumber(true)
                      : m.poolId;
              }
              if (m.scalingFactors && m.scalingFactors.length) {
                d.scalingFactors = [];
                for (var j = 0; j < m.scalingFactors.length; ++j) {
                  if (typeof m.scalingFactors[j] === "number")
                    d.scalingFactors[j] =
                      o.longs === String
                        ? String(m.scalingFactors[j])
                        : m.scalingFactors[j];
                  else
                    d.scalingFactors[j] =
                      o.longs === String
                        ? $util.Long.prototype.toString.call(
                            m.scalingFactors[j]
                          )
                        : o.longs === Number
                        ? new $util.LongBits(
                            m.scalingFactors[j].low >>> 0,
                            m.scalingFactors[j].high >>> 0
                          ).toNumber(true)
                        : m.scalingFactors[j];
                }
              }
              return d;
            };
            MsgStableSwapAdjustScalingFactors.prototype.toJSON =
              function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
            return MsgStableSwapAdjustScalingFactors;
          })();
          v1beta1.MsgStableSwapAdjustScalingFactorsResponse = (function () {
            function MsgStableSwapAdjustScalingFactorsResponse(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            MsgStableSwapAdjustScalingFactorsResponse.create = function create(
              properties
            ) {
              return new MsgStableSwapAdjustScalingFactorsResponse(properties);
            };
            MsgStableSwapAdjustScalingFactorsResponse.encode = function encode(
              m,
              w
            ) {
              if (!w) w = $Writer.create();
              return w;
            };
            MsgStableSwapAdjustScalingFactorsResponse.decode = function decode(
              r,
              l
            ) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m =
                  new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            MsgStableSwapAdjustScalingFactorsResponse.fromObject =
              function fromObject(d) {
                if (
                  d instanceof
                  $root.osmosis.gamm.poolmodels.stableswap.v1beta1
                    .MsgStableSwapAdjustScalingFactorsResponse
                )
                  return d;
                return new $root.osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse();
              };
            MsgStableSwapAdjustScalingFactorsResponse.toObject =
              function toObject() {
                return {};
              };
            MsgStableSwapAdjustScalingFactorsResponse.prototype.toJSON =
              function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
            return MsgStableSwapAdjustScalingFactorsResponse;
          })();
          return v1beta1;
        })();
        return stableswap;
      })();
      return poolmodels;
    })();
    return gamm;
  })();
  osmosis.concentratedliquidity = (function () {
    const concentratedliquidity = {};
    concentratedliquidity.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.MsgCreator = (function () {
        function MsgCreator(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (MsgCreator.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = MsgCreator;
        MsgCreator.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (MsgCreator.prototype.createConcentratedPool =
            function createConcentratedPool(request, callback) {
              return this.rpcCall(
                createConcentratedPool,
                $root.osmosis.concentratedliquidity.v1beta1
                  .MsgCreateConcentratedPool,
                $root.osmosis.concentratedliquidity.v1beta1
                  .MsgCreateConcentratedPoolResponse,
                request,
                callback
              );
            }),
          "name",
          { value: "CreateConcentratedPool" }
        );
        return MsgCreator;
      })();
      v1beta1.MsgCreateConcentratedPool = (function () {
        function MsgCreateConcentratedPool(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateConcentratedPool.prototype.sender = "";
        MsgCreateConcentratedPool.prototype.denom0 = "";
        MsgCreateConcentratedPool.prototype.denom1 = "";
        MsgCreateConcentratedPool.prototype.tickSpacing = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgCreateConcentratedPool.prototype.exponentAtPriceOne = "";
        MsgCreateConcentratedPool.prototype.swapFee = "";
        MsgCreateConcentratedPool.create = function create(properties) {
          return new MsgCreateConcentratedPool(properties);
        };
        MsgCreateConcentratedPool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(10).string(m.sender);
          if (m.denom0 != null && Object.hasOwnProperty.call(m, "denom0"))
            w.uint32(18).string(m.denom0);
          if (m.denom1 != null && Object.hasOwnProperty.call(m, "denom1"))
            w.uint32(26).string(m.denom1);
          if (
            m.tickSpacing != null &&
            Object.hasOwnProperty.call(m, "tickSpacing")
          )
            w.uint32(32).uint64(m.tickSpacing);
          if (
            m.exponentAtPriceOne != null &&
            Object.hasOwnProperty.call(m, "exponentAtPriceOne")
          )
            w.uint32(42).string(m.exponentAtPriceOne);
          if (m.swapFee != null && Object.hasOwnProperty.call(m, "swapFee"))
            w.uint32(74).string(m.swapFee);
          return w;
        };
        MsgCreateConcentratedPool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.sender = r.string();
                break;
              case 2:
                m.denom0 = r.string();
                break;
              case 3:
                m.denom1 = r.string();
                break;
              case 4:
                m.tickSpacing = r.uint64();
                break;
              case 5:
                m.exponentAtPriceOne = r.string();
                break;
              case 9:
                m.swapFee = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateConcentratedPool.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgCreateConcentratedPool
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool();
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.denom0 != null) {
            m.denom0 = String(d.denom0);
          }
          if (d.denom1 != null) {
            m.denom1 = String(d.denom1);
          }
          if (d.tickSpacing != null) {
            if ($util.Long)
              (m.tickSpacing = $util.Long.fromValue(
                d.tickSpacing
              )).unsigned = true;
            else if (typeof d.tickSpacing === "string")
              m.tickSpacing = parseInt(d.tickSpacing, 10);
            else if (typeof d.tickSpacing === "number")
              m.tickSpacing = d.tickSpacing;
            else if (typeof d.tickSpacing === "object")
              m.tickSpacing = new $util.LongBits(
                d.tickSpacing.low >>> 0,
                d.tickSpacing.high >>> 0
              ).toNumber(true);
          }
          if (d.exponentAtPriceOne != null) {
            m.exponentAtPriceOne = String(d.exponentAtPriceOne);
          }
          if (d.swapFee != null) {
            m.swapFee = String(d.swapFee);
          }
          return m;
        };
        MsgCreateConcentratedPool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.sender = "";
            d.denom0 = "";
            d.denom1 = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.tickSpacing =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.tickSpacing = o.longs === String ? "0" : 0;
            d.exponentAtPriceOne = "";
            d.swapFee = "";
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.denom0 != null && m.hasOwnProperty("denom0")) {
            d.denom0 = m.denom0;
          }
          if (m.denom1 != null && m.hasOwnProperty("denom1")) {
            d.denom1 = m.denom1;
          }
          if (m.tickSpacing != null && m.hasOwnProperty("tickSpacing")) {
            if (typeof m.tickSpacing === "number")
              d.tickSpacing =
                o.longs === String ? String(m.tickSpacing) : m.tickSpacing;
            else
              d.tickSpacing =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.tickSpacing)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.tickSpacing.low >>> 0,
                      m.tickSpacing.high >>> 0
                    ).toNumber(true)
                  : m.tickSpacing;
          }
          if (
            m.exponentAtPriceOne != null &&
            m.hasOwnProperty("exponentAtPriceOne")
          ) {
            d.exponentAtPriceOne = m.exponentAtPriceOne;
          }
          if (m.swapFee != null && m.hasOwnProperty("swapFee")) {
            d.swapFee = m.swapFee;
          }
          return d;
        };
        MsgCreateConcentratedPool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateConcentratedPool;
      })();
      v1beta1.MsgCreateConcentratedPoolResponse = (function () {
        function MsgCreateConcentratedPoolResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateConcentratedPoolResponse.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgCreateConcentratedPoolResponse.create = function create(properties) {
          return new MsgCreateConcentratedPoolResponse(properties);
        };
        MsgCreateConcentratedPoolResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          return w;
        };
        MsgCreateConcentratedPoolResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPoolResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateConcentratedPoolResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgCreateConcentratedPoolResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPoolResponse();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        MsgCreateConcentratedPoolResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          return d;
        };
        MsgCreateConcentratedPoolResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateConcentratedPoolResponse;
      })();
      v1beta1.IncentiveRecord = (function () {
        function IncentiveRecord(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        IncentiveRecord.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        IncentiveRecord.prototype.incentiveDenom = "";
        IncentiveRecord.prototype.incentiveCreatorAddr = "";
        IncentiveRecord.prototype.incentiveRecordBody = null;
        IncentiveRecord.prototype.minUptime = null;
        IncentiveRecord.create = function create(properties) {
          return new IncentiveRecord(properties);
        };
        IncentiveRecord.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          if (
            m.incentiveDenom != null &&
            Object.hasOwnProperty.call(m, "incentiveDenom")
          )
            w.uint32(18).string(m.incentiveDenom);
          if (
            m.incentiveCreatorAddr != null &&
            Object.hasOwnProperty.call(m, "incentiveCreatorAddr")
          )
            w.uint32(26).string(m.incentiveCreatorAddr);
          if (
            m.incentiveRecordBody != null &&
            Object.hasOwnProperty.call(m, "incentiveRecordBody")
          )
            $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody.encode(
              m.incentiveRecordBody,
              w.uint32(34).fork()
            ).ldelim();
          if (m.minUptime != null && Object.hasOwnProperty.call(m, "minUptime"))
            $root.google.protobuf.Duration.encode(
              m.minUptime,
              w.uint32(42).fork()
            ).ldelim();
          return w;
        };
        IncentiveRecord.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecord();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              case 2:
                m.incentiveDenom = r.string();
                break;
              case 3:
                m.incentiveCreatorAddr = r.string();
                break;
              case 4:
                m.incentiveRecordBody =
                  $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody.decode(
                    r,
                    r.uint32()
                  );
                break;
              case 5:
                m.minUptime = $root.google.protobuf.Duration.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        IncentiveRecord.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecord
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecord();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.incentiveDenom != null) {
            m.incentiveDenom = String(d.incentiveDenom);
          }
          if (d.incentiveCreatorAddr != null) {
            m.incentiveCreatorAddr = String(d.incentiveCreatorAddr);
          }
          if (d.incentiveRecordBody != null) {
            if (typeof d.incentiveRecordBody !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.IncentiveRecord.incentiveRecordBody: object expected"
              );
            m.incentiveRecordBody =
              $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody.fromObject(
                d.incentiveRecordBody
              );
          }
          if (d.minUptime != null) {
            if (typeof d.minUptime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.IncentiveRecord.minUptime: object expected"
              );
            m.minUptime = $root.google.protobuf.Duration.fromObject(
              d.minUptime
            );
          }
          return m;
        };
        IncentiveRecord.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.incentiveDenom = "";
            d.incentiveCreatorAddr = "";
            d.incentiveRecordBody = null;
            d.minUptime = null;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.incentiveDenom != null && m.hasOwnProperty("incentiveDenom")) {
            d.incentiveDenom = m.incentiveDenom;
          }
          if (
            m.incentiveCreatorAddr != null &&
            m.hasOwnProperty("incentiveCreatorAddr")
          ) {
            d.incentiveCreatorAddr = m.incentiveCreatorAddr;
          }
          if (
            m.incentiveRecordBody != null &&
            m.hasOwnProperty("incentiveRecordBody")
          ) {
            d.incentiveRecordBody =
              $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody.toObject(
                m.incentiveRecordBody,
                o
              );
          }
          if (m.minUptime != null && m.hasOwnProperty("minUptime")) {
            d.minUptime = $root.google.protobuf.Duration.toObject(
              m.minUptime,
              o
            );
          }
          return d;
        };
        IncentiveRecord.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return IncentiveRecord;
      })();
      v1beta1.IncentiveRecordBody = (function () {
        function IncentiveRecordBody(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        IncentiveRecordBody.prototype.remainingAmount = "";
        IncentiveRecordBody.prototype.emissionRate = "";
        IncentiveRecordBody.prototype.startTime = null;
        IncentiveRecordBody.create = function create(properties) {
          return new IncentiveRecordBody(properties);
        };
        IncentiveRecordBody.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.remainingAmount != null &&
            Object.hasOwnProperty.call(m, "remainingAmount")
          )
            w.uint32(10).string(m.remainingAmount);
          if (
            m.emissionRate != null &&
            Object.hasOwnProperty.call(m, "emissionRate")
          )
            w.uint32(18).string(m.emissionRate);
          if (m.startTime != null && Object.hasOwnProperty.call(m, "startTime"))
            $root.google.protobuf.Timestamp.encode(
              m.startTime,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        IncentiveRecordBody.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.remainingAmount = r.string();
                break;
              case 2:
                m.emissionRate = r.string();
                break;
              case 3:
                m.startTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        IncentiveRecordBody.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody();
          if (d.remainingAmount != null) {
            m.remainingAmount = String(d.remainingAmount);
          }
          if (d.emissionRate != null) {
            m.emissionRate = String(d.emissionRate);
          }
          if (d.startTime != null) {
            if (typeof d.startTime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody.startTime: object expected"
              );
            m.startTime = $root.google.protobuf.Timestamp.fromObject(
              d.startTime
            );
          }
          return m;
        };
        IncentiveRecordBody.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.remainingAmount = "";
            d.emissionRate = "";
            d.startTime = null;
          }
          if (
            m.remainingAmount != null &&
            m.hasOwnProperty("remainingAmount")
          ) {
            d.remainingAmount = m.remainingAmount;
          }
          if (m.emissionRate != null && m.hasOwnProperty("emissionRate")) {
            d.emissionRate = m.emissionRate;
          }
          if (m.startTime != null && m.hasOwnProperty("startTime")) {
            d.startTime = $root.google.protobuf.Timestamp.toObject(
              m.startTime,
              o
            );
          }
          return d;
        };
        IncentiveRecordBody.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return IncentiveRecordBody;
      })();
      v1beta1.Pool = (function () {
        function Pool(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Pool.prototype.address = "";
        Pool.prototype.incentivesAddress = "";
        Pool.prototype.id = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        Pool.prototype.currentTickLiquidity = "";
        Pool.prototype.token0 = "";
        Pool.prototype.token1 = "";
        Pool.prototype.currentSqrtPrice = "";
        Pool.prototype.currentTick = "";
        Pool.prototype.tickSpacing = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Pool.prototype.exponentAtPriceOne = "";
        Pool.prototype.swapFee = "";
        Pool.prototype.lastLiquidityUpdate = null;
        Pool.create = function create(properties) {
          return new Pool(properties);
        };
        Pool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (
            m.incentivesAddress != null &&
            Object.hasOwnProperty.call(m, "incentivesAddress")
          )
            w.uint32(18).string(m.incentivesAddress);
          if (m.id != null && Object.hasOwnProperty.call(m, "id"))
            w.uint32(24).uint64(m.id);
          if (
            m.currentTickLiquidity != null &&
            Object.hasOwnProperty.call(m, "currentTickLiquidity")
          )
            w.uint32(34).string(m.currentTickLiquidity);
          if (m.token0 != null && Object.hasOwnProperty.call(m, "token0"))
            w.uint32(42).string(m.token0);
          if (m.token1 != null && Object.hasOwnProperty.call(m, "token1"))
            w.uint32(50).string(m.token1);
          if (
            m.currentSqrtPrice != null &&
            Object.hasOwnProperty.call(m, "currentSqrtPrice")
          )
            w.uint32(58).string(m.currentSqrtPrice);
          if (
            m.currentTick != null &&
            Object.hasOwnProperty.call(m, "currentTick")
          )
            w.uint32(66).string(m.currentTick);
          if (
            m.tickSpacing != null &&
            Object.hasOwnProperty.call(m, "tickSpacing")
          )
            w.uint32(72).uint64(m.tickSpacing);
          if (
            m.exponentAtPriceOne != null &&
            Object.hasOwnProperty.call(m, "exponentAtPriceOne")
          )
            w.uint32(82).string(m.exponentAtPriceOne);
          if (m.swapFee != null && Object.hasOwnProperty.call(m, "swapFee"))
            w.uint32(90).string(m.swapFee);
          if (
            m.lastLiquidityUpdate != null &&
            Object.hasOwnProperty.call(m, "lastLiquidityUpdate")
          )
            $root.google.protobuf.Timestamp.encode(
              m.lastLiquidityUpdate,
              w.uint32(98).fork()
            ).ldelim();
          return w;
        };
        Pool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.concentratedliquidity.v1beta1.Pool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.incentivesAddress = r.string();
                break;
              case 3:
                m.id = r.uint64();
                break;
              case 4:
                m.currentTickLiquidity = r.string();
                break;
              case 5:
                m.token0 = r.string();
                break;
              case 6:
                m.token1 = r.string();
                break;
              case 7:
                m.currentSqrtPrice = r.string();
                break;
              case 8:
                m.currentTick = r.string();
                break;
              case 9:
                m.tickSpacing = r.uint64();
                break;
              case 10:
                m.exponentAtPriceOne = r.string();
                break;
              case 11:
                m.swapFee = r.string();
                break;
              case 12:
                m.lastLiquidityUpdate = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Pool.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.concentratedliquidity.v1beta1.Pool)
            return d;
          var m = new $root.osmosis.concentratedliquidity.v1beta1.Pool();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.incentivesAddress != null) {
            m.incentivesAddress = String(d.incentivesAddress);
          }
          if (d.id != null) {
            if ($util.Long) (m.id = $util.Long.fromValue(d.id)).unsigned = true;
            else if (typeof d.id === "string") m.id = parseInt(d.id, 10);
            else if (typeof d.id === "number") m.id = d.id;
            else if (typeof d.id === "object")
              m.id = new $util.LongBits(
                d.id.low >>> 0,
                d.id.high >>> 0
              ).toNumber(true);
          }
          if (d.currentTickLiquidity != null) {
            m.currentTickLiquidity = String(d.currentTickLiquidity);
          }
          if (d.token0 != null) {
            m.token0 = String(d.token0);
          }
          if (d.token1 != null) {
            m.token1 = String(d.token1);
          }
          if (d.currentSqrtPrice != null) {
            m.currentSqrtPrice = String(d.currentSqrtPrice);
          }
          if (d.currentTick != null) {
            m.currentTick = String(d.currentTick);
          }
          if (d.tickSpacing != null) {
            if ($util.Long)
              (m.tickSpacing = $util.Long.fromValue(
                d.tickSpacing
              )).unsigned = true;
            else if (typeof d.tickSpacing === "string")
              m.tickSpacing = parseInt(d.tickSpacing, 10);
            else if (typeof d.tickSpacing === "number")
              m.tickSpacing = d.tickSpacing;
            else if (typeof d.tickSpacing === "object")
              m.tickSpacing = new $util.LongBits(
                d.tickSpacing.low >>> 0,
                d.tickSpacing.high >>> 0
              ).toNumber(true);
          }
          if (d.exponentAtPriceOne != null) {
            m.exponentAtPriceOne = String(d.exponentAtPriceOne);
          }
          if (d.swapFee != null) {
            m.swapFee = String(d.swapFee);
          }
          if (d.lastLiquidityUpdate != null) {
            if (typeof d.lastLiquidityUpdate !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.Pool.lastLiquidityUpdate: object expected"
              );
            m.lastLiquidityUpdate = $root.google.protobuf.Timestamp.fromObject(
              d.lastLiquidityUpdate
            );
          }
          return m;
        };
        Pool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.address = "";
            d.incentivesAddress = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.id =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.id = o.longs === String ? "0" : 0;
            d.currentTickLiquidity = "";
            d.token0 = "";
            d.token1 = "";
            d.currentSqrtPrice = "";
            d.currentTick = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.tickSpacing =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.tickSpacing = o.longs === String ? "0" : 0;
            d.exponentAtPriceOne = "";
            d.swapFee = "";
            d.lastLiquidityUpdate = null;
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (
            m.incentivesAddress != null &&
            m.hasOwnProperty("incentivesAddress")
          ) {
            d.incentivesAddress = m.incentivesAddress;
          }
          if (m.id != null && m.hasOwnProperty("id")) {
            if (typeof m.id === "number")
              d.id = o.longs === String ? String(m.id) : m.id;
            else
              d.id =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.id)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.id.low >>> 0,
                      m.id.high >>> 0
                    ).toNumber(true)
                  : m.id;
          }
          if (
            m.currentTickLiquidity != null &&
            m.hasOwnProperty("currentTickLiquidity")
          ) {
            d.currentTickLiquidity = m.currentTickLiquidity;
          }
          if (m.token0 != null && m.hasOwnProperty("token0")) {
            d.token0 = m.token0;
          }
          if (m.token1 != null && m.hasOwnProperty("token1")) {
            d.token1 = m.token1;
          }
          if (
            m.currentSqrtPrice != null &&
            m.hasOwnProperty("currentSqrtPrice")
          ) {
            d.currentSqrtPrice = m.currentSqrtPrice;
          }
          if (m.currentTick != null && m.hasOwnProperty("currentTick")) {
            d.currentTick = m.currentTick;
          }
          if (m.tickSpacing != null && m.hasOwnProperty("tickSpacing")) {
            if (typeof m.tickSpacing === "number")
              d.tickSpacing =
                o.longs === String ? String(m.tickSpacing) : m.tickSpacing;
            else
              d.tickSpacing =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.tickSpacing)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.tickSpacing.low >>> 0,
                      m.tickSpacing.high >>> 0
                    ).toNumber(true)
                  : m.tickSpacing;
          }
          if (
            m.exponentAtPriceOne != null &&
            m.hasOwnProperty("exponentAtPriceOne")
          ) {
            d.exponentAtPriceOne = m.exponentAtPriceOne;
          }
          if (m.swapFee != null && m.hasOwnProperty("swapFee")) {
            d.swapFee = m.swapFee;
          }
          if (
            m.lastLiquidityUpdate != null &&
            m.hasOwnProperty("lastLiquidityUpdate")
          ) {
            d.lastLiquidityUpdate = $root.google.protobuf.Timestamp.toObject(
              m.lastLiquidityUpdate,
              o
            );
          }
          return d;
        };
        Pool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Pool;
      })();
      v1beta1.Position = (function () {
        function Position(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Position.prototype.positionId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Position.prototype.address = "";
        Position.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Position.prototype.lowerTick = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        Position.prototype.upperTick = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        Position.prototype.joinTime = null;
        Position.prototype.liquidity = "";
        Position.create = function create(properties) {
          return new Position(properties);
        };
        Position.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.positionId != null &&
            Object.hasOwnProperty.call(m, "positionId")
          )
            w.uint32(8).uint64(m.positionId);
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(18).string(m.address);
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(24).uint64(m.poolId);
          if (m.lowerTick != null && Object.hasOwnProperty.call(m, "lowerTick"))
            w.uint32(32).int64(m.lowerTick);
          if (m.upperTick != null && Object.hasOwnProperty.call(m, "upperTick"))
            w.uint32(40).int64(m.upperTick);
          if (m.joinTime != null && Object.hasOwnProperty.call(m, "joinTime"))
            $root.google.protobuf.Timestamp.encode(
              m.joinTime,
              w.uint32(50).fork()
            ).ldelim();
          if (m.liquidity != null && Object.hasOwnProperty.call(m, "liquidity"))
            w.uint32(58).string(m.liquidity);
          return w;
        };
        Position.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.concentratedliquidity.v1beta1.Position();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.positionId = r.uint64();
                break;
              case 2:
                m.address = r.string();
                break;
              case 3:
                m.poolId = r.uint64();
                break;
              case 4:
                m.lowerTick = r.int64();
                break;
              case 5:
                m.upperTick = r.int64();
                break;
              case 6:
                m.joinTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 7:
                m.liquidity = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Position.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.concentratedliquidity.v1beta1.Position)
            return d;
          var m = new $root.osmosis.concentratedliquidity.v1beta1.Position();
          if (d.positionId != null) {
            if ($util.Long)
              (m.positionId = $util.Long.fromValue(
                d.positionId
              )).unsigned = true;
            else if (typeof d.positionId === "string")
              m.positionId = parseInt(d.positionId, 10);
            else if (typeof d.positionId === "number")
              m.positionId = d.positionId;
            else if (typeof d.positionId === "object")
              m.positionId = new $util.LongBits(
                d.positionId.low >>> 0,
                d.positionId.high >>> 0
              ).toNumber(true);
          }
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.lowerTick != null) {
            if ($util.Long)
              (m.lowerTick = $util.Long.fromValue(
                d.lowerTick
              )).unsigned = false;
            else if (typeof d.lowerTick === "string")
              m.lowerTick = parseInt(d.lowerTick, 10);
            else if (typeof d.lowerTick === "number") m.lowerTick = d.lowerTick;
            else if (typeof d.lowerTick === "object")
              m.lowerTick = new $util.LongBits(
                d.lowerTick.low >>> 0,
                d.lowerTick.high >>> 0
              ).toNumber();
          }
          if (d.upperTick != null) {
            if ($util.Long)
              (m.upperTick = $util.Long.fromValue(
                d.upperTick
              )).unsigned = false;
            else if (typeof d.upperTick === "string")
              m.upperTick = parseInt(d.upperTick, 10);
            else if (typeof d.upperTick === "number") m.upperTick = d.upperTick;
            else if (typeof d.upperTick === "object")
              m.upperTick = new $util.LongBits(
                d.upperTick.low >>> 0,
                d.upperTick.high >>> 0
              ).toNumber();
          }
          if (d.joinTime != null) {
            if (typeof d.joinTime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.Position.joinTime: object expected"
              );
            m.joinTime = $root.google.protobuf.Timestamp.fromObject(d.joinTime);
          }
          if (d.liquidity != null) {
            m.liquidity = String(d.liquidity);
          }
          return m;
        };
        Position.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.positionId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.positionId = o.longs === String ? "0" : 0;
            d.address = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.lowerTick =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.lowerTick = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.upperTick =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.upperTick = o.longs === String ? "0" : 0;
            d.joinTime = null;
            d.liquidity = "";
          }
          if (m.positionId != null && m.hasOwnProperty("positionId")) {
            if (typeof m.positionId === "number")
              d.positionId =
                o.longs === String ? String(m.positionId) : m.positionId;
            else
              d.positionId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.positionId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.positionId.low >>> 0,
                      m.positionId.high >>> 0
                    ).toNumber(true)
                  : m.positionId;
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.lowerTick != null && m.hasOwnProperty("lowerTick")) {
            if (typeof m.lowerTick === "number")
              d.lowerTick =
                o.longs === String ? String(m.lowerTick) : m.lowerTick;
            else
              d.lowerTick =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.lowerTick)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.lowerTick.low >>> 0,
                      m.lowerTick.high >>> 0
                    ).toNumber()
                  : m.lowerTick;
          }
          if (m.upperTick != null && m.hasOwnProperty("upperTick")) {
            if (typeof m.upperTick === "number")
              d.upperTick =
                o.longs === String ? String(m.upperTick) : m.upperTick;
            else
              d.upperTick =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.upperTick)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.upperTick.low >>> 0,
                      m.upperTick.high >>> 0
                    ).toNumber()
                  : m.upperTick;
          }
          if (m.joinTime != null && m.hasOwnProperty("joinTime")) {
            d.joinTime = $root.google.protobuf.Timestamp.toObject(
              m.joinTime,
              o
            );
          }
          if (m.liquidity != null && m.hasOwnProperty("liquidity")) {
            d.liquidity = m.liquidity;
          }
          return d;
        };
        Position.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Position;
      })();
      v1beta1.PositionWithUnderlyingAssetBreakdown = (function () {
        function PositionWithUnderlyingAssetBreakdown(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PositionWithUnderlyingAssetBreakdown.prototype.position = null;
        PositionWithUnderlyingAssetBreakdown.prototype.asset0 = null;
        PositionWithUnderlyingAssetBreakdown.prototype.asset1 = null;
        PositionWithUnderlyingAssetBreakdown.create = function create(
          properties
        ) {
          return new PositionWithUnderlyingAssetBreakdown(properties);
        };
        PositionWithUnderlyingAssetBreakdown.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.position != null && Object.hasOwnProperty.call(m, "position"))
            $root.osmosis.concentratedliquidity.v1beta1.Position.encode(
              m.position,
              w.uint32(10).fork()
            ).ldelim();
          if (m.asset0 != null && Object.hasOwnProperty.call(m, "asset0"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.asset0,
              w.uint32(18).fork()
            ).ldelim();
          if (m.asset1 != null && Object.hasOwnProperty.call(m, "asset1"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.asset1,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        PositionWithUnderlyingAssetBreakdown.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.PositionWithUnderlyingAssetBreakdown();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.position =
                  $root.osmosis.concentratedliquidity.v1beta1.Position.decode(
                    r,
                    r.uint32()
                  );
                break;
              case 2:
                m.asset0 = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              case 3:
                m.asset1 = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PositionWithUnderlyingAssetBreakdown.fromObject = function fromObject(
          d
        ) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .PositionWithUnderlyingAssetBreakdown
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.PositionWithUnderlyingAssetBreakdown();
          if (d.position != null) {
            if (typeof d.position !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.PositionWithUnderlyingAssetBreakdown.position: object expected"
              );
            m.position =
              $root.osmosis.concentratedliquidity.v1beta1.Position.fromObject(
                d.position
              );
          }
          if (d.asset0 != null) {
            if (typeof d.asset0 !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.PositionWithUnderlyingAssetBreakdown.asset0: object expected"
              );
            m.asset0 = $root.cosmos.base.v1beta1.Coin.fromObject(d.asset0);
          }
          if (d.asset1 != null) {
            if (typeof d.asset1 !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.PositionWithUnderlyingAssetBreakdown.asset1: object expected"
              );
            m.asset1 = $root.cosmos.base.v1beta1.Coin.fromObject(d.asset1);
          }
          return m;
        };
        PositionWithUnderlyingAssetBreakdown.toObject = function toObject(
          m,
          o
        ) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.position = null;
            d.asset0 = null;
            d.asset1 = null;
          }
          if (m.position != null && m.hasOwnProperty("position")) {
            d.position =
              $root.osmosis.concentratedliquidity.v1beta1.Position.toObject(
                m.position,
                o
              );
          }
          if (m.asset0 != null && m.hasOwnProperty("asset0")) {
            d.asset0 = $root.cosmos.base.v1beta1.Coin.toObject(m.asset0, o);
          }
          if (m.asset1 != null && m.hasOwnProperty("asset1")) {
            d.asset1 = $root.cosmos.base.v1beta1.Coin.toObject(m.asset1, o);
          }
          return d;
        };
        PositionWithUnderlyingAssetBreakdown.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return PositionWithUnderlyingAssetBreakdown;
      })();
      v1beta1.TickInfo = (function () {
        function TickInfo(p) {
          this.feeGrowthOutside = [];
          this.uptimeTrackers = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        TickInfo.prototype.liquidityGross = "";
        TickInfo.prototype.liquidityNet = "";
        TickInfo.prototype.feeGrowthOutside = $util.emptyArray;
        TickInfo.prototype.uptimeTrackers = $util.emptyArray;
        TickInfo.create = function create(properties) {
          return new TickInfo(properties);
        };
        TickInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.liquidityGross != null &&
            Object.hasOwnProperty.call(m, "liquidityGross")
          )
            w.uint32(10).string(m.liquidityGross);
          if (
            m.liquidityNet != null &&
            Object.hasOwnProperty.call(m, "liquidityNet")
          )
            w.uint32(18).string(m.liquidityNet);
          if (m.feeGrowthOutside != null && m.feeGrowthOutside.length) {
            for (var i = 0; i < m.feeGrowthOutside.length; ++i)
              $root.cosmos.base.v1beta1.DecCoin.encode(
                m.feeGrowthOutside[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          if (m.uptimeTrackers != null && m.uptimeTrackers.length) {
            for (var i = 0; i < m.uptimeTrackers.length; ++i)
              $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker.encode(
                m.uptimeTrackers[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          return w;
        };
        TickInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.concentratedliquidity.v1beta1.TickInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.liquidityGross = r.string();
                break;
              case 2:
                m.liquidityNet = r.string();
                break;
              case 3:
                if (!(m.feeGrowthOutside && m.feeGrowthOutside.length))
                  m.feeGrowthOutside = [];
                m.feeGrowthOutside.push(
                  $root.cosmos.base.v1beta1.DecCoin.decode(r, r.uint32())
                );
                break;
              case 4:
                if (!(m.uptimeTrackers && m.uptimeTrackers.length))
                  m.uptimeTrackers = [];
                m.uptimeTrackers.push(
                  $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        TickInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.osmosis.concentratedliquidity.v1beta1.TickInfo)
            return d;
          var m = new $root.osmosis.concentratedliquidity.v1beta1.TickInfo();
          if (d.liquidityGross != null) {
            m.liquidityGross = String(d.liquidityGross);
          }
          if (d.liquidityNet != null) {
            m.liquidityNet = String(d.liquidityNet);
          }
          if (d.feeGrowthOutside) {
            if (!Array.isArray(d.feeGrowthOutside))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.TickInfo.feeGrowthOutside: array expected"
              );
            m.feeGrowthOutside = [];
            for (var i = 0; i < d.feeGrowthOutside.length; ++i) {
              if (typeof d.feeGrowthOutside[i] !== "object")
                throw TypeError(
                  ".osmosis.concentratedliquidity.v1beta1.TickInfo.feeGrowthOutside: object expected"
                );
              m.feeGrowthOutside[i] =
                $root.cosmos.base.v1beta1.DecCoin.fromObject(
                  d.feeGrowthOutside[i]
                );
            }
          }
          if (d.uptimeTrackers) {
            if (!Array.isArray(d.uptimeTrackers))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.TickInfo.uptimeTrackers: array expected"
              );
            m.uptimeTrackers = [];
            for (var i = 0; i < d.uptimeTrackers.length; ++i) {
              if (typeof d.uptimeTrackers[i] !== "object")
                throw TypeError(
                  ".osmosis.concentratedliquidity.v1beta1.TickInfo.uptimeTrackers: object expected"
                );
              m.uptimeTrackers[i] =
                $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker.fromObject(
                  d.uptimeTrackers[i]
                );
            }
          }
          return m;
        };
        TickInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.feeGrowthOutside = [];
            d.uptimeTrackers = [];
          }
          if (o.defaults) {
            d.liquidityGross = "";
            d.liquidityNet = "";
          }
          if (m.liquidityGross != null && m.hasOwnProperty("liquidityGross")) {
            d.liquidityGross = m.liquidityGross;
          }
          if (m.liquidityNet != null && m.hasOwnProperty("liquidityNet")) {
            d.liquidityNet = m.liquidityNet;
          }
          if (m.feeGrowthOutside && m.feeGrowthOutside.length) {
            d.feeGrowthOutside = [];
            for (var j = 0; j < m.feeGrowthOutside.length; ++j) {
              d.feeGrowthOutside[j] =
                $root.cosmos.base.v1beta1.DecCoin.toObject(
                  m.feeGrowthOutside[j],
                  o
                );
            }
          }
          if (m.uptimeTrackers && m.uptimeTrackers.length) {
            d.uptimeTrackers = [];
            for (var j = 0; j < m.uptimeTrackers.length; ++j) {
              d.uptimeTrackers[j] =
                $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker.toObject(
                  m.uptimeTrackers[j],
                  o
                );
            }
          }
          return d;
        };
        TickInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return TickInfo;
      })();
      v1beta1.UptimeTracker = (function () {
        function UptimeTracker(p) {
          this.uptimeGrowthOutside = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        UptimeTracker.prototype.uptimeGrowthOutside = $util.emptyArray;
        UptimeTracker.create = function create(properties) {
          return new UptimeTracker(properties);
        };
        UptimeTracker.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.uptimeGrowthOutside != null && m.uptimeGrowthOutside.length) {
            for (var i = 0; i < m.uptimeGrowthOutside.length; ++i)
              $root.cosmos.base.v1beta1.DecCoin.encode(
                m.uptimeGrowthOutside[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        UptimeTracker.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.uptimeGrowthOutside && m.uptimeGrowthOutside.length))
                  m.uptimeGrowthOutside = [];
                m.uptimeGrowthOutside.push(
                  $root.cosmos.base.v1beta1.DecCoin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        UptimeTracker.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.UptimeTracker();
          if (d.uptimeGrowthOutside) {
            if (!Array.isArray(d.uptimeGrowthOutside))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.UptimeTracker.uptimeGrowthOutside: array expected"
              );
            m.uptimeGrowthOutside = [];
            for (var i = 0; i < d.uptimeGrowthOutside.length; ++i) {
              if (typeof d.uptimeGrowthOutside[i] !== "object")
                throw TypeError(
                  ".osmosis.concentratedliquidity.v1beta1.UptimeTracker.uptimeGrowthOutside: object expected"
                );
              m.uptimeGrowthOutside[i] =
                $root.cosmos.base.v1beta1.DecCoin.fromObject(
                  d.uptimeGrowthOutside[i]
                );
            }
          }
          return m;
        };
        UptimeTracker.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.uptimeGrowthOutside = [];
          }
          if (m.uptimeGrowthOutside && m.uptimeGrowthOutside.length) {
            d.uptimeGrowthOutside = [];
            for (var j = 0; j < m.uptimeGrowthOutside.length; ++j) {
              d.uptimeGrowthOutside[j] =
                $root.cosmos.base.v1beta1.DecCoin.toObject(
                  m.uptimeGrowthOutside[j],
                  o
                );
            }
          }
          return d;
        };
        UptimeTracker.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return UptimeTracker;
      })();
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.createPosition = function createPosition(
            request,
            callback
          ) {
            return this.rpcCall(
              createPosition,
              $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePosition,
              $root.osmosis.concentratedliquidity.v1beta1
                .MsgCreatePositionResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "CreatePosition" }
        );
        Object.defineProperty(
          (Msg.prototype.withdrawPosition = function withdrawPosition(
            request,
            callback
          ) {
            return this.rpcCall(
              withdrawPosition,
              $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition,
              $root.osmosis.concentratedliquidity.v1beta1
                .MsgWithdrawPositionResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "WithdrawPosition" }
        );
        Object.defineProperty(
          (Msg.prototype.collectFees = function collectFees(request, callback) {
            return this.rpcCall(
              collectFees,
              $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFees,
              $root.osmosis.concentratedliquidity.v1beta1
                .MsgCollectFeesResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "CollectFees" }
        );
        Object.defineProperty(
          (Msg.prototype.collectIncentives = function collectIncentives(
            request,
            callback
          ) {
            return this.rpcCall(
              collectIncentives,
              $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives,
              $root.osmosis.concentratedliquidity.v1beta1
                .MsgCollectIncentivesResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "CollectIncentives" }
        );
        Object.defineProperty(
          (Msg.prototype.fungifyChargedPositions =
            function fungifyChargedPositions(request, callback) {
              return this.rpcCall(
                fungifyChargedPositions,
                $root.osmosis.concentratedliquidity.v1beta1
                  .MsgFungifyChargedPositions,
                $root.osmosis.concentratedliquidity.v1beta1
                  .MsgFungifyChargedPositionsResponse,
                request,
                callback
              );
            }),
          "name",
          { value: "FungifyChargedPositions" }
        );
        return Msg;
      })();
      v1beta1.MsgCreatePosition = (function () {
        function MsgCreatePosition(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreatePosition.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgCreatePosition.prototype.sender = "";
        MsgCreatePosition.prototype.lowerTick = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        MsgCreatePosition.prototype.upperTick = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        MsgCreatePosition.prototype.tokenDesired0 = null;
        MsgCreatePosition.prototype.tokenDesired1 = null;
        MsgCreatePosition.prototype.tokenMinAmount0 = "";
        MsgCreatePosition.prototype.tokenMinAmount1 = "";
        MsgCreatePosition.create = function create(properties) {
          return new MsgCreatePosition(properties);
        };
        MsgCreatePosition.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          if (m.lowerTick != null && Object.hasOwnProperty.call(m, "lowerTick"))
            w.uint32(24).int64(m.lowerTick);
          if (m.upperTick != null && Object.hasOwnProperty.call(m, "upperTick"))
            w.uint32(32).int64(m.upperTick);
          if (
            m.tokenDesired0 != null &&
            Object.hasOwnProperty.call(m, "tokenDesired0")
          )
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenDesired0,
              w.uint32(42).fork()
            ).ldelim();
          if (
            m.tokenDesired1 != null &&
            Object.hasOwnProperty.call(m, "tokenDesired1")
          )
            $root.cosmos.base.v1beta1.Coin.encode(
              m.tokenDesired1,
              w.uint32(50).fork()
            ).ldelim();
          if (
            m.tokenMinAmount0 != null &&
            Object.hasOwnProperty.call(m, "tokenMinAmount0")
          )
            w.uint32(58).string(m.tokenMinAmount0);
          if (
            m.tokenMinAmount1 != null &&
            Object.hasOwnProperty.call(m, "tokenMinAmount1")
          )
            w.uint32(66).string(m.tokenMinAmount1);
          return w;
        };
        MsgCreatePosition.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePosition();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              case 2:
                m.sender = r.string();
                break;
              case 3:
                m.lowerTick = r.int64();
                break;
              case 4:
                m.upperTick = r.int64();
                break;
              case 5:
                m.tokenDesired0 = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 6:
                m.tokenDesired1 = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              case 7:
                m.tokenMinAmount0 = r.string();
                break;
              case 8:
                m.tokenMinAmount1 = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreatePosition.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePosition
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePosition();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.lowerTick != null) {
            if ($util.Long)
              (m.lowerTick = $util.Long.fromValue(
                d.lowerTick
              )).unsigned = false;
            else if (typeof d.lowerTick === "string")
              m.lowerTick = parseInt(d.lowerTick, 10);
            else if (typeof d.lowerTick === "number") m.lowerTick = d.lowerTick;
            else if (typeof d.lowerTick === "object")
              m.lowerTick = new $util.LongBits(
                d.lowerTick.low >>> 0,
                d.lowerTick.high >>> 0
              ).toNumber();
          }
          if (d.upperTick != null) {
            if ($util.Long)
              (m.upperTick = $util.Long.fromValue(
                d.upperTick
              )).unsigned = false;
            else if (typeof d.upperTick === "string")
              m.upperTick = parseInt(d.upperTick, 10);
            else if (typeof d.upperTick === "number") m.upperTick = d.upperTick;
            else if (typeof d.upperTick === "object")
              m.upperTick = new $util.LongBits(
                d.upperTick.low >>> 0,
                d.upperTick.high >>> 0
              ).toNumber();
          }
          if (d.tokenDesired0 != null) {
            if (typeof d.tokenDesired0 !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreatePosition.tokenDesired0: object expected"
              );
            m.tokenDesired0 = $root.cosmos.base.v1beta1.Coin.fromObject(
              d.tokenDesired0
            );
          }
          if (d.tokenDesired1 != null) {
            if (typeof d.tokenDesired1 !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreatePosition.tokenDesired1: object expected"
              );
            m.tokenDesired1 = $root.cosmos.base.v1beta1.Coin.fromObject(
              d.tokenDesired1
            );
          }
          if (d.tokenMinAmount0 != null) {
            m.tokenMinAmount0 = String(d.tokenMinAmount0);
          }
          if (d.tokenMinAmount1 != null) {
            m.tokenMinAmount1 = String(d.tokenMinAmount1);
          }
          return m;
        };
        MsgCreatePosition.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.sender = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.lowerTick =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.lowerTick = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.upperTick =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.upperTick = o.longs === String ? "0" : 0;
            d.tokenDesired0 = null;
            d.tokenDesired1 = null;
            d.tokenMinAmount0 = "";
            d.tokenMinAmount1 = "";
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.lowerTick != null && m.hasOwnProperty("lowerTick")) {
            if (typeof m.lowerTick === "number")
              d.lowerTick =
                o.longs === String ? String(m.lowerTick) : m.lowerTick;
            else
              d.lowerTick =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.lowerTick)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.lowerTick.low >>> 0,
                      m.lowerTick.high >>> 0
                    ).toNumber()
                  : m.lowerTick;
          }
          if (m.upperTick != null && m.hasOwnProperty("upperTick")) {
            if (typeof m.upperTick === "number")
              d.upperTick =
                o.longs === String ? String(m.upperTick) : m.upperTick;
            else
              d.upperTick =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.upperTick)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.upperTick.low >>> 0,
                      m.upperTick.high >>> 0
                    ).toNumber()
                  : m.upperTick;
          }
          if (m.tokenDesired0 != null && m.hasOwnProperty("tokenDesired0")) {
            d.tokenDesired0 = $root.cosmos.base.v1beta1.Coin.toObject(
              m.tokenDesired0,
              o
            );
          }
          if (m.tokenDesired1 != null && m.hasOwnProperty("tokenDesired1")) {
            d.tokenDesired1 = $root.cosmos.base.v1beta1.Coin.toObject(
              m.tokenDesired1,
              o
            );
          }
          if (
            m.tokenMinAmount0 != null &&
            m.hasOwnProperty("tokenMinAmount0")
          ) {
            d.tokenMinAmount0 = m.tokenMinAmount0;
          }
          if (
            m.tokenMinAmount1 != null &&
            m.hasOwnProperty("tokenMinAmount1")
          ) {
            d.tokenMinAmount1 = m.tokenMinAmount1;
          }
          return d;
        };
        MsgCreatePosition.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreatePosition;
      })();
      v1beta1.MsgCreatePositionResponse = (function () {
        function MsgCreatePositionResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreatePositionResponse.prototype.positionId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgCreatePositionResponse.prototype.amount0 = "";
        MsgCreatePositionResponse.prototype.amount1 = "";
        MsgCreatePositionResponse.prototype.joinTime = null;
        MsgCreatePositionResponse.prototype.liquidityCreated = "";
        MsgCreatePositionResponse.create = function create(properties) {
          return new MsgCreatePositionResponse(properties);
        };
        MsgCreatePositionResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.positionId != null &&
            Object.hasOwnProperty.call(m, "positionId")
          )
            w.uint32(8).uint64(m.positionId);
          if (m.amount0 != null && Object.hasOwnProperty.call(m, "amount0"))
            w.uint32(18).string(m.amount0);
          if (m.amount1 != null && Object.hasOwnProperty.call(m, "amount1"))
            w.uint32(26).string(m.amount1);
          if (m.joinTime != null && Object.hasOwnProperty.call(m, "joinTime"))
            $root.google.protobuf.Timestamp.encode(
              m.joinTime,
              w.uint32(34).fork()
            ).ldelim();
          if (
            m.liquidityCreated != null &&
            Object.hasOwnProperty.call(m, "liquidityCreated")
          )
            w.uint32(42).string(m.liquidityCreated);
          return w;
        };
        MsgCreatePositionResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.positionId = r.uint64();
                break;
              case 2:
                m.amount0 = r.string();
                break;
              case 3:
                m.amount1 = r.string();
                break;
              case 4:
                m.joinTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 5:
                m.liquidityCreated = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreatePositionResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgCreatePositionResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse();
          if (d.positionId != null) {
            if ($util.Long)
              (m.positionId = $util.Long.fromValue(
                d.positionId
              )).unsigned = true;
            else if (typeof d.positionId === "string")
              m.positionId = parseInt(d.positionId, 10);
            else if (typeof d.positionId === "number")
              m.positionId = d.positionId;
            else if (typeof d.positionId === "object")
              m.positionId = new $util.LongBits(
                d.positionId.low >>> 0,
                d.positionId.high >>> 0
              ).toNumber(true);
          }
          if (d.amount0 != null) {
            m.amount0 = String(d.amount0);
          }
          if (d.amount1 != null) {
            m.amount1 = String(d.amount1);
          }
          if (d.joinTime != null) {
            if (typeof d.joinTime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse.joinTime: object expected"
              );
            m.joinTime = $root.google.protobuf.Timestamp.fromObject(d.joinTime);
          }
          if (d.liquidityCreated != null) {
            m.liquidityCreated = String(d.liquidityCreated);
          }
          return m;
        };
        MsgCreatePositionResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.positionId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.positionId = o.longs === String ? "0" : 0;
            d.amount0 = "";
            d.amount1 = "";
            d.joinTime = null;
            d.liquidityCreated = "";
          }
          if (m.positionId != null && m.hasOwnProperty("positionId")) {
            if (typeof m.positionId === "number")
              d.positionId =
                o.longs === String ? String(m.positionId) : m.positionId;
            else
              d.positionId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.positionId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.positionId.low >>> 0,
                      m.positionId.high >>> 0
                    ).toNumber(true)
                  : m.positionId;
          }
          if (m.amount0 != null && m.hasOwnProperty("amount0")) {
            d.amount0 = m.amount0;
          }
          if (m.amount1 != null && m.hasOwnProperty("amount1")) {
            d.amount1 = m.amount1;
          }
          if (m.joinTime != null && m.hasOwnProperty("joinTime")) {
            d.joinTime = $root.google.protobuf.Timestamp.toObject(
              m.joinTime,
              o
            );
          }
          if (
            m.liquidityCreated != null &&
            m.hasOwnProperty("liquidityCreated")
          ) {
            d.liquidityCreated = m.liquidityCreated;
          }
          return d;
        };
        MsgCreatePositionResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreatePositionResponse;
      })();
      v1beta1.MsgWithdrawPosition = (function () {
        function MsgWithdrawPosition(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgWithdrawPosition.prototype.positionId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgWithdrawPosition.prototype.sender = "";
        MsgWithdrawPosition.prototype.liquidityAmount = "";
        MsgWithdrawPosition.create = function create(properties) {
          return new MsgWithdrawPosition(properties);
        };
        MsgWithdrawPosition.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.positionId != null &&
            Object.hasOwnProperty.call(m, "positionId")
          )
            w.uint32(8).uint64(m.positionId);
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          if (
            m.liquidityAmount != null &&
            Object.hasOwnProperty.call(m, "liquidityAmount")
          )
            w.uint32(26).string(m.liquidityAmount);
          return w;
        };
        MsgWithdrawPosition.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.positionId = r.uint64();
                break;
              case 2:
                m.sender = r.string();
                break;
              case 3:
                m.liquidityAmount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgWithdrawPosition.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition();
          if (d.positionId != null) {
            if ($util.Long)
              (m.positionId = $util.Long.fromValue(
                d.positionId
              )).unsigned = true;
            else if (typeof d.positionId === "string")
              m.positionId = parseInt(d.positionId, 10);
            else if (typeof d.positionId === "number")
              m.positionId = d.positionId;
            else if (typeof d.positionId === "object")
              m.positionId = new $util.LongBits(
                d.positionId.low >>> 0,
                d.positionId.high >>> 0
              ).toNumber(true);
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.liquidityAmount != null) {
            m.liquidityAmount = String(d.liquidityAmount);
          }
          return m;
        };
        MsgWithdrawPosition.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.positionId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.positionId = o.longs === String ? "0" : 0;
            d.sender = "";
            d.liquidityAmount = "";
          }
          if (m.positionId != null && m.hasOwnProperty("positionId")) {
            if (typeof m.positionId === "number")
              d.positionId =
                o.longs === String ? String(m.positionId) : m.positionId;
            else
              d.positionId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.positionId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.positionId.low >>> 0,
                      m.positionId.high >>> 0
                    ).toNumber(true)
                  : m.positionId;
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (
            m.liquidityAmount != null &&
            m.hasOwnProperty("liquidityAmount")
          ) {
            d.liquidityAmount = m.liquidityAmount;
          }
          return d;
        };
        MsgWithdrawPosition.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgWithdrawPosition;
      })();
      v1beta1.MsgWithdrawPositionResponse = (function () {
        function MsgWithdrawPositionResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgWithdrawPositionResponse.prototype.amount0 = "";
        MsgWithdrawPositionResponse.prototype.amount1 = "";
        MsgWithdrawPositionResponse.create = function create(properties) {
          return new MsgWithdrawPositionResponse(properties);
        };
        MsgWithdrawPositionResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.amount0 != null && Object.hasOwnProperty.call(m, "amount0"))
            w.uint32(10).string(m.amount0);
          if (m.amount1 != null && Object.hasOwnProperty.call(m, "amount1"))
            w.uint32(18).string(m.amount1);
          return w;
        };
        MsgWithdrawPositionResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.amount0 = r.string();
                break;
              case 2:
                m.amount1 = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgWithdrawPositionResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgWithdrawPositionResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse();
          if (d.amount0 != null) {
            m.amount0 = String(d.amount0);
          }
          if (d.amount1 != null) {
            m.amount1 = String(d.amount1);
          }
          return m;
        };
        MsgWithdrawPositionResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.amount0 = "";
            d.amount1 = "";
          }
          if (m.amount0 != null && m.hasOwnProperty("amount0")) {
            d.amount0 = m.amount0;
          }
          if (m.amount1 != null && m.hasOwnProperty("amount1")) {
            d.amount1 = m.amount1;
          }
          return d;
        };
        MsgWithdrawPositionResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgWithdrawPositionResponse;
      })();
      v1beta1.MsgCollectFees = (function () {
        function MsgCollectFees(p) {
          this.positionIds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCollectFees.prototype.positionIds = $util.emptyArray;
        MsgCollectFees.prototype.sender = "";
        MsgCollectFees.create = function create(properties) {
          return new MsgCollectFees(properties);
        };
        MsgCollectFees.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.positionIds != null && m.positionIds.length) {
            w.uint32(10).fork();
            for (var i = 0; i < m.positionIds.length; ++i)
              w.uint64(m.positionIds[i]);
            w.ldelim();
          }
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          return w;
        };
        MsgCollectFees.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFees();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.positionIds && m.positionIds.length))
                  m.positionIds = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.positionIds.push(r.uint64());
                } else m.positionIds.push(r.uint64());
                break;
              case 2:
                m.sender = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCollectFees.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFees
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFees();
          if (d.positionIds) {
            if (!Array.isArray(d.positionIds))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCollectFees.positionIds: array expected"
              );
            m.positionIds = [];
            for (var i = 0; i < d.positionIds.length; ++i) {
              if ($util.Long)
                (m.positionIds[i] = $util.Long.fromValue(
                  d.positionIds[i]
                )).unsigned = true;
              else if (typeof d.positionIds[i] === "string")
                m.positionIds[i] = parseInt(d.positionIds[i], 10);
              else if (typeof d.positionIds[i] === "number")
                m.positionIds[i] = d.positionIds[i];
              else if (typeof d.positionIds[i] === "object")
                m.positionIds[i] = new $util.LongBits(
                  d.positionIds[i].low >>> 0,
                  d.positionIds[i].high >>> 0
                ).toNumber(true);
            }
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          return m;
        };
        MsgCollectFees.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.positionIds = [];
          }
          if (o.defaults) {
            d.sender = "";
          }
          if (m.positionIds && m.positionIds.length) {
            d.positionIds = [];
            for (var j = 0; j < m.positionIds.length; ++j) {
              if (typeof m.positionIds[j] === "number")
                d.positionIds[j] =
                  o.longs === String
                    ? String(m.positionIds[j])
                    : m.positionIds[j];
              else
                d.positionIds[j] =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.positionIds[j])
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.positionIds[j].low >>> 0,
                        m.positionIds[j].high >>> 0
                      ).toNumber(true)
                    : m.positionIds[j];
            }
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          return d;
        };
        MsgCollectFees.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCollectFees;
      })();
      v1beta1.MsgCollectFeesResponse = (function () {
        function MsgCollectFeesResponse(p) {
          this.collectedFees = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCollectFeesResponse.prototype.collectedFees = $util.emptyArray;
        MsgCollectFeesResponse.create = function create(properties) {
          return new MsgCollectFeesResponse(properties);
        };
        MsgCollectFeesResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.collectedFees != null && m.collectedFees.length) {
            for (var i = 0; i < m.collectedFees.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.collectedFees[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        MsgCollectFeesResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.collectedFees && m.collectedFees.length))
                  m.collectedFees = [];
                m.collectedFees.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCollectFeesResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse();
          if (d.collectedFees) {
            if (!Array.isArray(d.collectedFees))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse.collectedFees: array expected"
              );
            m.collectedFees = [];
            for (var i = 0; i < d.collectedFees.length; ++i) {
              if (typeof d.collectedFees[i] !== "object")
                throw TypeError(
                  ".osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse.collectedFees: object expected"
                );
              m.collectedFees[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.collectedFees[i]
              );
            }
          }
          return m;
        };
        MsgCollectFeesResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.collectedFees = [];
          }
          if (m.collectedFees && m.collectedFees.length) {
            d.collectedFees = [];
            for (var j = 0; j < m.collectedFees.length; ++j) {
              d.collectedFees[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.collectedFees[j],
                o
              );
            }
          }
          return d;
        };
        MsgCollectFeesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCollectFeesResponse;
      })();
      v1beta1.MsgCollectIncentives = (function () {
        function MsgCollectIncentives(p) {
          this.positionIds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCollectIncentives.prototype.positionIds = $util.emptyArray;
        MsgCollectIncentives.prototype.sender = "";
        MsgCollectIncentives.create = function create(properties) {
          return new MsgCollectIncentives(properties);
        };
        MsgCollectIncentives.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.positionIds != null && m.positionIds.length) {
            w.uint32(10).fork();
            for (var i = 0; i < m.positionIds.length; ++i)
              w.uint64(m.positionIds[i]);
            w.ldelim();
          }
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          return w;
        };
        MsgCollectIncentives.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.positionIds && m.positionIds.length))
                  m.positionIds = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.positionIds.push(r.uint64());
                } else m.positionIds.push(r.uint64());
                break;
              case 2:
                m.sender = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCollectIncentives.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives();
          if (d.positionIds) {
            if (!Array.isArray(d.positionIds))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives.positionIds: array expected"
              );
            m.positionIds = [];
            for (var i = 0; i < d.positionIds.length; ++i) {
              if ($util.Long)
                (m.positionIds[i] = $util.Long.fromValue(
                  d.positionIds[i]
                )).unsigned = true;
              else if (typeof d.positionIds[i] === "string")
                m.positionIds[i] = parseInt(d.positionIds[i], 10);
              else if (typeof d.positionIds[i] === "number")
                m.positionIds[i] = d.positionIds[i];
              else if (typeof d.positionIds[i] === "object")
                m.positionIds[i] = new $util.LongBits(
                  d.positionIds[i].low >>> 0,
                  d.positionIds[i].high >>> 0
                ).toNumber(true);
            }
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          return m;
        };
        MsgCollectIncentives.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.positionIds = [];
          }
          if (o.defaults) {
            d.sender = "";
          }
          if (m.positionIds && m.positionIds.length) {
            d.positionIds = [];
            for (var j = 0; j < m.positionIds.length; ++j) {
              if (typeof m.positionIds[j] === "number")
                d.positionIds[j] =
                  o.longs === String
                    ? String(m.positionIds[j])
                    : m.positionIds[j];
              else
                d.positionIds[j] =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.positionIds[j])
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.positionIds[j].low >>> 0,
                        m.positionIds[j].high >>> 0
                      ).toNumber(true)
                    : m.positionIds[j];
            }
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          return d;
        };
        MsgCollectIncentives.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCollectIncentives;
      })();
      v1beta1.MsgCollectIncentivesResponse = (function () {
        function MsgCollectIncentivesResponse(p) {
          this.collectedIncentives = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCollectIncentivesResponse.prototype.collectedIncentives =
          $util.emptyArray;
        MsgCollectIncentivesResponse.create = function create(properties) {
          return new MsgCollectIncentivesResponse(properties);
        };
        MsgCollectIncentivesResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.collectedIncentives != null && m.collectedIncentives.length) {
            for (var i = 0; i < m.collectedIncentives.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.collectedIncentives[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        MsgCollectIncentivesResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.collectedIncentives && m.collectedIncentives.length))
                  m.collectedIncentives = [];
                m.collectedIncentives.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCollectIncentivesResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgCollectIncentivesResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse();
          if (d.collectedIncentives) {
            if (!Array.isArray(d.collectedIncentives))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse.collectedIncentives: array expected"
              );
            m.collectedIncentives = [];
            for (var i = 0; i < d.collectedIncentives.length; ++i) {
              if (typeof d.collectedIncentives[i] !== "object")
                throw TypeError(
                  ".osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse.collectedIncentives: object expected"
                );
              m.collectedIncentives[i] =
                $root.cosmos.base.v1beta1.Coin.fromObject(
                  d.collectedIncentives[i]
                );
            }
          }
          return m;
        };
        MsgCollectIncentivesResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.collectedIncentives = [];
          }
          if (m.collectedIncentives && m.collectedIncentives.length) {
            d.collectedIncentives = [];
            for (var j = 0; j < m.collectedIncentives.length; ++j) {
              d.collectedIncentives[j] =
                $root.cosmos.base.v1beta1.Coin.toObject(
                  m.collectedIncentives[j],
                  o
                );
            }
          }
          return d;
        };
        MsgCollectIncentivesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCollectIncentivesResponse;
      })();
      v1beta1.MsgCreateIncentive = (function () {
        function MsgCreateIncentive(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateIncentive.prototype.poolId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgCreateIncentive.prototype.sender = "";
        MsgCreateIncentive.prototype.incentiveDenom = "";
        MsgCreateIncentive.prototype.incentiveAmount = "";
        MsgCreateIncentive.prototype.emissionRate = "";
        MsgCreateIncentive.prototype.startTime = null;
        MsgCreateIncentive.prototype.minUptime = null;
        MsgCreateIncentive.create = function create(properties) {
          return new MsgCreateIncentive(properties);
        };
        MsgCreateIncentive.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
            w.uint32(8).uint64(m.poolId);
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          if (
            m.incentiveDenom != null &&
            Object.hasOwnProperty.call(m, "incentiveDenom")
          )
            w.uint32(26).string(m.incentiveDenom);
          if (
            m.incentiveAmount != null &&
            Object.hasOwnProperty.call(m, "incentiveAmount")
          )
            w.uint32(34).string(m.incentiveAmount);
          if (
            m.emissionRate != null &&
            Object.hasOwnProperty.call(m, "emissionRate")
          )
            w.uint32(42).string(m.emissionRate);
          if (m.startTime != null && Object.hasOwnProperty.call(m, "startTime"))
            $root.google.protobuf.Timestamp.encode(
              m.startTime,
              w.uint32(50).fork()
            ).ldelim();
          if (m.minUptime != null && Object.hasOwnProperty.call(m, "minUptime"))
            $root.google.protobuf.Duration.encode(
              m.minUptime,
              w.uint32(58).fork()
            ).ldelim();
          return w;
        };
        MsgCreateIncentive.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.poolId = r.uint64();
                break;
              case 2:
                m.sender = r.string();
                break;
              case 3:
                m.incentiveDenom = r.string();
                break;
              case 4:
                m.incentiveAmount = r.string();
                break;
              case 5:
                m.emissionRate = r.string();
                break;
              case 6:
                m.startTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 7:
                m.minUptime = $root.google.protobuf.Duration.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateIncentive.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive();
          if (d.poolId != null) {
            if ($util.Long)
              (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
            else if (typeof d.poolId === "string")
              m.poolId = parseInt(d.poolId, 10);
            else if (typeof d.poolId === "number") m.poolId = d.poolId;
            else if (typeof d.poolId === "object")
              m.poolId = new $util.LongBits(
                d.poolId.low >>> 0,
                d.poolId.high >>> 0
              ).toNumber(true);
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          if (d.incentiveDenom != null) {
            m.incentiveDenom = String(d.incentiveDenom);
          }
          if (d.incentiveAmount != null) {
            m.incentiveAmount = String(d.incentiveAmount);
          }
          if (d.emissionRate != null) {
            m.emissionRate = String(d.emissionRate);
          }
          if (d.startTime != null) {
            if (typeof d.startTime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive.startTime: object expected"
              );
            m.startTime = $root.google.protobuf.Timestamp.fromObject(
              d.startTime
            );
          }
          if (d.minUptime != null) {
            if (typeof d.minUptime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive.minUptime: object expected"
              );
            m.minUptime = $root.google.protobuf.Duration.fromObject(
              d.minUptime
            );
          }
          return m;
        };
        MsgCreateIncentive.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.poolId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.poolId = o.longs === String ? "0" : 0;
            d.sender = "";
            d.incentiveDenom = "";
            d.incentiveAmount = "";
            d.emissionRate = "";
            d.startTime = null;
            d.minUptime = null;
          }
          if (m.poolId != null && m.hasOwnProperty("poolId")) {
            if (typeof m.poolId === "number")
              d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
            else
              d.poolId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.poolId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.poolId.low >>> 0,
                      m.poolId.high >>> 0
                    ).toNumber(true)
                  : m.poolId;
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          if (m.incentiveDenom != null && m.hasOwnProperty("incentiveDenom")) {
            d.incentiveDenom = m.incentiveDenom;
          }
          if (
            m.incentiveAmount != null &&
            m.hasOwnProperty("incentiveAmount")
          ) {
            d.incentiveAmount = m.incentiveAmount;
          }
          if (m.emissionRate != null && m.hasOwnProperty("emissionRate")) {
            d.emissionRate = m.emissionRate;
          }
          if (m.startTime != null && m.hasOwnProperty("startTime")) {
            d.startTime = $root.google.protobuf.Timestamp.toObject(
              m.startTime,
              o
            );
          }
          if (m.minUptime != null && m.hasOwnProperty("minUptime")) {
            d.minUptime = $root.google.protobuf.Duration.toObject(
              m.minUptime,
              o
            );
          }
          return d;
        };
        MsgCreateIncentive.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateIncentive;
      })();
      v1beta1.MsgCreateIncentiveResponse = (function () {
        function MsgCreateIncentiveResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateIncentiveResponse.prototype.incentiveDenom = "";
        MsgCreateIncentiveResponse.prototype.incentiveAmount = "";
        MsgCreateIncentiveResponse.prototype.emissionRate = "";
        MsgCreateIncentiveResponse.prototype.startTime = null;
        MsgCreateIncentiveResponse.prototype.minUptime = null;
        MsgCreateIncentiveResponse.create = function create(properties) {
          return new MsgCreateIncentiveResponse(properties);
        };
        MsgCreateIncentiveResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.incentiveDenom != null &&
            Object.hasOwnProperty.call(m, "incentiveDenom")
          )
            w.uint32(10).string(m.incentiveDenom);
          if (
            m.incentiveAmount != null &&
            Object.hasOwnProperty.call(m, "incentiveAmount")
          )
            w.uint32(18).string(m.incentiveAmount);
          if (
            m.emissionRate != null &&
            Object.hasOwnProperty.call(m, "emissionRate")
          )
            w.uint32(26).string(m.emissionRate);
          if (m.startTime != null && Object.hasOwnProperty.call(m, "startTime"))
            $root.google.protobuf.Timestamp.encode(
              m.startTime,
              w.uint32(34).fork()
            ).ldelim();
          if (m.minUptime != null && Object.hasOwnProperty.call(m, "minUptime"))
            $root.google.protobuf.Duration.encode(
              m.minUptime,
              w.uint32(42).fork()
            ).ldelim();
          return w;
        };
        MsgCreateIncentiveResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.incentiveDenom = r.string();
                break;
              case 2:
                m.incentiveAmount = r.string();
                break;
              case 3:
                m.emissionRate = r.string();
                break;
              case 4:
                m.startTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 5:
                m.minUptime = $root.google.protobuf.Duration.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateIncentiveResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgCreateIncentiveResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse();
          if (d.incentiveDenom != null) {
            m.incentiveDenom = String(d.incentiveDenom);
          }
          if (d.incentiveAmount != null) {
            m.incentiveAmount = String(d.incentiveAmount);
          }
          if (d.emissionRate != null) {
            m.emissionRate = String(d.emissionRate);
          }
          if (d.startTime != null) {
            if (typeof d.startTime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse.startTime: object expected"
              );
            m.startTime = $root.google.protobuf.Timestamp.fromObject(
              d.startTime
            );
          }
          if (d.minUptime != null) {
            if (typeof d.minUptime !== "object")
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse.minUptime: object expected"
              );
            m.minUptime = $root.google.protobuf.Duration.fromObject(
              d.minUptime
            );
          }
          return m;
        };
        MsgCreateIncentiveResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.incentiveDenom = "";
            d.incentiveAmount = "";
            d.emissionRate = "";
            d.startTime = null;
            d.minUptime = null;
          }
          if (m.incentiveDenom != null && m.hasOwnProperty("incentiveDenom")) {
            d.incentiveDenom = m.incentiveDenom;
          }
          if (
            m.incentiveAmount != null &&
            m.hasOwnProperty("incentiveAmount")
          ) {
            d.incentiveAmount = m.incentiveAmount;
          }
          if (m.emissionRate != null && m.hasOwnProperty("emissionRate")) {
            d.emissionRate = m.emissionRate;
          }
          if (m.startTime != null && m.hasOwnProperty("startTime")) {
            d.startTime = $root.google.protobuf.Timestamp.toObject(
              m.startTime,
              o
            );
          }
          if (m.minUptime != null && m.hasOwnProperty("minUptime")) {
            d.minUptime = $root.google.protobuf.Duration.toObject(
              m.minUptime,
              o
            );
          }
          return d;
        };
        MsgCreateIncentiveResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateIncentiveResponse;
      })();
      v1beta1.MsgFungifyChargedPositions = (function () {
        function MsgFungifyChargedPositions(p) {
          this.positionIds = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgFungifyChargedPositions.prototype.positionIds = $util.emptyArray;
        MsgFungifyChargedPositions.prototype.sender = "";
        MsgFungifyChargedPositions.create = function create(properties) {
          return new MsgFungifyChargedPositions(properties);
        };
        MsgFungifyChargedPositions.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.positionIds != null && m.positionIds.length) {
            w.uint32(10).fork();
            for (var i = 0; i < m.positionIds.length; ++i)
              w.uint64(m.positionIds[i]);
            w.ldelim();
          }
          if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
            w.uint32(18).string(m.sender);
          return w;
        };
        MsgFungifyChargedPositions.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.positionIds && m.positionIds.length))
                  m.positionIds = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.positionIds.push(r.uint64());
                } else m.positionIds.push(r.uint64());
                break;
              case 2:
                m.sender = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgFungifyChargedPositions.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgFungifyChargedPositions
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions();
          if (d.positionIds) {
            if (!Array.isArray(d.positionIds))
              throw TypeError(
                ".osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions.positionIds: array expected"
              );
            m.positionIds = [];
            for (var i = 0; i < d.positionIds.length; ++i) {
              if ($util.Long)
                (m.positionIds[i] = $util.Long.fromValue(
                  d.positionIds[i]
                )).unsigned = true;
              else if (typeof d.positionIds[i] === "string")
                m.positionIds[i] = parseInt(d.positionIds[i], 10);
              else if (typeof d.positionIds[i] === "number")
                m.positionIds[i] = d.positionIds[i];
              else if (typeof d.positionIds[i] === "object")
                m.positionIds[i] = new $util.LongBits(
                  d.positionIds[i].low >>> 0,
                  d.positionIds[i].high >>> 0
                ).toNumber(true);
            }
          }
          if (d.sender != null) {
            m.sender = String(d.sender);
          }
          return m;
        };
        MsgFungifyChargedPositions.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.positionIds = [];
          }
          if (o.defaults) {
            d.sender = "";
          }
          if (m.positionIds && m.positionIds.length) {
            d.positionIds = [];
            for (var j = 0; j < m.positionIds.length; ++j) {
              if (typeof m.positionIds[j] === "number")
                d.positionIds[j] =
                  o.longs === String
                    ? String(m.positionIds[j])
                    : m.positionIds[j];
              else
                d.positionIds[j] =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.positionIds[j])
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.positionIds[j].low >>> 0,
                        m.positionIds[j].high >>> 0
                      ).toNumber(true)
                    : m.positionIds[j];
            }
          }
          if (m.sender != null && m.hasOwnProperty("sender")) {
            d.sender = m.sender;
          }
          return d;
        };
        MsgFungifyChargedPositions.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgFungifyChargedPositions;
      })();
      v1beta1.MsgFungifyChargedPositionsResponse = (function () {
        function MsgFungifyChargedPositionsResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgFungifyChargedPositionsResponse.prototype.newPositionId = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        MsgFungifyChargedPositionsResponse.create = function create(
          properties
        ) {
          return new MsgFungifyChargedPositionsResponse(properties);
        };
        MsgFungifyChargedPositionsResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.newPositionId != null &&
            Object.hasOwnProperty.call(m, "newPositionId")
          )
            w.uint32(8).uint64(m.newPositionId);
          return w;
        };
        MsgFungifyChargedPositionsResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m =
              new $root.osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.newPositionId = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgFungifyChargedPositionsResponse.fromObject = function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.concentratedliquidity.v1beta1
              .MsgFungifyChargedPositionsResponse
          )
            return d;
          var m =
            new $root.osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse();
          if (d.newPositionId != null) {
            if ($util.Long)
              (m.newPositionId = $util.Long.fromValue(
                d.newPositionId
              )).unsigned = true;
            else if (typeof d.newPositionId === "string")
              m.newPositionId = parseInt(d.newPositionId, 10);
            else if (typeof d.newPositionId === "number")
              m.newPositionId = d.newPositionId;
            else if (typeof d.newPositionId === "object")
              m.newPositionId = new $util.LongBits(
                d.newPositionId.low >>> 0,
                d.newPositionId.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        MsgFungifyChargedPositionsResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.newPositionId =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.newPositionId = o.longs === String ? "0" : 0;
          }
          if (m.newPositionId != null && m.hasOwnProperty("newPositionId")) {
            if (typeof m.newPositionId === "number")
              d.newPositionId =
                o.longs === String ? String(m.newPositionId) : m.newPositionId;
            else
              d.newPositionId =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.newPositionId)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.newPositionId.low >>> 0,
                      m.newPositionId.high >>> 0
                    ).toNumber(true)
                  : m.newPositionId;
          }
          return d;
        };
        MsgFungifyChargedPositionsResponse.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgFungifyChargedPositionsResponse;
      })();
      return v1beta1;
    })();
    return concentratedliquidity;
  })();
  osmosis.superfluid = (function () {
    const superfluid = {};
    superfluid.Msg = (function () {
      function Msg(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(
          this,
          rpcImpl,
          requestDelimited,
          responseDelimited
        );
      }
      (Msg.prototype = Object.create(
        $protobuf.rpc.Service.prototype
      )).constructor = Msg;
      Msg.create = function create(
        rpcImpl,
        requestDelimited,
        responseDelimited
      ) {
        return new this(rpcImpl, requestDelimited, responseDelimited);
      };
      Object.defineProperty(
        (Msg.prototype.superfluidDelegate = function superfluidDelegate(
          request,
          callback
        ) {
          return this.rpcCall(
            superfluidDelegate,
            $root.osmosis.superfluid.MsgSuperfluidDelegate,
            $root.osmosis.superfluid.MsgSuperfluidDelegateResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "SuperfluidDelegate" }
      );
      Object.defineProperty(
        (Msg.prototype.superfluidUndelegate = function superfluidUndelegate(
          request,
          callback
        ) {
          return this.rpcCall(
            superfluidUndelegate,
            $root.osmosis.superfluid.MsgSuperfluidUndelegate,
            $root.osmosis.superfluid.MsgSuperfluidUndelegateResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "SuperfluidUndelegate" }
      );
      Object.defineProperty(
        (Msg.prototype.superfluidUnbondLock = function superfluidUnbondLock(
          request,
          callback
        ) {
          return this.rpcCall(
            superfluidUnbondLock,
            $root.osmosis.superfluid.MsgSuperfluidUnbondLock,
            $root.osmosis.superfluid.MsgSuperfluidUnbondLockResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "SuperfluidUnbondLock" }
      );
      Object.defineProperty(
        (Msg.prototype.superfluidUndelegateAndUnbondLock =
          function superfluidUndelegateAndUnbondLock(request, callback) {
            return this.rpcCall(
              superfluidUndelegateAndUnbondLock,
              $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock,
              $root.osmosis.superfluid
                .MsgSuperfluidUndelegateAndUnbondLockResponse,
              request,
              callback
            );
          }),
        "name",
        { value: "SuperfluidUndelegateAndUnbondLock" }
      );
      Object.defineProperty(
        (Msg.prototype.lockAndSuperfluidDelegate =
          function lockAndSuperfluidDelegate(request, callback) {
            return this.rpcCall(
              lockAndSuperfluidDelegate,
              $root.osmosis.superfluid.MsgLockAndSuperfluidDelegate,
              $root.osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse,
              request,
              callback
            );
          }),
        "name",
        { value: "LockAndSuperfluidDelegate" }
      );
      Object.defineProperty(
        (Msg.prototype.unPoolWhitelistedPool = function unPoolWhitelistedPool(
          request,
          callback
        ) {
          return this.rpcCall(
            unPoolWhitelistedPool,
            $root.osmosis.superfluid.MsgUnPoolWhitelistedPool,
            $root.osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "UnPoolWhitelistedPool" }
      );
      Object.defineProperty(
        (Msg.prototype.unlockAndMigrateSharesToFullRangeConcentratedPosition =
          function unlockAndMigrateSharesToFullRangeConcentratedPosition(
            request,
            callback
          ) {
            return this.rpcCall(
              unlockAndMigrateSharesToFullRangeConcentratedPosition,
              $root.osmosis.superfluid
                .MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
              $root.osmosis.superfluid
                .MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse,
              request,
              callback
            );
          }),
        "name",
        { value: "UnlockAndMigrateSharesToFullRangeConcentratedPosition" }
      );
      return Msg;
    })();
    superfluid.MsgSuperfluidDelegate = (function () {
      function MsgSuperfluidDelegate(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidDelegate.prototype.sender = "";
      MsgSuperfluidDelegate.prototype.lockId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgSuperfluidDelegate.prototype.valAddr = "";
      MsgSuperfluidDelegate.create = function create(properties) {
        return new MsgSuperfluidDelegate(properties);
      };
      MsgSuperfluidDelegate.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.lockId != null && Object.hasOwnProperty.call(m, "lockId"))
          w.uint32(16).uint64(m.lockId);
        if (m.valAddr != null && Object.hasOwnProperty.call(m, "valAddr"))
          w.uint32(26).string(m.valAddr);
        return w;
      };
      MsgSuperfluidDelegate.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidDelegate();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              m.lockId = r.uint64();
              break;
            case 3:
              m.valAddr = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidDelegate.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgSuperfluidDelegate)
          return d;
        var m = new $root.osmosis.superfluid.MsgSuperfluidDelegate();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.lockId != null) {
          if ($util.Long)
            (m.lockId = $util.Long.fromValue(d.lockId)).unsigned = true;
          else if (typeof d.lockId === "string")
            m.lockId = parseInt(d.lockId, 10);
          else if (typeof d.lockId === "number") m.lockId = d.lockId;
          else if (typeof d.lockId === "object")
            m.lockId = new $util.LongBits(
              d.lockId.low >>> 0,
              d.lockId.high >>> 0
            ).toNumber(true);
        }
        if (d.valAddr != null) {
          m.valAddr = String(d.valAddr);
        }
        return m;
      };
      MsgSuperfluidDelegate.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.sender = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.lockId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.lockId = o.longs === String ? "0" : 0;
          d.valAddr = "";
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.lockId != null && m.hasOwnProperty("lockId")) {
          if (typeof m.lockId === "number")
            d.lockId = o.longs === String ? String(m.lockId) : m.lockId;
          else
            d.lockId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.lockId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.lockId.low >>> 0,
                    m.lockId.high >>> 0
                  ).toNumber(true)
                : m.lockId;
        }
        if (m.valAddr != null && m.hasOwnProperty("valAddr")) {
          d.valAddr = m.valAddr;
        }
        return d;
      };
      MsgSuperfluidDelegate.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidDelegate;
    })();
    superfluid.MsgSuperfluidDelegateResponse = (function () {
      function MsgSuperfluidDelegateResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidDelegateResponse.create = function create(properties) {
        return new MsgSuperfluidDelegateResponse(properties);
      };
      MsgSuperfluidDelegateResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgSuperfluidDelegateResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidDelegateResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidDelegateResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgSuperfluidDelegateResponse)
          return d;
        return new $root.osmosis.superfluid.MsgSuperfluidDelegateResponse();
      };
      MsgSuperfluidDelegateResponse.toObject = function toObject() {
        return {};
      };
      MsgSuperfluidDelegateResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidDelegateResponse;
    })();
    superfluid.MsgSuperfluidUndelegate = (function () {
      function MsgSuperfluidUndelegate(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUndelegate.prototype.sender = "";
      MsgSuperfluidUndelegate.prototype.lockId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgSuperfluidUndelegate.create = function create(properties) {
        return new MsgSuperfluidUndelegate(properties);
      };
      MsgSuperfluidUndelegate.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.lockId != null && Object.hasOwnProperty.call(m, "lockId"))
          w.uint32(16).uint64(m.lockId);
        return w;
      };
      MsgSuperfluidUndelegate.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidUndelegate();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              m.lockId = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUndelegate.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgSuperfluidUndelegate)
          return d;
        var m = new $root.osmosis.superfluid.MsgSuperfluidUndelegate();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.lockId != null) {
          if ($util.Long)
            (m.lockId = $util.Long.fromValue(d.lockId)).unsigned = true;
          else if (typeof d.lockId === "string")
            m.lockId = parseInt(d.lockId, 10);
          else if (typeof d.lockId === "number") m.lockId = d.lockId;
          else if (typeof d.lockId === "object")
            m.lockId = new $util.LongBits(
              d.lockId.low >>> 0,
              d.lockId.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      MsgSuperfluidUndelegate.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.sender = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.lockId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.lockId = o.longs === String ? "0" : 0;
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.lockId != null && m.hasOwnProperty("lockId")) {
          if (typeof m.lockId === "number")
            d.lockId = o.longs === String ? String(m.lockId) : m.lockId;
          else
            d.lockId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.lockId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.lockId.low >>> 0,
                    m.lockId.high >>> 0
                  ).toNumber(true)
                : m.lockId;
        }
        return d;
      };
      MsgSuperfluidUndelegate.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidUndelegate;
    })();
    superfluid.MsgSuperfluidUndelegateResponse = (function () {
      function MsgSuperfluidUndelegateResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUndelegateResponse.create = function create(properties) {
        return new MsgSuperfluidUndelegateResponse(properties);
      };
      MsgSuperfluidUndelegateResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgSuperfluidUndelegateResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidUndelegateResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUndelegateResponse.fromObject = function fromObject(d) {
        if (
          d instanceof $root.osmosis.superfluid.MsgSuperfluidUndelegateResponse
        )
          return d;
        return new $root.osmosis.superfluid.MsgSuperfluidUndelegateResponse();
      };
      MsgSuperfluidUndelegateResponse.toObject = function toObject() {
        return {};
      };
      MsgSuperfluidUndelegateResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidUndelegateResponse;
    })();
    superfluid.MsgSuperfluidUnbondLock = (function () {
      function MsgSuperfluidUnbondLock(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUnbondLock.prototype.sender = "";
      MsgSuperfluidUnbondLock.prototype.lockId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgSuperfluidUnbondLock.create = function create(properties) {
        return new MsgSuperfluidUnbondLock(properties);
      };
      MsgSuperfluidUnbondLock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.lockId != null && Object.hasOwnProperty.call(m, "lockId"))
          w.uint32(16).uint64(m.lockId);
        return w;
      };
      MsgSuperfluidUnbondLock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidUnbondLock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              m.lockId = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUnbondLock.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgSuperfluidUnbondLock)
          return d;
        var m = new $root.osmosis.superfluid.MsgSuperfluidUnbondLock();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.lockId != null) {
          if ($util.Long)
            (m.lockId = $util.Long.fromValue(d.lockId)).unsigned = true;
          else if (typeof d.lockId === "string")
            m.lockId = parseInt(d.lockId, 10);
          else if (typeof d.lockId === "number") m.lockId = d.lockId;
          else if (typeof d.lockId === "object")
            m.lockId = new $util.LongBits(
              d.lockId.low >>> 0,
              d.lockId.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      MsgSuperfluidUnbondLock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.sender = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.lockId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.lockId = o.longs === String ? "0" : 0;
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.lockId != null && m.hasOwnProperty("lockId")) {
          if (typeof m.lockId === "number")
            d.lockId = o.longs === String ? String(m.lockId) : m.lockId;
          else
            d.lockId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.lockId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.lockId.low >>> 0,
                    m.lockId.high >>> 0
                  ).toNumber(true)
                : m.lockId;
        }
        return d;
      };
      MsgSuperfluidUnbondLock.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidUnbondLock;
    })();
    superfluid.MsgSuperfluidUnbondLockResponse = (function () {
      function MsgSuperfluidUnbondLockResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUnbondLockResponse.create = function create(properties) {
        return new MsgSuperfluidUnbondLockResponse(properties);
      };
      MsgSuperfluidUnbondLockResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgSuperfluidUnbondLockResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgSuperfluidUnbondLockResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUnbondLockResponse.fromObject = function fromObject(d) {
        if (
          d instanceof $root.osmosis.superfluid.MsgSuperfluidUnbondLockResponse
        )
          return d;
        return new $root.osmosis.superfluid.MsgSuperfluidUnbondLockResponse();
      };
      MsgSuperfluidUnbondLockResponse.toObject = function toObject() {
        return {};
      };
      MsgSuperfluidUnbondLockResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgSuperfluidUnbondLockResponse;
    })();
    superfluid.MsgSuperfluidUndelegateAndUnbondLock = (function () {
      function MsgSuperfluidUndelegateAndUnbondLock(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUndelegateAndUnbondLock.prototype.sender = "";
      MsgSuperfluidUndelegateAndUnbondLock.prototype.lockId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgSuperfluidUndelegateAndUnbondLock.prototype.coin = null;
      MsgSuperfluidUndelegateAndUnbondLock.create = function create(
        properties
      ) {
        return new MsgSuperfluidUndelegateAndUnbondLock(properties);
      };
      MsgSuperfluidUndelegateAndUnbondLock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.lockId != null && Object.hasOwnProperty.call(m, "lockId"))
          w.uint32(16).uint64(m.lockId);
        if (m.coin != null && Object.hasOwnProperty.call(m, "coin"))
          $root.cosmos.base.v1beta1.Coin.encode(
            m.coin,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      MsgSuperfluidUndelegateAndUnbondLock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m =
            new $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              m.lockId = r.uint64();
              break;
            case 3:
              m.coin = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUndelegateAndUnbondLock.fromObject = function fromObject(d) {
        if (
          d instanceof
          $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock
        )
          return d;
        var m =
          new $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.lockId != null) {
          if ($util.Long)
            (m.lockId = $util.Long.fromValue(d.lockId)).unsigned = true;
          else if (typeof d.lockId === "string")
            m.lockId = parseInt(d.lockId, 10);
          else if (typeof d.lockId === "number") m.lockId = d.lockId;
          else if (typeof d.lockId === "object")
            m.lockId = new $util.LongBits(
              d.lockId.low >>> 0,
              d.lockId.high >>> 0
            ).toNumber(true);
        }
        if (d.coin != null) {
          if (typeof d.coin !== "object")
            throw TypeError(
              ".osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock.coin: object expected"
            );
          m.coin = $root.cosmos.base.v1beta1.Coin.fromObject(d.coin);
        }
        return m;
      };
      MsgSuperfluidUndelegateAndUnbondLock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.sender = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.lockId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.lockId = o.longs === String ? "0" : 0;
          d.coin = null;
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.lockId != null && m.hasOwnProperty("lockId")) {
          if (typeof m.lockId === "number")
            d.lockId = o.longs === String ? String(m.lockId) : m.lockId;
          else
            d.lockId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.lockId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.lockId.low >>> 0,
                    m.lockId.high >>> 0
                  ).toNumber(true)
                : m.lockId;
        }
        if (m.coin != null && m.hasOwnProperty("coin")) {
          d.coin = $root.cosmos.base.v1beta1.Coin.toObject(m.coin, o);
        }
        return d;
      };
      MsgSuperfluidUndelegateAndUnbondLock.prototype.toJSON =
        function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
      return MsgSuperfluidUndelegateAndUnbondLock;
    })();
    superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse = (function () {
      function MsgSuperfluidUndelegateAndUnbondLockResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgSuperfluidUndelegateAndUnbondLockResponse.create = function create(
        properties
      ) {
        return new MsgSuperfluidUndelegateAndUnbondLockResponse(properties);
      };
      MsgSuperfluidUndelegateAndUnbondLockResponse.encode = function encode(
        m,
        w
      ) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgSuperfluidUndelegateAndUnbondLockResponse.decode = function decode(
        r,
        l
      ) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m =
            new $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgSuperfluidUndelegateAndUnbondLockResponse.fromObject =
        function fromObject(d) {
          if (
            d instanceof
            $root.osmosis.superfluid
              .MsgSuperfluidUndelegateAndUnbondLockResponse
          )
            return d;
          return new $root.osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse();
        };
      MsgSuperfluidUndelegateAndUnbondLockResponse.toObject =
        function toObject() {
          return {};
        };
      MsgSuperfluidUndelegateAndUnbondLockResponse.prototype.toJSON =
        function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
      return MsgSuperfluidUndelegateAndUnbondLockResponse;
    })();
    superfluid.MsgLockAndSuperfluidDelegate = (function () {
      function MsgLockAndSuperfluidDelegate(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgLockAndSuperfluidDelegate.prototype.sender = "";
      MsgLockAndSuperfluidDelegate.prototype.coins = $util.emptyArray;
      MsgLockAndSuperfluidDelegate.prototype.valAddr = "";
      MsgLockAndSuperfluidDelegate.create = function create(properties) {
        return new MsgLockAndSuperfluidDelegate(properties);
      };
      MsgLockAndSuperfluidDelegate.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(18).fork()
            ).ldelim();
        }
        if (m.valAddr != null && Object.hasOwnProperty.call(m, "valAddr"))
          w.uint32(26).string(m.valAddr);
        return w;
      };
      MsgLockAndSuperfluidDelegate.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgLockAndSuperfluidDelegate();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            case 3:
              m.valAddr = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgLockAndSuperfluidDelegate.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgLockAndSuperfluidDelegate)
          return d;
        var m = new $root.osmosis.superfluid.MsgLockAndSuperfluidDelegate();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(
              ".osmosis.superfluid.MsgLockAndSuperfluidDelegate.coins: array expected"
            );
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.superfluid.MsgLockAndSuperfluidDelegate.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        if (d.valAddr != null) {
          m.valAddr = String(d.valAddr);
        }
        return m;
      };
      MsgLockAndSuperfluidDelegate.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          d.sender = "";
          d.valAddr = "";
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        if (m.valAddr != null && m.hasOwnProperty("valAddr")) {
          d.valAddr = m.valAddr;
        }
        return d;
      };
      MsgLockAndSuperfluidDelegate.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgLockAndSuperfluidDelegate;
    })();
    superfluid.MsgLockAndSuperfluidDelegateResponse = (function () {
      function MsgLockAndSuperfluidDelegateResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgLockAndSuperfluidDelegateResponse.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgLockAndSuperfluidDelegateResponse.create = function create(
        properties
      ) {
        return new MsgLockAndSuperfluidDelegateResponse(properties);
      };
      MsgLockAndSuperfluidDelegateResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(8).uint64(m.ID);
        return w;
      };
      MsgLockAndSuperfluidDelegateResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m =
            new $root.osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ID = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgLockAndSuperfluidDelegateResponse.fromObject = function fromObject(d) {
        if (
          d instanceof
          $root.osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse
        )
          return d;
        var m =
          new $root.osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse();
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        return m;
      };
      MsgLockAndSuperfluidDelegateResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        return d;
      };
      MsgLockAndSuperfluidDelegateResponse.prototype.toJSON =
        function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
      return MsgLockAndSuperfluidDelegateResponse;
    })();
    superfluid.MsgUnPoolWhitelistedPool = (function () {
      function MsgUnPoolWhitelistedPool(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgUnPoolWhitelistedPool.prototype.sender = "";
      MsgUnPoolWhitelistedPool.prototype.poolId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgUnPoolWhitelistedPool.create = function create(properties) {
        return new MsgUnPoolWhitelistedPool(properties);
      };
      MsgUnPoolWhitelistedPool.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
          w.uint32(10).string(m.sender);
        if (m.poolId != null && Object.hasOwnProperty.call(m, "poolId"))
          w.uint32(16).uint64(m.poolId);
        return w;
      };
      MsgUnPoolWhitelistedPool.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgUnPoolWhitelistedPool();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.sender = r.string();
              break;
            case 2:
              m.poolId = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgUnPoolWhitelistedPool.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.superfluid.MsgUnPoolWhitelistedPool)
          return d;
        var m = new $root.osmosis.superfluid.MsgUnPoolWhitelistedPool();
        if (d.sender != null) {
          m.sender = String(d.sender);
        }
        if (d.poolId != null) {
          if ($util.Long)
            (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
          else if (typeof d.poolId === "string")
            m.poolId = parseInt(d.poolId, 10);
          else if (typeof d.poolId === "number") m.poolId = d.poolId;
          else if (typeof d.poolId === "object")
            m.poolId = new $util.LongBits(
              d.poolId.low >>> 0,
              d.poolId.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      MsgUnPoolWhitelistedPool.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.sender = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.poolId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.poolId = o.longs === String ? "0" : 0;
        }
        if (m.sender != null && m.hasOwnProperty("sender")) {
          d.sender = m.sender;
        }
        if (m.poolId != null && m.hasOwnProperty("poolId")) {
          if (typeof m.poolId === "number")
            d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
          else
            d.poolId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.poolId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.poolId.low >>> 0,
                    m.poolId.high >>> 0
                  ).toNumber(true)
                : m.poolId;
        }
        return d;
      };
      MsgUnPoolWhitelistedPool.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgUnPoolWhitelistedPool;
    })();
    superfluid.MsgUnPoolWhitelistedPoolResponse = (function () {
      function MsgUnPoolWhitelistedPoolResponse(p) {
        this.exitedLockIds = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgUnPoolWhitelistedPoolResponse.prototype.exitedLockIds =
        $util.emptyArray;
      MsgUnPoolWhitelistedPoolResponse.create = function create(properties) {
        return new MsgUnPoolWhitelistedPoolResponse(properties);
      };
      MsgUnPoolWhitelistedPoolResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.exitedLockIds != null && m.exitedLockIds.length) {
          w.uint32(10).fork();
          for (var i = 0; i < m.exitedLockIds.length; ++i)
            w.uint64(m.exitedLockIds[i]);
          w.ldelim();
        }
        return w;
      };
      MsgUnPoolWhitelistedPoolResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.exitedLockIds && m.exitedLockIds.length))
                m.exitedLockIds = [];
              if ((t & 7) === 2) {
                var c2 = r.uint32() + r.pos;
                while (r.pos < c2) m.exitedLockIds.push(r.uint64());
              } else m.exitedLockIds.push(r.uint64());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgUnPoolWhitelistedPoolResponse.fromObject = function fromObject(d) {
        if (
          d instanceof $root.osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse
        )
          return d;
        var m = new $root.osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse();
        if (d.exitedLockIds) {
          if (!Array.isArray(d.exitedLockIds))
            throw TypeError(
              ".osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse.exitedLockIds: array expected"
            );
          m.exitedLockIds = [];
          for (var i = 0; i < d.exitedLockIds.length; ++i) {
            if ($util.Long)
              (m.exitedLockIds[i] = $util.Long.fromValue(
                d.exitedLockIds[i]
              )).unsigned = true;
            else if (typeof d.exitedLockIds[i] === "string")
              m.exitedLockIds[i] = parseInt(d.exitedLockIds[i], 10);
            else if (typeof d.exitedLockIds[i] === "number")
              m.exitedLockIds[i] = d.exitedLockIds[i];
            else if (typeof d.exitedLockIds[i] === "object")
              m.exitedLockIds[i] = new $util.LongBits(
                d.exitedLockIds[i].low >>> 0,
                d.exitedLockIds[i].high >>> 0
              ).toNumber(true);
          }
        }
        return m;
      };
      MsgUnPoolWhitelistedPoolResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.exitedLockIds = [];
        }
        if (m.exitedLockIds && m.exitedLockIds.length) {
          d.exitedLockIds = [];
          for (var j = 0; j < m.exitedLockIds.length; ++j) {
            if (typeof m.exitedLockIds[j] === "number")
              d.exitedLockIds[j] =
                o.longs === String
                  ? String(m.exitedLockIds[j])
                  : m.exitedLockIds[j];
            else
              d.exitedLockIds[j] =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.exitedLockIds[j])
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.exitedLockIds[j].low >>> 0,
                      m.exitedLockIds[j].high >>> 0
                    ).toNumber(true)
                  : m.exitedLockIds[j];
          }
        }
        return d;
      };
      MsgUnPoolWhitelistedPoolResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgUnPoolWhitelistedPoolResponse;
    })();
    superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition =
      (function () {
        function MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.prototype.sender =
          "";
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.prototype.lockId =
          $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.prototype.sharesToMigrate =
          null;
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.create =
          function create(properties) {
            return new MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition(
              properties
            );
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.encode =
          function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
              w.uint32(10).string(m.sender);
            if (m.lockId != null && Object.hasOwnProperty.call(m, "lockId"))
              w.uint32(16).uint64(m.lockId);
            if (
              m.sharesToMigrate != null &&
              Object.hasOwnProperty.call(m, "sharesToMigrate")
            )
              $root.cosmos.base.v1beta1.Coin.encode(
                m.sharesToMigrate,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.decode =
          function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m =
                new $root.osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.sender = r.string();
                  break;
                case 2:
                  m.lockId = r.uint64();
                  break;
                case 3:
                  m.sharesToMigrate = $root.cosmos.base.v1beta1.Coin.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.fromObject =
          function fromObject(d) {
            if (
              d instanceof
              $root.osmosis.superfluid
                .MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
            )
              return d;
            var m =
              new $root.osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition();
            if (d.sender != null) {
              m.sender = String(d.sender);
            }
            if (d.lockId != null) {
              if ($util.Long)
                (m.lockId = $util.Long.fromValue(d.lockId)).unsigned = true;
              else if (typeof d.lockId === "string")
                m.lockId = parseInt(d.lockId, 10);
              else if (typeof d.lockId === "number") m.lockId = d.lockId;
              else if (typeof d.lockId === "object")
                m.lockId = new $util.LongBits(
                  d.lockId.low >>> 0,
                  d.lockId.high >>> 0
                ).toNumber(true);
            }
            if (d.sharesToMigrate != null) {
              if (typeof d.sharesToMigrate !== "object")
                throw TypeError(
                  ".osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.sharesToMigrate: object expected"
                );
              m.sharesToMigrate = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.sharesToMigrate
              );
            }
            return m;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.toObject =
          function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.sender = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.lockId =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.lockId = o.longs === String ? "0" : 0;
              d.sharesToMigrate = null;
            }
            if (m.sender != null && m.hasOwnProperty("sender")) {
              d.sender = m.sender;
            }
            if (m.lockId != null && m.hasOwnProperty("lockId")) {
              if (typeof m.lockId === "number")
                d.lockId = o.longs === String ? String(m.lockId) : m.lockId;
              else
                d.lockId =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.lockId)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.lockId.low >>> 0,
                        m.lockId.high >>> 0
                      ).toNumber(true)
                    : m.lockId;
            }
            if (
              m.sharesToMigrate != null &&
              m.hasOwnProperty("sharesToMigrate")
            ) {
              d.sharesToMigrate = $root.cosmos.base.v1beta1.Coin.toObject(
                m.sharesToMigrate,
                o
              );
            }
            return d;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition;
      })();
    superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse =
      (function () {
        function MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse(
          p
        ) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.prototype.amount0 =
          "";
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.prototype.amount1 =
          "";
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.prototype.liquidityCreated =
          "";
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.prototype.joinTime =
          null;
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.create =
          function create(properties) {
            return new MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse(
              properties
            );
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.encode =
          function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.amount0 != null && Object.hasOwnProperty.call(m, "amount0"))
              w.uint32(10).string(m.amount0);
            if (m.amount1 != null && Object.hasOwnProperty.call(m, "amount1"))
              w.uint32(18).string(m.amount1);
            if (
              m.liquidityCreated != null &&
              Object.hasOwnProperty.call(m, "liquidityCreated")
            )
              w.uint32(26).string(m.liquidityCreated);
            if (m.joinTime != null && Object.hasOwnProperty.call(m, "joinTime"))
              $root.google.protobuf.Timestamp.encode(
                m.joinTime,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.decode =
          function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m =
                new $root.osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.amount0 = r.string();
                  break;
                case 2:
                  m.amount1 = r.string();
                  break;
                case 3:
                  m.liquidityCreated = r.string();
                  break;
                case 4:
                  m.joinTime = $root.google.protobuf.Timestamp.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.fromObject =
          function fromObject(d) {
            if (
              d instanceof
              $root.osmosis.superfluid
                .MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse
            )
              return d;
            var m =
              new $root.osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse();
            if (d.amount0 != null) {
              m.amount0 = String(d.amount0);
            }
            if (d.amount1 != null) {
              m.amount1 = String(d.amount1);
            }
            if (d.liquidityCreated != null) {
              m.liquidityCreated = String(d.liquidityCreated);
            }
            if (d.joinTime != null) {
              if (typeof d.joinTime !== "object")
                throw TypeError(
                  ".osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.joinTime: object expected"
                );
              m.joinTime = $root.google.protobuf.Timestamp.fromObject(
                d.joinTime
              );
            }
            return m;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.toObject =
          function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.amount0 = "";
              d.amount1 = "";
              d.liquidityCreated = "";
              d.joinTime = null;
            }
            if (m.amount0 != null && m.hasOwnProperty("amount0")) {
              d.amount0 = m.amount0;
            }
            if (m.amount1 != null && m.hasOwnProperty("amount1")) {
              d.amount1 = m.amount1;
            }
            if (
              m.liquidityCreated != null &&
              m.hasOwnProperty("liquidityCreated")
            ) {
              d.liquidityCreated = m.liquidityCreated;
            }
            if (m.joinTime != null && m.hasOwnProperty("joinTime")) {
              d.joinTime = $root.google.protobuf.Timestamp.toObject(
                m.joinTime,
                o
              );
            }
            return d;
          };
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.prototype.toJSON =
          function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
        return MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse;
      })();
    return superfluid;
  })();
  osmosis.lockup = (function () {
    const lockup = {};
    lockup.PeriodLock = (function () {
      function PeriodLock(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      PeriodLock.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      PeriodLock.prototype.owner = "";
      PeriodLock.prototype.duration = null;
      PeriodLock.prototype.endTime = null;
      PeriodLock.prototype.coins = $util.emptyArray;
      PeriodLock.create = function create(properties) {
        return new PeriodLock(properties);
      };
      PeriodLock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(8).uint64(m.ID);
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(18).string(m.owner);
        if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
          $root.google.protobuf.Duration.encode(
            m.duration,
            w.uint32(26).fork()
          ).ldelim();
        if (m.endTime != null && Object.hasOwnProperty.call(m, "endTime"))
          $root.google.protobuf.Timestamp.encode(
            m.endTime,
            w.uint32(34).fork()
          ).ldelim();
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(42).fork()
            ).ldelim();
        }
        return w;
      };
      PeriodLock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.PeriodLock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ID = r.uint64();
              break;
            case 2:
              m.owner = r.string();
              break;
            case 3:
              m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
              break;
            case 4:
              m.endTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
              break;
            case 5:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      PeriodLock.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.PeriodLock) return d;
        var m = new $root.osmosis.lockup.PeriodLock();
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.duration != null) {
          if (typeof d.duration !== "object")
            throw TypeError(
              ".osmosis.lockup.PeriodLock.duration: object expected"
            );
          m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
        }
        if (d.endTime != null) {
          if (typeof d.endTime !== "object")
            throw TypeError(
              ".osmosis.lockup.PeriodLock.endTime: object expected"
            );
          m.endTime = $root.google.protobuf.Timestamp.fromObject(d.endTime);
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(".osmosis.lockup.PeriodLock.coins: array expected");
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.lockup.PeriodLock.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        return m;
      };
      PeriodLock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
          d.owner = "";
          d.duration = null;
          d.endTime = null;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.duration != null && m.hasOwnProperty("duration")) {
          d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
        }
        if (m.endTime != null && m.hasOwnProperty("endTime")) {
          d.endTime = $root.google.protobuf.Timestamp.toObject(m.endTime, o);
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        return d;
      };
      PeriodLock.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return PeriodLock;
    })();
    lockup.LockQueryType = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "ByDuration")] = 0;
      values[(valuesById[1] = "ByTime")] = 1;
      return values;
    })();
    lockup.QueryCondition = (function () {
      function QueryCondition(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      QueryCondition.prototype.lockQueryType = 0;
      QueryCondition.prototype.denom = "";
      QueryCondition.prototype.duration = null;
      QueryCondition.prototype.timestamp = null;
      QueryCondition.create = function create(properties) {
        return new QueryCondition(properties);
      };
      QueryCondition.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.lockQueryType != null &&
          Object.hasOwnProperty.call(m, "lockQueryType")
        )
          w.uint32(8).int32(m.lockQueryType);
        if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
          w.uint32(18).string(m.denom);
        if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
          $root.google.protobuf.Duration.encode(
            m.duration,
            w.uint32(26).fork()
          ).ldelim();
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(
            m.timestamp,
            w.uint32(34).fork()
          ).ldelim();
        return w;
      };
      QueryCondition.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.QueryCondition();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.lockQueryType = r.int32();
              break;
            case 2:
              m.denom = r.string();
              break;
            case 3:
              m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
              break;
            case 4:
              m.timestamp = $root.google.protobuf.Timestamp.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      QueryCondition.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.QueryCondition) return d;
        var m = new $root.osmosis.lockup.QueryCondition();
        switch (d.lockQueryType) {
          case "ByDuration":
          case 0:
            m.lockQueryType = 0;
            break;
          case "ByTime":
          case 1:
            m.lockQueryType = 1;
            break;
        }
        if (d.denom != null) {
          m.denom = String(d.denom);
        }
        if (d.duration != null) {
          if (typeof d.duration !== "object")
            throw TypeError(
              ".osmosis.lockup.QueryCondition.duration: object expected"
            );
          m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(
              ".osmosis.lockup.QueryCondition.timestamp: object expected"
            );
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        return m;
      };
      QueryCondition.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.lockQueryType = o.enums === String ? "ByDuration" : 0;
          d.denom = "";
          d.duration = null;
          d.timestamp = null;
        }
        if (m.lockQueryType != null && m.hasOwnProperty("lockQueryType")) {
          d.lockQueryType =
            o.enums === String
              ? $root.osmosis.lockup.LockQueryType[m.lockQueryType]
              : m.lockQueryType;
        }
        if (m.denom != null && m.hasOwnProperty("denom")) {
          d.denom = m.denom;
        }
        if (m.duration != null && m.hasOwnProperty("duration")) {
          d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(
            m.timestamp,
            o
          );
        }
        return d;
      };
      QueryCondition.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return QueryCondition;
    })();
    lockup.SyntheticLock = (function () {
      function SyntheticLock(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      SyntheticLock.prototype.underlyingLockId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      SyntheticLock.prototype.synthDenom = "";
      SyntheticLock.prototype.endTime = null;
      SyntheticLock.prototype.duration = null;
      SyntheticLock.create = function create(properties) {
        return new SyntheticLock(properties);
      };
      SyntheticLock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.underlyingLockId != null &&
          Object.hasOwnProperty.call(m, "underlyingLockId")
        )
          w.uint32(8).uint64(m.underlyingLockId);
        if (m.synthDenom != null && Object.hasOwnProperty.call(m, "synthDenom"))
          w.uint32(18).string(m.synthDenom);
        if (m.endTime != null && Object.hasOwnProperty.call(m, "endTime"))
          $root.google.protobuf.Timestamp.encode(
            m.endTime,
            w.uint32(26).fork()
          ).ldelim();
        if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
          $root.google.protobuf.Duration.encode(
            m.duration,
            w.uint32(34).fork()
          ).ldelim();
        return w;
      };
      SyntheticLock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.SyntheticLock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.underlyingLockId = r.uint64();
              break;
            case 2:
              m.synthDenom = r.string();
              break;
            case 3:
              m.endTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
              break;
            case 4:
              m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      SyntheticLock.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.SyntheticLock) return d;
        var m = new $root.osmosis.lockup.SyntheticLock();
        if (d.underlyingLockId != null) {
          if ($util.Long)
            (m.underlyingLockId = $util.Long.fromValue(
              d.underlyingLockId
            )).unsigned = true;
          else if (typeof d.underlyingLockId === "string")
            m.underlyingLockId = parseInt(d.underlyingLockId, 10);
          else if (typeof d.underlyingLockId === "number")
            m.underlyingLockId = d.underlyingLockId;
          else if (typeof d.underlyingLockId === "object")
            m.underlyingLockId = new $util.LongBits(
              d.underlyingLockId.low >>> 0,
              d.underlyingLockId.high >>> 0
            ).toNumber(true);
        }
        if (d.synthDenom != null) {
          m.synthDenom = String(d.synthDenom);
        }
        if (d.endTime != null) {
          if (typeof d.endTime !== "object")
            throw TypeError(
              ".osmosis.lockup.SyntheticLock.endTime: object expected"
            );
          m.endTime = $root.google.protobuf.Timestamp.fromObject(d.endTime);
        }
        if (d.duration != null) {
          if (typeof d.duration !== "object")
            throw TypeError(
              ".osmosis.lockup.SyntheticLock.duration: object expected"
            );
          m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
        }
        return m;
      };
      SyntheticLock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.underlyingLockId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.underlyingLockId = o.longs === String ? "0" : 0;
          d.synthDenom = "";
          d.endTime = null;
          d.duration = null;
        }
        if (
          m.underlyingLockId != null &&
          m.hasOwnProperty("underlyingLockId")
        ) {
          if (typeof m.underlyingLockId === "number")
            d.underlyingLockId =
              o.longs === String
                ? String(m.underlyingLockId)
                : m.underlyingLockId;
          else
            d.underlyingLockId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.underlyingLockId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.underlyingLockId.low >>> 0,
                    m.underlyingLockId.high >>> 0
                  ).toNumber(true)
                : m.underlyingLockId;
        }
        if (m.synthDenom != null && m.hasOwnProperty("synthDenom")) {
          d.synthDenom = m.synthDenom;
        }
        if (m.endTime != null && m.hasOwnProperty("endTime")) {
          d.endTime = $root.google.protobuf.Timestamp.toObject(m.endTime, o);
        }
        if (m.duration != null && m.hasOwnProperty("duration")) {
          d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
        }
        return d;
      };
      SyntheticLock.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return SyntheticLock;
    })();
    lockup.Msg = (function () {
      function Msg(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(
          this,
          rpcImpl,
          requestDelimited,
          responseDelimited
        );
      }
      (Msg.prototype = Object.create(
        $protobuf.rpc.Service.prototype
      )).constructor = Msg;
      Msg.create = function create(
        rpcImpl,
        requestDelimited,
        responseDelimited
      ) {
        return new this(rpcImpl, requestDelimited, responseDelimited);
      };
      Object.defineProperty(
        (Msg.prototype.lockTokens = function lockTokens(request, callback) {
          return this.rpcCall(
            lockTokens,
            $root.osmosis.lockup.MsgLockTokens,
            $root.osmosis.lockup.MsgLockTokensResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "LockTokens" }
      );
      Object.defineProperty(
        (Msg.prototype.beginUnlockingAll = function beginUnlockingAll(
          request,
          callback
        ) {
          return this.rpcCall(
            beginUnlockingAll,
            $root.osmosis.lockup.MsgBeginUnlockingAll,
            $root.osmosis.lockup.MsgBeginUnlockingAllResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "BeginUnlockingAll" }
      );
      Object.defineProperty(
        (Msg.prototype.beginUnlocking = function beginUnlocking(
          request,
          callback
        ) {
          return this.rpcCall(
            beginUnlocking,
            $root.osmosis.lockup.MsgBeginUnlocking,
            $root.osmosis.lockup.MsgBeginUnlockingResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "BeginUnlocking" }
      );
      Object.defineProperty(
        (Msg.prototype.extendLockup = function extendLockup(request, callback) {
          return this.rpcCall(
            extendLockup,
            $root.osmosis.lockup.MsgExtendLockup,
            $root.osmosis.lockup.MsgExtendLockupResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "ExtendLockup" }
      );
      Object.defineProperty(
        (Msg.prototype.forceUnlock = function forceUnlock(request, callback) {
          return this.rpcCall(
            forceUnlock,
            $root.osmosis.lockup.MsgForceUnlock,
            $root.osmosis.lockup.MsgForceUnlockResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "ForceUnlock" }
      );
      return Msg;
    })();
    lockup.MsgLockTokens = (function () {
      function MsgLockTokens(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgLockTokens.prototype.owner = "";
      MsgLockTokens.prototype.duration = null;
      MsgLockTokens.prototype.coins = $util.emptyArray;
      MsgLockTokens.create = function create(properties) {
        return new MsgLockTokens(properties);
      };
      MsgLockTokens.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
          $root.google.protobuf.Duration.encode(
            m.duration,
            w.uint32(18).fork()
          ).ldelim();
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(26).fork()
            ).ldelim();
        }
        return w;
      };
      MsgLockTokens.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgLockTokens();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            case 2:
              m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
              break;
            case 3:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgLockTokens.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgLockTokens) return d;
        var m = new $root.osmosis.lockup.MsgLockTokens();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.duration != null) {
          if (typeof d.duration !== "object")
            throw TypeError(
              ".osmosis.lockup.MsgLockTokens.duration: object expected"
            );
          m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(
              ".osmosis.lockup.MsgLockTokens.coins: array expected"
            );
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.lockup.MsgLockTokens.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        return m;
      };
      MsgLockTokens.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          d.owner = "";
          d.duration = null;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.duration != null && m.hasOwnProperty("duration")) {
          d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        return d;
      };
      MsgLockTokens.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgLockTokens;
    })();
    lockup.MsgLockTokensResponse = (function () {
      function MsgLockTokensResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgLockTokensResponse.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgLockTokensResponse.create = function create(properties) {
        return new MsgLockTokensResponse(properties);
      };
      MsgLockTokensResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(8).uint64(m.ID);
        return w;
      };
      MsgLockTokensResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgLockTokensResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ID = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgLockTokensResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgLockTokensResponse) return d;
        var m = new $root.osmosis.lockup.MsgLockTokensResponse();
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        return m;
      };
      MsgLockTokensResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        return d;
      };
      MsgLockTokensResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgLockTokensResponse;
    })();
    lockup.MsgBeginUnlockingAll = (function () {
      function MsgBeginUnlockingAll(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgBeginUnlockingAll.prototype.owner = "";
      MsgBeginUnlockingAll.create = function create(properties) {
        return new MsgBeginUnlockingAll(properties);
      };
      MsgBeginUnlockingAll.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        return w;
      };
      MsgBeginUnlockingAll.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgBeginUnlockingAll();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgBeginUnlockingAll.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgBeginUnlockingAll) return d;
        var m = new $root.osmosis.lockup.MsgBeginUnlockingAll();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        return m;
      };
      MsgBeginUnlockingAll.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.owner = "";
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        return d;
      };
      MsgBeginUnlockingAll.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgBeginUnlockingAll;
    })();
    lockup.MsgBeginUnlockingAllResponse = (function () {
      function MsgBeginUnlockingAllResponse(p) {
        this.unlocks = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgBeginUnlockingAllResponse.prototype.unlocks = $util.emptyArray;
      MsgBeginUnlockingAllResponse.create = function create(properties) {
        return new MsgBeginUnlockingAllResponse(properties);
      };
      MsgBeginUnlockingAllResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.unlocks != null && m.unlocks.length) {
          for (var i = 0; i < m.unlocks.length; ++i)
            $root.osmosis.lockup.PeriodLock.encode(
              m.unlocks[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      MsgBeginUnlockingAllResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgBeginUnlockingAllResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.unlocks && m.unlocks.length)) m.unlocks = [];
              m.unlocks.push(
                $root.osmosis.lockup.PeriodLock.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgBeginUnlockingAllResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgBeginUnlockingAllResponse)
          return d;
        var m = new $root.osmosis.lockup.MsgBeginUnlockingAllResponse();
        if (d.unlocks) {
          if (!Array.isArray(d.unlocks))
            throw TypeError(
              ".osmosis.lockup.MsgBeginUnlockingAllResponse.unlocks: array expected"
            );
          m.unlocks = [];
          for (var i = 0; i < d.unlocks.length; ++i) {
            if (typeof d.unlocks[i] !== "object")
              throw TypeError(
                ".osmosis.lockup.MsgBeginUnlockingAllResponse.unlocks: object expected"
              );
            m.unlocks[i] = $root.osmosis.lockup.PeriodLock.fromObject(
              d.unlocks[i]
            );
          }
        }
        return m;
      };
      MsgBeginUnlockingAllResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.unlocks = [];
        }
        if (m.unlocks && m.unlocks.length) {
          d.unlocks = [];
          for (var j = 0; j < m.unlocks.length; ++j) {
            d.unlocks[j] = $root.osmosis.lockup.PeriodLock.toObject(
              m.unlocks[j],
              o
            );
          }
        }
        return d;
      };
      MsgBeginUnlockingAllResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgBeginUnlockingAllResponse;
    })();
    lockup.MsgBeginUnlocking = (function () {
      function MsgBeginUnlocking(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgBeginUnlocking.prototype.owner = "";
      MsgBeginUnlocking.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgBeginUnlocking.prototype.coins = $util.emptyArray;
      MsgBeginUnlocking.create = function create(properties) {
        return new MsgBeginUnlocking(properties);
      };
      MsgBeginUnlocking.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(16).uint64(m.ID);
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(26).fork()
            ).ldelim();
        }
        return w;
      };
      MsgBeginUnlocking.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgBeginUnlocking();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            case 2:
              m.ID = r.uint64();
              break;
            case 3:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgBeginUnlocking.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgBeginUnlocking) return d;
        var m = new $root.osmosis.lockup.MsgBeginUnlocking();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(
              ".osmosis.lockup.MsgBeginUnlocking.coins: array expected"
            );
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.lockup.MsgBeginUnlocking.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        return m;
      };
      MsgBeginUnlocking.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          d.owner = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        return d;
      };
      MsgBeginUnlocking.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgBeginUnlocking;
    })();
    lockup.MsgBeginUnlockingResponse = (function () {
      function MsgBeginUnlockingResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgBeginUnlockingResponse.prototype.success = false;
      MsgBeginUnlockingResponse.prototype.unlockingLockID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgBeginUnlockingResponse.create = function create(properties) {
        return new MsgBeginUnlockingResponse(properties);
      };
      MsgBeginUnlockingResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.success != null && Object.hasOwnProperty.call(m, "success"))
          w.uint32(8).bool(m.success);
        if (
          m.unlockingLockID != null &&
          Object.hasOwnProperty.call(m, "unlockingLockID")
        )
          w.uint32(16).uint64(m.unlockingLockID);
        return w;
      };
      MsgBeginUnlockingResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgBeginUnlockingResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.success = r.bool();
              break;
            case 2:
              m.unlockingLockID = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgBeginUnlockingResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgBeginUnlockingResponse)
          return d;
        var m = new $root.osmosis.lockup.MsgBeginUnlockingResponse();
        if (d.success != null) {
          m.success = Boolean(d.success);
        }
        if (d.unlockingLockID != null) {
          if ($util.Long)
            (m.unlockingLockID = $util.Long.fromValue(
              d.unlockingLockID
            )).unsigned = true;
          else if (typeof d.unlockingLockID === "string")
            m.unlockingLockID = parseInt(d.unlockingLockID, 10);
          else if (typeof d.unlockingLockID === "number")
            m.unlockingLockID = d.unlockingLockID;
          else if (typeof d.unlockingLockID === "object")
            m.unlockingLockID = new $util.LongBits(
              d.unlockingLockID.low >>> 0,
              d.unlockingLockID.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      MsgBeginUnlockingResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.success = false;
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.unlockingLockID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.unlockingLockID = o.longs === String ? "0" : 0;
        }
        if (m.success != null && m.hasOwnProperty("success")) {
          d.success = m.success;
        }
        if (m.unlockingLockID != null && m.hasOwnProperty("unlockingLockID")) {
          if (typeof m.unlockingLockID === "number")
            d.unlockingLockID =
              o.longs === String
                ? String(m.unlockingLockID)
                : m.unlockingLockID;
          else
            d.unlockingLockID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.unlockingLockID)
                : o.longs === Number
                ? new $util.LongBits(
                    m.unlockingLockID.low >>> 0,
                    m.unlockingLockID.high >>> 0
                  ).toNumber(true)
                : m.unlockingLockID;
        }
        return d;
      };
      MsgBeginUnlockingResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgBeginUnlockingResponse;
    })();
    lockup.MsgExtendLockup = (function () {
      function MsgExtendLockup(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgExtendLockup.prototype.owner = "";
      MsgExtendLockup.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgExtendLockup.prototype.duration = null;
      MsgExtendLockup.create = function create(properties) {
        return new MsgExtendLockup(properties);
      };
      MsgExtendLockup.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(16).uint64(m.ID);
        if (m.duration != null && Object.hasOwnProperty.call(m, "duration"))
          $root.google.protobuf.Duration.encode(
            m.duration,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      MsgExtendLockup.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgExtendLockup();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            case 2:
              m.ID = r.uint64();
              break;
            case 3:
              m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgExtendLockup.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgExtendLockup) return d;
        var m = new $root.osmosis.lockup.MsgExtendLockup();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        if (d.duration != null) {
          if (typeof d.duration !== "object")
            throw TypeError(
              ".osmosis.lockup.MsgExtendLockup.duration: object expected"
            );
          m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
        }
        return m;
      };
      MsgExtendLockup.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.owner = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
          d.duration = null;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        if (m.duration != null && m.hasOwnProperty("duration")) {
          d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
        }
        return d;
      };
      MsgExtendLockup.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgExtendLockup;
    })();
    lockup.MsgExtendLockupResponse = (function () {
      function MsgExtendLockupResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgExtendLockupResponse.prototype.success = false;
      MsgExtendLockupResponse.create = function create(properties) {
        return new MsgExtendLockupResponse(properties);
      };
      MsgExtendLockupResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.success != null && Object.hasOwnProperty.call(m, "success"))
          w.uint32(8).bool(m.success);
        return w;
      };
      MsgExtendLockupResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgExtendLockupResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.success = r.bool();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgExtendLockupResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgExtendLockupResponse) return d;
        var m = new $root.osmosis.lockup.MsgExtendLockupResponse();
        if (d.success != null) {
          m.success = Boolean(d.success);
        }
        return m;
      };
      MsgExtendLockupResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.success = false;
        }
        if (m.success != null && m.hasOwnProperty("success")) {
          d.success = m.success;
        }
        return d;
      };
      MsgExtendLockupResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgExtendLockupResponse;
    })();
    lockup.MsgForceUnlock = (function () {
      function MsgForceUnlock(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgForceUnlock.prototype.owner = "";
      MsgForceUnlock.prototype.ID = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgForceUnlock.prototype.coins = $util.emptyArray;
      MsgForceUnlock.create = function create(properties) {
        return new MsgForceUnlock(properties);
      };
      MsgForceUnlock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        if (m.ID != null && Object.hasOwnProperty.call(m, "ID"))
          w.uint32(16).uint64(m.ID);
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(26).fork()
            ).ldelim();
        }
        return w;
      };
      MsgForceUnlock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgForceUnlock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            case 2:
              m.ID = r.uint64();
              break;
            case 3:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgForceUnlock.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgForceUnlock) return d;
        var m = new $root.osmosis.lockup.MsgForceUnlock();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.ID != null) {
          if ($util.Long) (m.ID = $util.Long.fromValue(d.ID)).unsigned = true;
          else if (typeof d.ID === "string") m.ID = parseInt(d.ID, 10);
          else if (typeof d.ID === "number") m.ID = d.ID;
          else if (typeof d.ID === "object")
            m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(
              true
            );
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(
              ".osmosis.lockup.MsgForceUnlock.coins: array expected"
            );
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.lockup.MsgForceUnlock.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        return m;
      };
      MsgForceUnlock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          d.owner = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.ID =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.ID = o.longs === String ? "0" : 0;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.ID != null && m.hasOwnProperty("ID")) {
          if (typeof m.ID === "number")
            d.ID = o.longs === String ? String(m.ID) : m.ID;
          else
            d.ID =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.ID)
                : o.longs === Number
                ? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(
                    true
                  )
                : m.ID;
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        return d;
      };
      MsgForceUnlock.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgForceUnlock;
    })();
    lockup.MsgForceUnlockResponse = (function () {
      function MsgForceUnlockResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgForceUnlockResponse.prototype.success = false;
      MsgForceUnlockResponse.create = function create(properties) {
        return new MsgForceUnlockResponse(properties);
      };
      MsgForceUnlockResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.success != null && Object.hasOwnProperty.call(m, "success"))
          w.uint32(8).bool(m.success);
        return w;
      };
      MsgForceUnlockResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.lockup.MsgForceUnlockResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.success = r.bool();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgForceUnlockResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.lockup.MsgForceUnlockResponse) return d;
        var m = new $root.osmosis.lockup.MsgForceUnlockResponse();
        if (d.success != null) {
          m.success = Boolean(d.success);
        }
        return m;
      };
      MsgForceUnlockResponse.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.success = false;
        }
        if (m.success != null && m.hasOwnProperty("success")) {
          d.success = m.success;
        }
        return d;
      };
      MsgForceUnlockResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgForceUnlockResponse;
    })();
    return lockup;
  })();
  osmosis.incentives = (function () {
    const incentives = {};
    incentives.Msg = (function () {
      function Msg(rpcImpl, requestDelimited, responseDelimited) {
        $protobuf.rpc.Service.call(
          this,
          rpcImpl,
          requestDelimited,
          responseDelimited
        );
      }
      (Msg.prototype = Object.create(
        $protobuf.rpc.Service.prototype
      )).constructor = Msg;
      Msg.create = function create(
        rpcImpl,
        requestDelimited,
        responseDelimited
      ) {
        return new this(rpcImpl, requestDelimited, responseDelimited);
      };
      Object.defineProperty(
        (Msg.prototype.createGauge = function createGauge(request, callback) {
          return this.rpcCall(
            createGauge,
            $root.osmosis.incentives.MsgCreateGauge,
            $root.osmosis.incentives.MsgCreateGaugeResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "CreateGauge" }
      );
      Object.defineProperty(
        (Msg.prototype.addToGauge = function addToGauge(request, callback) {
          return this.rpcCall(
            addToGauge,
            $root.osmosis.incentives.MsgAddToGauge,
            $root.osmosis.incentives.MsgAddToGaugeResponse,
            request,
            callback
          );
        }),
        "name",
        { value: "AddToGauge" }
      );
      return Msg;
    })();
    incentives.MsgCreateGauge = (function () {
      function MsgCreateGauge(p) {
        this.coins = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgCreateGauge.prototype.isPerpetual = false;
      MsgCreateGauge.prototype.owner = "";
      MsgCreateGauge.prototype.distributeTo = null;
      MsgCreateGauge.prototype.coins = $util.emptyArray;
      MsgCreateGauge.prototype.startTime = null;
      MsgCreateGauge.prototype.numEpochsPaidOver = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgCreateGauge.create = function create(properties) {
        return new MsgCreateGauge(properties);
      };
      MsgCreateGauge.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.isPerpetual != null &&
          Object.hasOwnProperty.call(m, "isPerpetual")
        )
          w.uint32(8).bool(m.isPerpetual);
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(18).string(m.owner);
        if (
          m.distributeTo != null &&
          Object.hasOwnProperty.call(m, "distributeTo")
        )
          $root.osmosis.lockup.QueryCondition.encode(
            m.distributeTo,
            w.uint32(26).fork()
          ).ldelim();
        if (m.coins != null && m.coins.length) {
          for (var i = 0; i < m.coins.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.coins[i],
              w.uint32(34).fork()
            ).ldelim();
        }
        if (m.startTime != null && Object.hasOwnProperty.call(m, "startTime"))
          $root.google.protobuf.Timestamp.encode(
            m.startTime,
            w.uint32(42).fork()
          ).ldelim();
        if (
          m.numEpochsPaidOver != null &&
          Object.hasOwnProperty.call(m, "numEpochsPaidOver")
        )
          w.uint32(48).uint64(m.numEpochsPaidOver);
        return w;
      };
      MsgCreateGauge.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.incentives.MsgCreateGauge();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.isPerpetual = r.bool();
              break;
            case 2:
              m.owner = r.string();
              break;
            case 3:
              m.distributeTo = $root.osmosis.lockup.QueryCondition.decode(
                r,
                r.uint32()
              );
              break;
            case 4:
              if (!(m.coins && m.coins.length)) m.coins = [];
              m.coins.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            case 5:
              m.startTime = $root.google.protobuf.Timestamp.decode(
                r,
                r.uint32()
              );
              break;
            case 6:
              m.numEpochsPaidOver = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgCreateGauge.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.incentives.MsgCreateGauge) return d;
        var m = new $root.osmosis.incentives.MsgCreateGauge();
        if (d.isPerpetual != null) {
          m.isPerpetual = Boolean(d.isPerpetual);
        }
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.distributeTo != null) {
          if (typeof d.distributeTo !== "object")
            throw TypeError(
              ".osmosis.incentives.MsgCreateGauge.distributeTo: object expected"
            );
          m.distributeTo = $root.osmosis.lockup.QueryCondition.fromObject(
            d.distributeTo
          );
        }
        if (d.coins) {
          if (!Array.isArray(d.coins))
            throw TypeError(
              ".osmosis.incentives.MsgCreateGauge.coins: array expected"
            );
          m.coins = [];
          for (var i = 0; i < d.coins.length; ++i) {
            if (typeof d.coins[i] !== "object")
              throw TypeError(
                ".osmosis.incentives.MsgCreateGauge.coins: object expected"
              );
            m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
          }
        }
        if (d.startTime != null) {
          if (typeof d.startTime !== "object")
            throw TypeError(
              ".osmosis.incentives.MsgCreateGauge.startTime: object expected"
            );
          m.startTime = $root.google.protobuf.Timestamp.fromObject(d.startTime);
        }
        if (d.numEpochsPaidOver != null) {
          if ($util.Long)
            (m.numEpochsPaidOver = $util.Long.fromValue(
              d.numEpochsPaidOver
            )).unsigned = true;
          else if (typeof d.numEpochsPaidOver === "string")
            m.numEpochsPaidOver = parseInt(d.numEpochsPaidOver, 10);
          else if (typeof d.numEpochsPaidOver === "number")
            m.numEpochsPaidOver = d.numEpochsPaidOver;
          else if (typeof d.numEpochsPaidOver === "object")
            m.numEpochsPaidOver = new $util.LongBits(
              d.numEpochsPaidOver.low >>> 0,
              d.numEpochsPaidOver.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      MsgCreateGauge.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.coins = [];
        }
        if (o.defaults) {
          d.isPerpetual = false;
          d.owner = "";
          d.distributeTo = null;
          d.startTime = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.numEpochsPaidOver =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.numEpochsPaidOver = o.longs === String ? "0" : 0;
        }
        if (m.isPerpetual != null && m.hasOwnProperty("isPerpetual")) {
          d.isPerpetual = m.isPerpetual;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.distributeTo != null && m.hasOwnProperty("distributeTo")) {
          d.distributeTo = $root.osmosis.lockup.QueryCondition.toObject(
            m.distributeTo,
            o
          );
        }
        if (m.coins && m.coins.length) {
          d.coins = [];
          for (var j = 0; j < m.coins.length; ++j) {
            d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
          }
        }
        if (m.startTime != null && m.hasOwnProperty("startTime")) {
          d.startTime = $root.google.protobuf.Timestamp.toObject(
            m.startTime,
            o
          );
        }
        if (
          m.numEpochsPaidOver != null &&
          m.hasOwnProperty("numEpochsPaidOver")
        ) {
          if (typeof m.numEpochsPaidOver === "number")
            d.numEpochsPaidOver =
              o.longs === String
                ? String(m.numEpochsPaidOver)
                : m.numEpochsPaidOver;
          else
            d.numEpochsPaidOver =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.numEpochsPaidOver)
                : o.longs === Number
                ? new $util.LongBits(
                    m.numEpochsPaidOver.low >>> 0,
                    m.numEpochsPaidOver.high >>> 0
                  ).toNumber(true)
                : m.numEpochsPaidOver;
        }
        return d;
      };
      MsgCreateGauge.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgCreateGauge;
    })();
    incentives.MsgCreateGaugeResponse = (function () {
      function MsgCreateGaugeResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgCreateGaugeResponse.create = function create(properties) {
        return new MsgCreateGaugeResponse(properties);
      };
      MsgCreateGaugeResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgCreateGaugeResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.incentives.MsgCreateGaugeResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgCreateGaugeResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.incentives.MsgCreateGaugeResponse)
          return d;
        return new $root.osmosis.incentives.MsgCreateGaugeResponse();
      };
      MsgCreateGaugeResponse.toObject = function toObject() {
        return {};
      };
      MsgCreateGaugeResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgCreateGaugeResponse;
    })();
    incentives.MsgAddToGauge = (function () {
      function MsgAddToGauge(p) {
        this.rewards = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgAddToGauge.prototype.owner = "";
      MsgAddToGauge.prototype.gaugeId = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      MsgAddToGauge.prototype.rewards = $util.emptyArray;
      MsgAddToGauge.create = function create(properties) {
        return new MsgAddToGauge(properties);
      };
      MsgAddToGauge.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.owner != null && Object.hasOwnProperty.call(m, "owner"))
          w.uint32(10).string(m.owner);
        if (m.gaugeId != null && Object.hasOwnProperty.call(m, "gaugeId"))
          w.uint32(16).uint64(m.gaugeId);
        if (m.rewards != null && m.rewards.length) {
          for (var i = 0; i < m.rewards.length; ++i)
            $root.cosmos.base.v1beta1.Coin.encode(
              m.rewards[i],
              w.uint32(26).fork()
            ).ldelim();
        }
        return w;
      };
      MsgAddToGauge.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.incentives.MsgAddToGauge();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.owner = r.string();
              break;
            case 2:
              m.gaugeId = r.uint64();
              break;
            case 3:
              if (!(m.rewards && m.rewards.length)) m.rewards = [];
              m.rewards.push(
                $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgAddToGauge.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.incentives.MsgAddToGauge) return d;
        var m = new $root.osmosis.incentives.MsgAddToGauge();
        if (d.owner != null) {
          m.owner = String(d.owner);
        }
        if (d.gaugeId != null) {
          if ($util.Long)
            (m.gaugeId = $util.Long.fromValue(d.gaugeId)).unsigned = true;
          else if (typeof d.gaugeId === "string")
            m.gaugeId = parseInt(d.gaugeId, 10);
          else if (typeof d.gaugeId === "number") m.gaugeId = d.gaugeId;
          else if (typeof d.gaugeId === "object")
            m.gaugeId = new $util.LongBits(
              d.gaugeId.low >>> 0,
              d.gaugeId.high >>> 0
            ).toNumber(true);
        }
        if (d.rewards) {
          if (!Array.isArray(d.rewards))
            throw TypeError(
              ".osmosis.incentives.MsgAddToGauge.rewards: array expected"
            );
          m.rewards = [];
          for (var i = 0; i < d.rewards.length; ++i) {
            if (typeof d.rewards[i] !== "object")
              throw TypeError(
                ".osmosis.incentives.MsgAddToGauge.rewards: object expected"
              );
            m.rewards[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
              d.rewards[i]
            );
          }
        }
        return m;
      };
      MsgAddToGauge.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.rewards = [];
        }
        if (o.defaults) {
          d.owner = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.gaugeId =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.gaugeId = o.longs === String ? "0" : 0;
        }
        if (m.owner != null && m.hasOwnProperty("owner")) {
          d.owner = m.owner;
        }
        if (m.gaugeId != null && m.hasOwnProperty("gaugeId")) {
          if (typeof m.gaugeId === "number")
            d.gaugeId = o.longs === String ? String(m.gaugeId) : m.gaugeId;
          else
            d.gaugeId =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.gaugeId)
                : o.longs === Number
                ? new $util.LongBits(
                    m.gaugeId.low >>> 0,
                    m.gaugeId.high >>> 0
                  ).toNumber(true)
                : m.gaugeId;
        }
        if (m.rewards && m.rewards.length) {
          d.rewards = [];
          for (var j = 0; j < m.rewards.length; ++j) {
            d.rewards[j] = $root.cosmos.base.v1beta1.Coin.toObject(
              m.rewards[j],
              o
            );
          }
        }
        return d;
      };
      MsgAddToGauge.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgAddToGauge;
    })();
    incentives.MsgAddToGaugeResponse = (function () {
      function MsgAddToGaugeResponse(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MsgAddToGaugeResponse.create = function create(properties) {
        return new MsgAddToGaugeResponse(properties);
      };
      MsgAddToGaugeResponse.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        return w;
      };
      MsgAddToGaugeResponse.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.osmosis.incentives.MsgAddToGaugeResponse();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MsgAddToGaugeResponse.fromObject = function fromObject(d) {
        if (d instanceof $root.osmosis.incentives.MsgAddToGaugeResponse)
          return d;
        return new $root.osmosis.incentives.MsgAddToGaugeResponse();
      };
      MsgAddToGaugeResponse.toObject = function toObject() {
        return {};
      };
      MsgAddToGaugeResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MsgAddToGaugeResponse;
    })();
    return incentives;
  })();
  return osmosis;
})();
exports.google = $root.google = (() => {
  const google = {};
  google.protobuf = (function () {
    const protobuf = {};
    protobuf.Duration = (function () {
      function Duration(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Duration.prototype.seconds = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Duration.prototype.nanos = 0;
      Duration.create = function create(properties) {
        return new Duration(properties);
      };
      Duration.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
          w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
          w.uint32(16).int32(m.nanos);
        return w;
      };
      Duration.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Duration();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.seconds = r.int64();
              break;
            case 2:
              m.nanos = r.int32();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Duration.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Duration) return d;
        var m = new $root.google.protobuf.Duration();
        if (d.seconds != null) {
          if ($util.Long)
            (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string")
            m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(
              d.seconds.low >>> 0,
              d.seconds.high >>> 0
            ).toNumber();
        }
        if (d.nanos != null) {
          m.nanos = d.nanos | 0;
        }
        return m;
      };
      Duration.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.seconds =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number")
            d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(
                    m.seconds.low >>> 0,
                    m.seconds.high >>> 0
                  ).toNumber()
                : m.seconds;
        }
        if (m.nanos != null && m.hasOwnProperty("nanos")) {
          d.nanos = m.nanos;
        }
        return d;
      };
      Duration.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Duration;
    })();
    protobuf.Timestamp = (function () {
      function Timestamp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Timestamp.prototype.seconds = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Timestamp.prototype.nanos = 0;
      Timestamp.create = function create(properties) {
        return new Timestamp(properties);
      };
      Timestamp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
          w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
          w.uint32(16).int32(m.nanos);
        return w;
      };
      Timestamp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Timestamp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.seconds = r.int64();
              break;
            case 2:
              m.nanos = r.int32();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Timestamp.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Timestamp) return d;
        var m = new $root.google.protobuf.Timestamp();
        if (d.seconds != null) {
          if ($util.Long)
            (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string")
            m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(
              d.seconds.low >>> 0,
              d.seconds.high >>> 0
            ).toNumber();
        }
        if (d.nanos != null) {
          m.nanos = d.nanos | 0;
        }
        return m;
      };
      Timestamp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.seconds =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number")
            d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(
                    m.seconds.low >>> 0,
                    m.seconds.high >>> 0
                  ).toNumber()
                : m.seconds;
        }
        if (m.nanos != null && m.hasOwnProperty("nanos")) {
          d.nanos = m.nanos;
        }
        return d;
      };
      Timestamp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Timestamp;
    })();
    return protobuf;
  })();
  return google;
})();
module.exports = $root;
