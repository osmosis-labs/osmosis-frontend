'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.google = exports.osmosis = exports.cosmos = void 0;
var $protobuf = require('protobufjs/minimal');
const $Reader = $protobuf.Reader,
	$Writer = $protobuf.Writer,
	$util = $protobuf.util;
const $root = {};
exports.cosmos = $root.cosmos = (() => {
	const cosmos = {};
	cosmos.base = (function() {
		const base = {};
		base.v1beta1 = (function() {
			const v1beta1 = {};
			v1beta1.Coin = (function() {
				function Coin(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				Coin.prototype.denom = '';
				Coin.prototype.amount = '';
				Coin.create = function create(properties) {
					return new Coin(properties);
				};
				Coin.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.denom != null && Object.hasOwnProperty.call(m, 'denom')) w.uint32(10).string(m.denom);
					if (m.amount != null && Object.hasOwnProperty.call(m, 'amount')) w.uint32(18).string(m.amount);
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
						d.denom = '';
						d.amount = '';
					}
					if (m.denom != null && m.hasOwnProperty('denom')) {
						d.denom = m.denom;
					}
					if (m.amount != null && m.hasOwnProperty('amount')) {
						d.amount = m.amount;
					}
					return d;
				};
				Coin.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return Coin;
			})();
			v1beta1.DecCoin = (function() {
				function DecCoin(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				DecCoin.prototype.denom = '';
				DecCoin.prototype.amount = '';
				DecCoin.create = function create(properties) {
					return new DecCoin(properties);
				};
				DecCoin.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.denom != null && Object.hasOwnProperty.call(m, 'denom')) w.uint32(10).string(m.denom);
					if (m.amount != null && Object.hasOwnProperty.call(m, 'amount')) w.uint32(18).string(m.amount);
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
						d.denom = '';
						d.amount = '';
					}
					if (m.denom != null && m.hasOwnProperty('denom')) {
						d.denom = m.denom;
					}
					if (m.amount != null && m.hasOwnProperty('amount')) {
						d.amount = m.amount;
					}
					return d;
				};
				DecCoin.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return DecCoin;
			})();
			v1beta1.IntProto = (function() {
				function IntProto(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				IntProto.prototype.int = '';
				IntProto.create = function create(properties) {
					return new IntProto(properties);
				};
				IntProto.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.int != null && Object.hasOwnProperty.call(m, 'int')) w.uint32(10).string(m.int);
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
						d.int = '';
					}
					if (m.int != null && m.hasOwnProperty('int')) {
						d.int = m.int;
					}
					return d;
				};
				IntProto.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return IntProto;
			})();
			v1beta1.DecProto = (function() {
				function DecProto(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				DecProto.prototype.dec = '';
				DecProto.create = function create(properties) {
					return new DecProto(properties);
				};
				DecProto.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.dec != null && Object.hasOwnProperty.call(m, 'dec')) w.uint32(10).string(m.dec);
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
						d.dec = '';
					}
					if (m.dec != null && m.hasOwnProperty('dec')) {
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
	cosmos.bank = (function() {
		const bank = {};
		bank.v1beta1 = (function() {
			const v1beta1 = {};
			v1beta1.Params = (function() {
				function Params(p) {
					this.sendEnabled = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
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
							$root.cosmos.bank.v1beta1.SendEnabled.encode(m.sendEnabled[i], w.uint32(10).fork()).ldelim();
					}
					if (m.defaultSendEnabled != null && Object.hasOwnProperty.call(m, 'defaultSendEnabled'))
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
								if (!(m.sendEnabled && m.sendEnabled.length)) m.sendEnabled = [];
								m.sendEnabled.push($root.cosmos.bank.v1beta1.SendEnabled.decode(r, r.uint32()));
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
							throw TypeError('.cosmos.bank.v1beta1.Params.sendEnabled: array expected');
						m.sendEnabled = [];
						for (var i = 0; i < d.sendEnabled.length; ++i) {
							if (typeof d.sendEnabled[i] !== 'object')
								throw TypeError('.cosmos.bank.v1beta1.Params.sendEnabled: object expected');
							m.sendEnabled[i] = $root.cosmos.bank.v1beta1.SendEnabled.fromObject(d.sendEnabled[i]);
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
							d.sendEnabled[j] = $root.cosmos.bank.v1beta1.SendEnabled.toObject(m.sendEnabled[j], o);
						}
					}
					if (m.defaultSendEnabled != null && m.hasOwnProperty('defaultSendEnabled')) {
						d.defaultSendEnabled = m.defaultSendEnabled;
					}
					return d;
				};
				Params.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return Params;
			})();
			v1beta1.SendEnabled = (function() {
				function SendEnabled(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				SendEnabled.prototype.denom = '';
				SendEnabled.prototype.enabled = false;
				SendEnabled.create = function create(properties) {
					return new SendEnabled(properties);
				};
				SendEnabled.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.denom != null && Object.hasOwnProperty.call(m, 'denom')) w.uint32(10).string(m.denom);
					if (m.enabled != null && Object.hasOwnProperty.call(m, 'enabled')) w.uint32(16).bool(m.enabled);
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
						d.denom = '';
						d.enabled = false;
					}
					if (m.denom != null && m.hasOwnProperty('denom')) {
						d.denom = m.denom;
					}
					if (m.enabled != null && m.hasOwnProperty('enabled')) {
						d.enabled = m.enabled;
					}
					return d;
				};
				SendEnabled.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return SendEnabled;
			})();
			v1beta1.Input = (function() {
				function Input(p) {
					this.coins = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				Input.prototype.address = '';
				Input.prototype.coins = $util.emptyArray;
				Input.create = function create(properties) {
					return new Input(properties);
				};
				Input.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.address != null && Object.hasOwnProperty.call(m, 'address')) w.uint32(10).string(m.address);
					if (m.coins != null && m.coins.length) {
						for (var i = 0; i < m.coins.length; ++i)
							$root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
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
								m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
						if (!Array.isArray(d.coins)) throw TypeError('.cosmos.bank.v1beta1.Input.coins: array expected');
						m.coins = [];
						for (var i = 0; i < d.coins.length; ++i) {
							if (typeof d.coins[i] !== 'object') throw TypeError('.cosmos.bank.v1beta1.Input.coins: object expected');
							m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
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
						d.address = '';
					}
					if (m.address != null && m.hasOwnProperty('address')) {
						d.address = m.address;
					}
					if (m.coins && m.coins.length) {
						d.coins = [];
						for (var j = 0; j < m.coins.length; ++j) {
							d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
						}
					}
					return d;
				};
				Input.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return Input;
			})();
			v1beta1.Output = (function() {
				function Output(p) {
					this.coins = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				Output.prototype.address = '';
				Output.prototype.coins = $util.emptyArray;
				Output.create = function create(properties) {
					return new Output(properties);
				};
				Output.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.address != null && Object.hasOwnProperty.call(m, 'address')) w.uint32(10).string(m.address);
					if (m.coins != null && m.coins.length) {
						for (var i = 0; i < m.coins.length; ++i)
							$root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
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
								m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
						if (!Array.isArray(d.coins)) throw TypeError('.cosmos.bank.v1beta1.Output.coins: array expected');
						m.coins = [];
						for (var i = 0; i < d.coins.length; ++i) {
							if (typeof d.coins[i] !== 'object') throw TypeError('.cosmos.bank.v1beta1.Output.coins: object expected');
							m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
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
						d.address = '';
					}
					if (m.address != null && m.hasOwnProperty('address')) {
						d.address = m.address;
					}
					if (m.coins && m.coins.length) {
						d.coins = [];
						for (var j = 0; j < m.coins.length; ++j) {
							d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
						}
					}
					return d;
				};
				Output.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return Output;
			})();
			v1beta1.Supply = (function() {
				function Supply(p) {
					this.total = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				Supply.prototype.total = $util.emptyArray;
				Supply.create = function create(properties) {
					return new Supply(properties);
				};
				Supply.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.total != null && m.total.length) {
						for (var i = 0; i < m.total.length; ++i)
							$root.cosmos.base.v1beta1.Coin.encode(m.total[i], w.uint32(10).fork()).ldelim();
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
								m.total.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
						if (!Array.isArray(d.total)) throw TypeError('.cosmos.bank.v1beta1.Supply.total: array expected');
						m.total = [];
						for (var i = 0; i < d.total.length; ++i) {
							if (typeof d.total[i] !== 'object') throw TypeError('.cosmos.bank.v1beta1.Supply.total: object expected');
							m.total[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.total[i]);
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
							d.total[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.total[j], o);
						}
					}
					return d;
				};
				Supply.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return Supply;
			})();
			v1beta1.DenomUnit = (function() {
				function DenomUnit(p) {
					this.aliases = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				DenomUnit.prototype.denom = '';
				DenomUnit.prototype.exponent = 0;
				DenomUnit.prototype.aliases = $util.emptyArray;
				DenomUnit.create = function create(properties) {
					return new DenomUnit(properties);
				};
				DenomUnit.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.denom != null && Object.hasOwnProperty.call(m, 'denom')) w.uint32(10).string(m.denom);
					if (m.exponent != null && Object.hasOwnProperty.call(m, 'exponent')) w.uint32(16).uint32(m.exponent);
					if (m.aliases != null && m.aliases.length) {
						for (var i = 0; i < m.aliases.length; ++i) w.uint32(26).string(m.aliases[i]);
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
						if (!Array.isArray(d.aliases)) throw TypeError('.cosmos.bank.v1beta1.DenomUnit.aliases: array expected');
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
						d.denom = '';
						d.exponent = 0;
					}
					if (m.denom != null && m.hasOwnProperty('denom')) {
						d.denom = m.denom;
					}
					if (m.exponent != null && m.hasOwnProperty('exponent')) {
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
			v1beta1.Metadata = (function() {
				function Metadata(p) {
					this.denomUnits = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				Metadata.prototype.description = '';
				Metadata.prototype.denomUnits = $util.emptyArray;
				Metadata.prototype.base = '';
				Metadata.prototype.display = '';
				Metadata.prototype.name = '';
				Metadata.prototype.symbol = '';
				Metadata.create = function create(properties) {
					return new Metadata(properties);
				};
				Metadata.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.description != null && Object.hasOwnProperty.call(m, 'description')) w.uint32(10).string(m.description);
					if (m.denomUnits != null && m.denomUnits.length) {
						for (var i = 0; i < m.denomUnits.length; ++i)
							$root.cosmos.bank.v1beta1.DenomUnit.encode(m.denomUnits[i], w.uint32(18).fork()).ldelim();
					}
					if (m.base != null && Object.hasOwnProperty.call(m, 'base')) w.uint32(26).string(m.base);
					if (m.display != null && Object.hasOwnProperty.call(m, 'display')) w.uint32(34).string(m.display);
					if (m.name != null && Object.hasOwnProperty.call(m, 'name')) w.uint32(42).string(m.name);
					if (m.symbol != null && Object.hasOwnProperty.call(m, 'symbol')) w.uint32(50).string(m.symbol);
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
								m.denomUnits.push($root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32()));
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
							throw TypeError('.cosmos.bank.v1beta1.Metadata.denomUnits: array expected');
						m.denomUnits = [];
						for (var i = 0; i < d.denomUnits.length; ++i) {
							if (typeof d.denomUnits[i] !== 'object')
								throw TypeError('.cosmos.bank.v1beta1.Metadata.denomUnits: object expected');
							m.denomUnits[i] = $root.cosmos.bank.v1beta1.DenomUnit.fromObject(d.denomUnits[i]);
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
					return m;
				};
				Metadata.toObject = function toObject(m, o) {
					if (!o) o = {};
					var d = {};
					if (o.arrays || o.defaults) {
						d.denomUnits = [];
					}
					if (o.defaults) {
						d.description = '';
						d.base = '';
						d.display = '';
						d.name = '';
						d.symbol = '';
					}
					if (m.description != null && m.hasOwnProperty('description')) {
						d.description = m.description;
					}
					if (m.denomUnits && m.denomUnits.length) {
						d.denomUnits = [];
						for (var j = 0; j < m.denomUnits.length; ++j) {
							d.denomUnits[j] = $root.cosmos.bank.v1beta1.DenomUnit.toObject(m.denomUnits[j], o);
						}
					}
					if (m.base != null && m.hasOwnProperty('base')) {
						d.base = m.base;
					}
					if (m.display != null && m.hasOwnProperty('display')) {
						d.display = m.display;
					}
					if (m.name != null && m.hasOwnProperty('name')) {
						d.name = m.name;
					}
					if (m.symbol != null && m.hasOwnProperty('symbol')) {
						d.symbol = m.symbol;
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
	osmosis.gamm = (function() {
		const gamm = {};
		gamm.v1beta1 = (function() {
			const v1beta1 = {};
			v1beta1.PoolAsset = (function() {
				function PoolAsset(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				PoolAsset.prototype.token = null;
				PoolAsset.prototype.weight = '';
				PoolAsset.create = function create(properties) {
					return new PoolAsset(properties);
				};
				PoolAsset.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.token != null && Object.hasOwnProperty.call(m, 'token'))
						$root.cosmos.base.v1beta1.Coin.encode(m.token, w.uint32(10).fork()).ldelim();
					if (m.weight != null && Object.hasOwnProperty.call(m, 'weight')) w.uint32(18).string(m.weight);
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
						if (typeof d.token !== 'object') throw TypeError('.osmosis.gamm.v1beta1.PoolAsset.token: object expected');
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
						d.weight = '';
					}
					if (m.token != null && m.hasOwnProperty('token')) {
						d.token = $root.cosmos.base.v1beta1.Coin.toObject(m.token, o);
					}
					if (m.weight != null && m.hasOwnProperty('weight')) {
						d.weight = m.weight;
					}
					return d;
				};
				PoolAsset.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return PoolAsset;
			})();
			v1beta1.SmoothWeightChangeParams = (function() {
				function SmoothWeightChangeParams(p) {
					this.initialPoolWeights = [];
					this.targetPoolWeights = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				SmoothWeightChangeParams.prototype.startTime = null;
				SmoothWeightChangeParams.prototype.duration = null;
				SmoothWeightChangeParams.prototype.initialPoolWeights = $util.emptyArray;
				SmoothWeightChangeParams.prototype.targetPoolWeights = $util.emptyArray;
				SmoothWeightChangeParams.create = function create(properties) {
					return new SmoothWeightChangeParams(properties);
				};
				SmoothWeightChangeParams.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.startTime != null && Object.hasOwnProperty.call(m, 'startTime'))
						$root.google.protobuf.Timestamp.encode(m.startTime, w.uint32(10).fork()).ldelim();
					if (m.duration != null && Object.hasOwnProperty.call(m, 'duration'))
						$root.google.protobuf.Duration.encode(m.duration, w.uint32(18).fork()).ldelim();
					if (m.initialPoolWeights != null && m.initialPoolWeights.length) {
						for (var i = 0; i < m.initialPoolWeights.length; ++i)
							$root.osmosis.gamm.v1beta1.PoolAsset.encode(m.initialPoolWeights[i], w.uint32(26).fork()).ldelim();
					}
					if (m.targetPoolWeights != null && m.targetPoolWeights.length) {
						for (var i = 0; i < m.targetPoolWeights.length; ++i)
							$root.osmosis.gamm.v1beta1.PoolAsset.encode(m.targetPoolWeights[i], w.uint32(34).fork()).ldelim();
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
								m.startTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
								break;
							case 2:
								m.duration = $root.google.protobuf.Duration.decode(r, r.uint32());
								break;
							case 3:
								if (!(m.initialPoolWeights && m.initialPoolWeights.length)) m.initialPoolWeights = [];
								m.initialPoolWeights.push($root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32()));
								break;
							case 4:
								if (!(m.targetPoolWeights && m.targetPoolWeights.length)) m.targetPoolWeights = [];
								m.targetPoolWeights.push($root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32()));
								break;
							default:
								r.skipType(t & 7);
								break;
						}
					}
					return m;
				};
				SmoothWeightChangeParams.fromObject = function fromObject(d) {
					if (d instanceof $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams) return d;
					var m = new $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams();
					if (d.startTime != null) {
						if (typeof d.startTime !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.startTime: object expected');
						m.startTime = $root.google.protobuf.Timestamp.fromObject(d.startTime);
					}
					if (d.duration != null) {
						if (typeof d.duration !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.duration: object expected');
						m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
					}
					if (d.initialPoolWeights) {
						if (!Array.isArray(d.initialPoolWeights))
							throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.initialPoolWeights: array expected');
						m.initialPoolWeights = [];
						for (var i = 0; i < d.initialPoolWeights.length; ++i) {
							if (typeof d.initialPoolWeights[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.initialPoolWeights: object expected');
							m.initialPoolWeights[i] = $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(d.initialPoolWeights[i]);
						}
					}
					if (d.targetPoolWeights) {
						if (!Array.isArray(d.targetPoolWeights))
							throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.targetPoolWeights: array expected');
						m.targetPoolWeights = [];
						for (var i = 0; i < d.targetPoolWeights.length; ++i) {
							if (typeof d.targetPoolWeights[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.SmoothWeightChangeParams.targetPoolWeights: object expected');
							m.targetPoolWeights[i] = $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(d.targetPoolWeights[i]);
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
					if (m.startTime != null && m.hasOwnProperty('startTime')) {
						d.startTime = $root.google.protobuf.Timestamp.toObject(m.startTime, o);
					}
					if (m.duration != null && m.hasOwnProperty('duration')) {
						d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
					}
					if (m.initialPoolWeights && m.initialPoolWeights.length) {
						d.initialPoolWeights = [];
						for (var j = 0; j < m.initialPoolWeights.length; ++j) {
							d.initialPoolWeights[j] = $root.osmosis.gamm.v1beta1.PoolAsset.toObject(m.initialPoolWeights[j], o);
						}
					}
					if (m.targetPoolWeights && m.targetPoolWeights.length) {
						d.targetPoolWeights = [];
						for (var j = 0; j < m.targetPoolWeights.length; ++j) {
							d.targetPoolWeights[j] = $root.osmosis.gamm.v1beta1.PoolAsset.toObject(m.targetPoolWeights[j], o);
						}
					}
					return d;
				};
				SmoothWeightChangeParams.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return SmoothWeightChangeParams;
			})();
			v1beta1.PoolParams = (function() {
				function PoolParams(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				PoolParams.prototype.swapFee = '';
				PoolParams.prototype.exitFee = '';
				PoolParams.prototype.smoothWeightChangeParams = null;
				PoolParams.create = function create(properties) {
					return new PoolParams(properties);
				};
				PoolParams.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.swapFee != null && Object.hasOwnProperty.call(m, 'swapFee')) w.uint32(10).string(m.swapFee);
					if (m.exitFee != null && Object.hasOwnProperty.call(m, 'exitFee')) w.uint32(18).string(m.exitFee);
					if (m.smoothWeightChangeParams != null && Object.hasOwnProperty.call(m, 'smoothWeightChangeParams'))
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
								m.smoothWeightChangeParams = $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.decode(r, r.uint32());
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
						if (typeof d.smoothWeightChangeParams !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.PoolParams.smoothWeightChangeParams: object expected');
						m.smoothWeightChangeParams = $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.fromObject(
							d.smoothWeightChangeParams
						);
					}
					return m;
				};
				PoolParams.toObject = function toObject(m, o) {
					if (!o) o = {};
					var d = {};
					if (o.defaults) {
						d.swapFee = '';
						d.exitFee = '';
						d.smoothWeightChangeParams = null;
					}
					if (m.swapFee != null && m.hasOwnProperty('swapFee')) {
						d.swapFee = m.swapFee;
					}
					if (m.exitFee != null && m.hasOwnProperty('exitFee')) {
						d.exitFee = m.exitFee;
					}
					if (m.smoothWeightChangeParams != null && m.hasOwnProperty('smoothWeightChangeParams')) {
						d.smoothWeightChangeParams = $root.osmosis.gamm.v1beta1.SmoothWeightChangeParams.toObject(
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
			v1beta1.MsgCreatePool = (function() {
				function MsgCreatePool(p) {
					this.poolAssets = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgCreatePool.prototype.sender = '';
				MsgCreatePool.prototype.poolParams = null;
				MsgCreatePool.prototype.poolAssets = $util.emptyArray;
				MsgCreatePool.prototype.futurePoolGovernor = '';
				MsgCreatePool.create = function create(properties) {
					return new MsgCreatePool(properties);
				};
				MsgCreatePool.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolParams != null && Object.hasOwnProperty.call(m, 'poolParams'))
						$root.osmosis.gamm.v1beta1.PoolParams.encode(m.poolParams, w.uint32(18).fork()).ldelim();
					if (m.poolAssets != null && m.poolAssets.length) {
						for (var i = 0; i < m.poolAssets.length; ++i)
							$root.osmosis.gamm.v1beta1.PoolAsset.encode(m.poolAssets[i], w.uint32(26).fork()).ldelim();
					}
					if (m.futurePoolGovernor != null && Object.hasOwnProperty.call(m, 'futurePoolGovernor'))
						w.uint32(34).string(m.futurePoolGovernor);
					return w;
				};
				MsgCreatePool.decode = function decode(r, l) {
					if (!(r instanceof $Reader)) r = $Reader.create(r);
					var c = l === undefined ? r.len : r.pos + l,
						m = new $root.osmosis.gamm.v1beta1.MsgCreatePool();
					while (r.pos < c) {
						var t = r.uint32();
						switch (t >>> 3) {
							case 1:
								m.sender = r.string();
								break;
							case 2:
								m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.decode(r, r.uint32());
								break;
							case 3:
								if (!(m.poolAssets && m.poolAssets.length)) m.poolAssets = [];
								m.poolAssets.push($root.osmosis.gamm.v1beta1.PoolAsset.decode(r, r.uint32()));
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
				MsgCreatePool.fromObject = function fromObject(d) {
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgCreatePool) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgCreatePool();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.poolParams != null) {
						if (typeof d.poolParams !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.MsgCreatePool.poolParams: object expected');
						m.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.fromObject(d.poolParams);
					}
					if (d.poolAssets) {
						if (!Array.isArray(d.poolAssets))
							throw TypeError('.osmosis.gamm.v1beta1.MsgCreatePool.poolAssets: array expected');
						m.poolAssets = [];
						for (var i = 0; i < d.poolAssets.length; ++i) {
							if (typeof d.poolAssets[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.MsgCreatePool.poolAssets: object expected');
							m.poolAssets[i] = $root.osmosis.gamm.v1beta1.PoolAsset.fromObject(d.poolAssets[i]);
						}
					}
					if (d.futurePoolGovernor != null) {
						m.futurePoolGovernor = String(d.futurePoolGovernor);
					}
					return m;
				};
				MsgCreatePool.toObject = function toObject(m, o) {
					if (!o) o = {};
					var d = {};
					if (o.arrays || o.defaults) {
						d.poolAssets = [];
					}
					if (o.defaults) {
						d.sender = '';
						d.poolParams = null;
						d.futurePoolGovernor = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolParams != null && m.hasOwnProperty('poolParams')) {
						d.poolParams = $root.osmosis.gamm.v1beta1.PoolParams.toObject(m.poolParams, o);
					}
					if (m.poolAssets && m.poolAssets.length) {
						d.poolAssets = [];
						for (var j = 0; j < m.poolAssets.length; ++j) {
							d.poolAssets[j] = $root.osmosis.gamm.v1beta1.PoolAsset.toObject(m.poolAssets[j], o);
						}
					}
					if (m.futurePoolGovernor != null && m.hasOwnProperty('futurePoolGovernor')) {
						d.futurePoolGovernor = m.futurePoolGovernor;
					}
					return d;
				};
				MsgCreatePool.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgCreatePool;
			})();
			v1beta1.MsgJoinPool = (function() {
				function MsgJoinPool(p) {
					this.tokenInMaxs = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgJoinPool.prototype.sender = '';
				MsgJoinPool.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgJoinPool.prototype.shareOutAmount = '';
				MsgJoinPool.prototype.tokenInMaxs = $util.emptyArray;
				MsgJoinPool.create = function create(properties) {
					return new MsgJoinPool(properties);
				};
				MsgJoinPool.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.shareOutAmount != null && Object.hasOwnProperty.call(m, 'shareOutAmount'))
						w.uint32(26).string(m.shareOutAmount);
					if (m.tokenInMaxs != null && m.tokenInMaxs.length) {
						for (var i = 0; i < m.tokenInMaxs.length; ++i)
							$root.cosmos.base.v1beta1.Coin.encode(m.tokenInMaxs[i], w.uint32(34).fork()).ldelim();
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
								if (!(m.tokenInMaxs && m.tokenInMaxs.length)) m.tokenInMaxs = [];
								m.tokenInMaxs.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
					}
					if (d.shareOutAmount != null) {
						m.shareOutAmount = String(d.shareOutAmount);
					}
					if (d.tokenInMaxs) {
						if (!Array.isArray(d.tokenInMaxs))
							throw TypeError('.osmosis.gamm.v1beta1.MsgJoinPool.tokenInMaxs: array expected');
						m.tokenInMaxs = [];
						for (var i = 0; i < d.tokenInMaxs.length; ++i) {
							if (typeof d.tokenInMaxs[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.MsgJoinPool.tokenInMaxs: object expected');
							m.tokenInMaxs[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenInMaxs[i]);
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.shareOutAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.shareOutAmount != null && m.hasOwnProperty('shareOutAmount')) {
						d.shareOutAmount = m.shareOutAmount;
					}
					if (m.tokenInMaxs && m.tokenInMaxs.length) {
						d.tokenInMaxs = [];
						for (var j = 0; j < m.tokenInMaxs.length; ++j) {
							d.tokenInMaxs[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenInMaxs[j], o);
						}
					}
					return d;
				};
				MsgJoinPool.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgJoinPool;
			})();
			v1beta1.MsgExitPool = (function() {
				function MsgExitPool(p) {
					this.tokenOutMins = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgExitPool.prototype.sender = '';
				MsgExitPool.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgExitPool.prototype.shareInAmount = '';
				MsgExitPool.prototype.tokenOutMins = $util.emptyArray;
				MsgExitPool.create = function create(properties) {
					return new MsgExitPool(properties);
				};
				MsgExitPool.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.shareInAmount != null && Object.hasOwnProperty.call(m, 'shareInAmount'))
						w.uint32(26).string(m.shareInAmount);
					if (m.tokenOutMins != null && m.tokenOutMins.length) {
						for (var i = 0; i < m.tokenOutMins.length; ++i)
							$root.cosmos.base.v1beta1.Coin.encode(m.tokenOutMins[i], w.uint32(34).fork()).ldelim();
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
								if (!(m.tokenOutMins && m.tokenOutMins.length)) m.tokenOutMins = [];
								m.tokenOutMins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
					}
					if (d.shareInAmount != null) {
						m.shareInAmount = String(d.shareInAmount);
					}
					if (d.tokenOutMins) {
						if (!Array.isArray(d.tokenOutMins))
							throw TypeError('.osmosis.gamm.v1beta1.MsgExitPool.tokenOutMins: array expected');
						m.tokenOutMins = [];
						for (var i = 0; i < d.tokenOutMins.length; ++i) {
							if (typeof d.tokenOutMins[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.MsgExitPool.tokenOutMins: object expected');
							m.tokenOutMins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.tokenOutMins[i]);
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.shareInAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.shareInAmount != null && m.hasOwnProperty('shareInAmount')) {
						d.shareInAmount = m.shareInAmount;
					}
					if (m.tokenOutMins && m.tokenOutMins.length) {
						d.tokenOutMins = [];
						for (var j = 0; j < m.tokenOutMins.length; ++j) {
							d.tokenOutMins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOutMins[j], o);
						}
					}
					return d;
				};
				MsgExitPool.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgExitPool;
			})();
			v1beta1.SwapAmountInRoute = (function() {
				function SwapAmountInRoute(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				SwapAmountInRoute.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				SwapAmountInRoute.prototype.tokenOutDenom = '';
				SwapAmountInRoute.create = function create(properties) {
					return new SwapAmountInRoute(properties);
				};
				SwapAmountInRoute.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(8).uint64(m.poolId);
					if (m.tokenOutDenom != null && Object.hasOwnProperty.call(m, 'tokenOutDenom'))
						w.uint32(18).string(m.tokenOutDenom);
					return w;
				};
				SwapAmountInRoute.decode = function decode(r, l) {
					if (!(r instanceof $Reader)) r = $Reader.create(r);
					var c = l === undefined ? r.len : r.pos + l,
						m = new $root.osmosis.gamm.v1beta1.SwapAmountInRoute();
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
					if (d instanceof $root.osmosis.gamm.v1beta1.SwapAmountInRoute) return d;
					var m = new $root.osmosis.gamm.v1beta1.SwapAmountInRoute();
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
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
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenOutDenom = '';
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenOutDenom != null && m.hasOwnProperty('tokenOutDenom')) {
						d.tokenOutDenom = m.tokenOutDenom;
					}
					return d;
				};
				SwapAmountInRoute.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return SwapAmountInRoute;
			})();
			v1beta1.MsgSwapExactAmountIn = (function() {
				function MsgSwapExactAmountIn(p) {
					this.routes = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgSwapExactAmountIn.prototype.sender = '';
				MsgSwapExactAmountIn.prototype.routes = $util.emptyArray;
				MsgSwapExactAmountIn.prototype.tokenIn = null;
				MsgSwapExactAmountIn.prototype.tokenOutMinAmount = '';
				MsgSwapExactAmountIn.create = function create(properties) {
					return new MsgSwapExactAmountIn(properties);
				};
				MsgSwapExactAmountIn.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.routes != null && m.routes.length) {
						for (var i = 0; i < m.routes.length; ++i)
							$root.osmosis.gamm.v1beta1.SwapAmountInRoute.encode(m.routes[i], w.uint32(18).fork()).ldelim();
					}
					if (m.tokenIn != null && Object.hasOwnProperty.call(m, 'tokenIn'))
						$root.cosmos.base.v1beta1.Coin.encode(m.tokenIn, w.uint32(26).fork()).ldelim();
					if (m.tokenOutMinAmount != null && Object.hasOwnProperty.call(m, 'tokenOutMinAmount'))
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
								m.routes.push($root.osmosis.gamm.v1beta1.SwapAmountInRoute.decode(r, r.uint32()));
								break;
							case 3:
								m.tokenIn = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
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
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountIn();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.routes) {
						if (!Array.isArray(d.routes))
							throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountIn.routes: array expected');
						m.routes = [];
						for (var i = 0; i < d.routes.length; ++i) {
							if (typeof d.routes[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountIn.routes: object expected');
							m.routes[i] = $root.osmosis.gamm.v1beta1.SwapAmountInRoute.fromObject(d.routes[i]);
						}
					}
					if (d.tokenIn != null) {
						if (typeof d.tokenIn !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountIn.tokenIn: object expected');
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
						d.sender = '';
						d.tokenIn = null;
						d.tokenOutMinAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.routes && m.routes.length) {
						d.routes = [];
						for (var j = 0; j < m.routes.length; ++j) {
							d.routes[j] = $root.osmosis.gamm.v1beta1.SwapAmountInRoute.toObject(m.routes[j], o);
						}
					}
					if (m.tokenIn != null && m.hasOwnProperty('tokenIn')) {
						d.tokenIn = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenIn, o);
					}
					if (m.tokenOutMinAmount != null && m.hasOwnProperty('tokenOutMinAmount')) {
						d.tokenOutMinAmount = m.tokenOutMinAmount;
					}
					return d;
				};
				MsgSwapExactAmountIn.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgSwapExactAmountIn;
			})();
			v1beta1.SwapAmountOutRoute = (function() {
				function SwapAmountOutRoute(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				SwapAmountOutRoute.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				SwapAmountOutRoute.prototype.tokenInDenom = '';
				SwapAmountOutRoute.create = function create(properties) {
					return new SwapAmountOutRoute(properties);
				};
				SwapAmountOutRoute.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(8).uint64(m.poolId);
					if (m.tokenInDenom != null && Object.hasOwnProperty.call(m, 'tokenInDenom'))
						w.uint32(18).string(m.tokenInDenom);
					return w;
				};
				SwapAmountOutRoute.decode = function decode(r, l) {
					if (!(r instanceof $Reader)) r = $Reader.create(r);
					var c = l === undefined ? r.len : r.pos + l,
						m = new $root.osmosis.gamm.v1beta1.SwapAmountOutRoute();
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
					if (d instanceof $root.osmosis.gamm.v1beta1.SwapAmountOutRoute) return d;
					var m = new $root.osmosis.gamm.v1beta1.SwapAmountOutRoute();
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
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
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenInDenom = '';
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenInDenom != null && m.hasOwnProperty('tokenInDenom')) {
						d.tokenInDenom = m.tokenInDenom;
					}
					return d;
				};
				SwapAmountOutRoute.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return SwapAmountOutRoute;
			})();
			v1beta1.MsgSwapExactAmountOut = (function() {
				function MsgSwapExactAmountOut(p) {
					this.routes = [];
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgSwapExactAmountOut.prototype.sender = '';
				MsgSwapExactAmountOut.prototype.routes = $util.emptyArray;
				MsgSwapExactAmountOut.prototype.tokenInMaxAmount = '';
				MsgSwapExactAmountOut.prototype.tokenOut = null;
				MsgSwapExactAmountOut.create = function create(properties) {
					return new MsgSwapExactAmountOut(properties);
				};
				MsgSwapExactAmountOut.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.routes != null && m.routes.length) {
						for (var i = 0; i < m.routes.length; ++i)
							$root.osmosis.gamm.v1beta1.SwapAmountOutRoute.encode(m.routes[i], w.uint32(18).fork()).ldelim();
					}
					if (m.tokenInMaxAmount != null && Object.hasOwnProperty.call(m, 'tokenInMaxAmount'))
						w.uint32(26).string(m.tokenInMaxAmount);
					if (m.tokenOut != null && Object.hasOwnProperty.call(m, 'tokenOut'))
						$root.cosmos.base.v1beta1.Coin.encode(m.tokenOut, w.uint32(34).fork()).ldelim();
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
								m.routes.push($root.osmosis.gamm.v1beta1.SwapAmountOutRoute.decode(r, r.uint32()));
								break;
							case 3:
								m.tokenInMaxAmount = r.string();
								break;
							case 4:
								m.tokenOut = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
								break;
							default:
								r.skipType(t & 7);
								break;
						}
					}
					return m;
				};
				MsgSwapExactAmountOut.fromObject = function fromObject(d) {
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgSwapExactAmountOut();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.routes) {
						if (!Array.isArray(d.routes))
							throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountOut.routes: array expected');
						m.routes = [];
						for (var i = 0; i < d.routes.length; ++i) {
							if (typeof d.routes[i] !== 'object')
								throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountOut.routes: object expected');
							m.routes[i] = $root.osmosis.gamm.v1beta1.SwapAmountOutRoute.fromObject(d.routes[i]);
						}
					}
					if (d.tokenInMaxAmount != null) {
						m.tokenInMaxAmount = String(d.tokenInMaxAmount);
					}
					if (d.tokenOut != null) {
						if (typeof d.tokenOut !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.MsgSwapExactAmountOut.tokenOut: object expected');
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
						d.sender = '';
						d.tokenInMaxAmount = '';
						d.tokenOut = null;
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.routes && m.routes.length) {
						d.routes = [];
						for (var j = 0; j < m.routes.length; ++j) {
							d.routes[j] = $root.osmosis.gamm.v1beta1.SwapAmountOutRoute.toObject(m.routes[j], o);
						}
					}
					if (m.tokenInMaxAmount != null && m.hasOwnProperty('tokenInMaxAmount')) {
						d.tokenInMaxAmount = m.tokenInMaxAmount;
					}
					if (m.tokenOut != null && m.hasOwnProperty('tokenOut')) {
						d.tokenOut = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOut, o);
					}
					return d;
				};
				MsgSwapExactAmountOut.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgSwapExactAmountOut;
			})();
			v1beta1.MsgJoinSwapExternAmountIn = (function() {
				function MsgJoinSwapExternAmountIn(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgJoinSwapExternAmountIn.prototype.sender = '';
				MsgJoinSwapExternAmountIn.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgJoinSwapExternAmountIn.prototype.tokenIn = null;
				MsgJoinSwapExternAmountIn.prototype.shareOutMinAmount = '';
				MsgJoinSwapExternAmountIn.create = function create(properties) {
					return new MsgJoinSwapExternAmountIn(properties);
				};
				MsgJoinSwapExternAmountIn.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.tokenIn != null && Object.hasOwnProperty.call(m, 'tokenIn'))
						$root.cosmos.base.v1beta1.Coin.encode(m.tokenIn, w.uint32(26).fork()).ldelim();
					if (m.shareOutMinAmount != null && Object.hasOwnProperty.call(m, 'shareOutMinAmount'))
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
								m.tokenIn = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
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
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
					}
					if (d.tokenIn != null) {
						if (typeof d.tokenIn !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.tokenIn: object expected');
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenIn = null;
						d.shareOutMinAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenIn != null && m.hasOwnProperty('tokenIn')) {
						d.tokenIn = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenIn, o);
					}
					if (m.shareOutMinAmount != null && m.hasOwnProperty('shareOutMinAmount')) {
						d.shareOutMinAmount = m.shareOutMinAmount;
					}
					return d;
				};
				MsgJoinSwapExternAmountIn.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgJoinSwapExternAmountIn;
			})();
			v1beta1.MsgJoinSwapShareAmountOut = (function() {
				function MsgJoinSwapShareAmountOut(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgJoinSwapShareAmountOut.prototype.sender = '';
				MsgJoinSwapShareAmountOut.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgJoinSwapShareAmountOut.prototype.tokenInDenom = '';
				MsgJoinSwapShareAmountOut.prototype.shareOutAmount = '';
				MsgJoinSwapShareAmountOut.prototype.tokenInMaxAmount = '';
				MsgJoinSwapShareAmountOut.create = function create(properties) {
					return new MsgJoinSwapShareAmountOut(properties);
				};
				MsgJoinSwapShareAmountOut.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.tokenInDenom != null && Object.hasOwnProperty.call(m, 'tokenInDenom'))
						w.uint32(26).string(m.tokenInDenom);
					if (m.shareOutAmount != null && Object.hasOwnProperty.call(m, 'shareOutAmount'))
						w.uint32(34).string(m.shareOutAmount);
					if (m.tokenInMaxAmount != null && Object.hasOwnProperty.call(m, 'tokenInMaxAmount'))
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
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenInDenom = '';
						d.shareOutAmount = '';
						d.tokenInMaxAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenInDenom != null && m.hasOwnProperty('tokenInDenom')) {
						d.tokenInDenom = m.tokenInDenom;
					}
					if (m.shareOutAmount != null && m.hasOwnProperty('shareOutAmount')) {
						d.shareOutAmount = m.shareOutAmount;
					}
					if (m.tokenInMaxAmount != null && m.hasOwnProperty('tokenInMaxAmount')) {
						d.tokenInMaxAmount = m.tokenInMaxAmount;
					}
					return d;
				};
				MsgJoinSwapShareAmountOut.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgJoinSwapShareAmountOut;
			})();
			v1beta1.MsgExitSwapShareAmountIn = (function() {
				function MsgExitSwapShareAmountIn(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgExitSwapShareAmountIn.prototype.sender = '';
				MsgExitSwapShareAmountIn.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgExitSwapShareAmountIn.prototype.tokenOutDenom = '';
				MsgExitSwapShareAmountIn.prototype.shareInAmount = '';
				MsgExitSwapShareAmountIn.prototype.tokenOutMinAmount = '';
				MsgExitSwapShareAmountIn.create = function create(properties) {
					return new MsgExitSwapShareAmountIn(properties);
				};
				MsgExitSwapShareAmountIn.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.tokenOutDenom != null && Object.hasOwnProperty.call(m, 'tokenOutDenom'))
						w.uint32(26).string(m.tokenOutDenom);
					if (m.shareInAmount != null && Object.hasOwnProperty.call(m, 'shareInAmount'))
						w.uint32(34).string(m.shareInAmount);
					if (m.tokenOutMinAmount != null && Object.hasOwnProperty.call(m, 'tokenOutMinAmount'))
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
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenOutDenom = '';
						d.shareInAmount = '';
						d.tokenOutMinAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenOutDenom != null && m.hasOwnProperty('tokenOutDenom')) {
						d.tokenOutDenom = m.tokenOutDenom;
					}
					if (m.shareInAmount != null && m.hasOwnProperty('shareInAmount')) {
						d.shareInAmount = m.shareInAmount;
					}
					if (m.tokenOutMinAmount != null && m.hasOwnProperty('tokenOutMinAmount')) {
						d.tokenOutMinAmount = m.tokenOutMinAmount;
					}
					return d;
				};
				MsgExitSwapShareAmountIn.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgExitSwapShareAmountIn;
			})();
			v1beta1.MsgExitSwapExternAmountOut = (function() {
				function MsgExitSwapExternAmountOut(p) {
					if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
				}
				MsgExitSwapExternAmountOut.prototype.sender = '';
				MsgExitSwapExternAmountOut.prototype.poolId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
				MsgExitSwapExternAmountOut.prototype.tokenOut = null;
				MsgExitSwapExternAmountOut.prototype.shareInMaxAmount = '';
				MsgExitSwapExternAmountOut.create = function create(properties) {
					return new MsgExitSwapExternAmountOut(properties);
				};
				MsgExitSwapExternAmountOut.encode = function encode(m, w) {
					if (!w) w = $Writer.create();
					if (m.sender != null && Object.hasOwnProperty.call(m, 'sender')) w.uint32(10).string(m.sender);
					if (m.poolId != null && Object.hasOwnProperty.call(m, 'poolId')) w.uint32(16).uint64(m.poolId);
					if (m.tokenOut != null && Object.hasOwnProperty.call(m, 'tokenOut'))
						$root.cosmos.base.v1beta1.Coin.encode(m.tokenOut, w.uint32(26).fork()).ldelim();
					if (m.shareInMaxAmount != null && Object.hasOwnProperty.call(m, 'shareInMaxAmount'))
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
								m.tokenOut = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
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
					if (d instanceof $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut) return d;
					var m = new $root.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut();
					if (d.sender != null) {
						m.sender = String(d.sender);
					}
					if (d.poolId != null) {
						if ($util.Long) (m.poolId = $util.Long.fromValue(d.poolId)).unsigned = true;
						else if (typeof d.poolId === 'string') m.poolId = parseInt(d.poolId, 10);
						else if (typeof d.poolId === 'number') m.poolId = d.poolId;
						else if (typeof d.poolId === 'object')
							m.poolId = new $util.LongBits(d.poolId.low >>> 0, d.poolId.high >>> 0).toNumber(true);
					}
					if (d.tokenOut != null) {
						if (typeof d.tokenOut !== 'object')
							throw TypeError('.osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut.tokenOut: object expected');
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
						d.sender = '';
						if ($util.Long) {
							var n = new $util.Long(0, 0, true);
							d.poolId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
						} else d.poolId = o.longs === String ? '0' : 0;
						d.tokenOut = null;
						d.shareInMaxAmount = '';
					}
					if (m.sender != null && m.hasOwnProperty('sender')) {
						d.sender = m.sender;
					}
					if (m.poolId != null && m.hasOwnProperty('poolId')) {
						if (typeof m.poolId === 'number') d.poolId = o.longs === String ? String(m.poolId) : m.poolId;
						else
							d.poolId =
								o.longs === String
									? $util.Long.prototype.toString.call(m.poolId)
									: o.longs === Number
									? new $util.LongBits(m.poolId.low >>> 0, m.poolId.high >>> 0).toNumber(true)
									: m.poolId;
					}
					if (m.tokenOut != null && m.hasOwnProperty('tokenOut')) {
						d.tokenOut = $root.cosmos.base.v1beta1.Coin.toObject(m.tokenOut, o);
					}
					if (m.shareInMaxAmount != null && m.hasOwnProperty('shareInMaxAmount')) {
						d.shareInMaxAmount = m.shareInMaxAmount;
					}
					return d;
				};
				MsgExitSwapExternAmountOut.prototype.toJSON = function toJSON() {
					return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
				};
				return MsgExitSwapExternAmountOut;
			})();
			return v1beta1;
		})();
		return gamm;
	})();
	osmosis.lockup = (function() {
		const lockup = {};
		lockup.LockQueryType = (function() {
			const valuesById = {},
				values = Object.create(valuesById);
			values[(valuesById[0] = 'ByDuration')] = 0;
			values[(valuesById[1] = 'ByTime')] = 1;
			return values;
		})();
		lockup.QueryCondition = (function() {
			function QueryCondition(p) {
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			QueryCondition.prototype.lockQueryType = 0;
			QueryCondition.prototype.denom = '';
			QueryCondition.prototype.duration = null;
			QueryCondition.prototype.timestamp = null;
			QueryCondition.create = function create(properties) {
				return new QueryCondition(properties);
			};
			QueryCondition.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.lockQueryType != null && Object.hasOwnProperty.call(m, 'lockQueryType'))
					w.uint32(8).int32(m.lockQueryType);
				if (m.denom != null && Object.hasOwnProperty.call(m, 'denom')) w.uint32(18).string(m.denom);
				if (m.duration != null && Object.hasOwnProperty.call(m, 'duration'))
					$root.google.protobuf.Duration.encode(m.duration, w.uint32(26).fork()).ldelim();
				if (m.timestamp != null && Object.hasOwnProperty.call(m, 'timestamp'))
					$root.google.protobuf.Timestamp.encode(m.timestamp, w.uint32(34).fork()).ldelim();
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
							m.timestamp = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
					case 'ByDuration':
					case 0:
						m.lockQueryType = 0;
						break;
					case 'ByTime':
					case 1:
						m.lockQueryType = 1;
						break;
				}
				if (d.denom != null) {
					m.denom = String(d.denom);
				}
				if (d.duration != null) {
					if (typeof d.duration !== 'object')
						throw TypeError('.osmosis.lockup.QueryCondition.duration: object expected');
					m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
				}
				if (d.timestamp != null) {
					if (typeof d.timestamp !== 'object')
						throw TypeError('.osmosis.lockup.QueryCondition.timestamp: object expected');
					m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
				}
				return m;
			};
			QueryCondition.toObject = function toObject(m, o) {
				if (!o) o = {};
				var d = {};
				if (o.defaults) {
					d.lockQueryType = o.enums === String ? 'ByDuration' : 0;
					d.denom = '';
					d.duration = null;
					d.timestamp = null;
				}
				if (m.lockQueryType != null && m.hasOwnProperty('lockQueryType')) {
					d.lockQueryType = o.enums === String ? $root.osmosis.lockup.LockQueryType[m.lockQueryType] : m.lockQueryType;
				}
				if (m.denom != null && m.hasOwnProperty('denom')) {
					d.denom = m.denom;
				}
				if (m.duration != null && m.hasOwnProperty('duration')) {
					d.duration = $root.google.protobuf.Duration.toObject(m.duration, o);
				}
				if (m.timestamp != null && m.hasOwnProperty('timestamp')) {
					d.timestamp = $root.google.protobuf.Timestamp.toObject(m.timestamp, o);
				}
				return d;
			};
			QueryCondition.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return QueryCondition;
		})();
		lockup.MsgLockTokens = (function() {
			function MsgLockTokens(p) {
				this.coins = [];
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			MsgLockTokens.prototype.owner = '';
			MsgLockTokens.prototype.duration = null;
			MsgLockTokens.prototype.coins = $util.emptyArray;
			MsgLockTokens.create = function create(properties) {
				return new MsgLockTokens(properties);
			};
			MsgLockTokens.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.owner != null && Object.hasOwnProperty.call(m, 'owner')) w.uint32(10).string(m.owner);
				if (m.duration != null && Object.hasOwnProperty.call(m, 'duration'))
					$root.google.protobuf.Duration.encode(m.duration, w.uint32(18).fork()).ldelim();
				if (m.coins != null && m.coins.length) {
					for (var i = 0; i < m.coins.length; ++i)
						$root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(26).fork()).ldelim();
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
							m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
					if (typeof d.duration !== 'object')
						throw TypeError('.osmosis.lockup.MsgLockTokens.duration: object expected');
					m.duration = $root.google.protobuf.Duration.fromObject(d.duration);
				}
				if (d.coins) {
					if (!Array.isArray(d.coins)) throw TypeError('.osmosis.lockup.MsgLockTokens.coins: array expected');
					m.coins = [];
					for (var i = 0; i < d.coins.length; ++i) {
						if (typeof d.coins[i] !== 'object') throw TypeError('.osmosis.lockup.MsgLockTokens.coins: object expected');
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
					d.owner = '';
					d.duration = null;
				}
				if (m.owner != null && m.hasOwnProperty('owner')) {
					d.owner = m.owner;
				}
				if (m.duration != null && m.hasOwnProperty('duration')) {
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
		lockup.MsgBeginUnlockingAll = (function() {
			function MsgBeginUnlockingAll(p) {
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			MsgBeginUnlockingAll.prototype.owner = '';
			MsgBeginUnlockingAll.create = function create(properties) {
				return new MsgBeginUnlockingAll(properties);
			};
			MsgBeginUnlockingAll.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.owner != null && Object.hasOwnProperty.call(m, 'owner')) w.uint32(10).string(m.owner);
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
					d.owner = '';
				}
				if (m.owner != null && m.hasOwnProperty('owner')) {
					d.owner = m.owner;
				}
				return d;
			};
			MsgBeginUnlockingAll.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return MsgBeginUnlockingAll;
		})();
		lockup.MsgBeginUnlocking = (function() {
			function MsgBeginUnlocking(p) {
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			MsgBeginUnlocking.prototype.owner = '';
			MsgBeginUnlocking.prototype.ID = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
			MsgBeginUnlocking.create = function create(properties) {
				return new MsgBeginUnlocking(properties);
			};
			MsgBeginUnlocking.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.owner != null && Object.hasOwnProperty.call(m, 'owner')) w.uint32(10).string(m.owner);
				if (m.ID != null && Object.hasOwnProperty.call(m, 'ID')) w.uint32(16).uint64(m.ID);
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
					else if (typeof d.ID === 'string') m.ID = parseInt(d.ID, 10);
					else if (typeof d.ID === 'number') m.ID = d.ID;
					else if (typeof d.ID === 'object') m.ID = new $util.LongBits(d.ID.low >>> 0, d.ID.high >>> 0).toNumber(true);
				}
				return m;
			};
			MsgBeginUnlocking.toObject = function toObject(m, o) {
				if (!o) o = {};
				var d = {};
				if (o.defaults) {
					d.owner = '';
					if ($util.Long) {
						var n = new $util.Long(0, 0, true);
						d.ID = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
					} else d.ID = o.longs === String ? '0' : 0;
				}
				if (m.owner != null && m.hasOwnProperty('owner')) {
					d.owner = m.owner;
				}
				if (m.ID != null && m.hasOwnProperty('ID')) {
					if (typeof m.ID === 'number') d.ID = o.longs === String ? String(m.ID) : m.ID;
					else
						d.ID =
							o.longs === String
								? $util.Long.prototype.toString.call(m.ID)
								: o.longs === Number
								? new $util.LongBits(m.ID.low >>> 0, m.ID.high >>> 0).toNumber(true)
								: m.ID;
				}
				return d;
			};
			MsgBeginUnlocking.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return MsgBeginUnlocking;
		})();
		return lockup;
	})();
	osmosis.incentives = (function() {
		const incentives = {};
		incentives.MsgCreateGauge = (function() {
			function MsgCreateGauge(p) {
				this.coins = [];
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			MsgCreateGauge.prototype.isPerpetual = false;
			MsgCreateGauge.prototype.owner = '';
			MsgCreateGauge.prototype.distributeTo = null;
			MsgCreateGauge.prototype.coins = $util.emptyArray;
			MsgCreateGauge.prototype.startTime = null;
			MsgCreateGauge.prototype.numEpochsPaidOver = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
			MsgCreateGauge.create = function create(properties) {
				return new MsgCreateGauge(properties);
			};
			MsgCreateGauge.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.isPerpetual != null && Object.hasOwnProperty.call(m, 'isPerpetual')) w.uint32(8).bool(m.isPerpetual);
				if (m.owner != null && Object.hasOwnProperty.call(m, 'owner')) w.uint32(18).string(m.owner);
				if (m.distributeTo != null && Object.hasOwnProperty.call(m, 'distributeTo'))
					$root.osmosis.lockup.QueryCondition.encode(m.distributeTo, w.uint32(26).fork()).ldelim();
				if (m.coins != null && m.coins.length) {
					for (var i = 0; i < m.coins.length; ++i)
						$root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(34).fork()).ldelim();
				}
				if (m.startTime != null && Object.hasOwnProperty.call(m, 'startTime'))
					$root.google.protobuf.Timestamp.encode(m.startTime, w.uint32(42).fork()).ldelim();
				if (m.numEpochsPaidOver != null && Object.hasOwnProperty.call(m, 'numEpochsPaidOver'))
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
							m.distributeTo = $root.osmosis.lockup.QueryCondition.decode(r, r.uint32());
							break;
						case 4:
							if (!(m.coins && m.coins.length)) m.coins = [];
							m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
							break;
						case 5:
							m.startTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
					if (typeof d.distributeTo !== 'object')
						throw TypeError('.osmosis.incentives.MsgCreateGauge.distributeTo: object expected');
					m.distributeTo = $root.osmosis.lockup.QueryCondition.fromObject(d.distributeTo);
				}
				if (d.coins) {
					if (!Array.isArray(d.coins)) throw TypeError('.osmosis.incentives.MsgCreateGauge.coins: array expected');
					m.coins = [];
					for (var i = 0; i < d.coins.length; ++i) {
						if (typeof d.coins[i] !== 'object')
							throw TypeError('.osmosis.incentives.MsgCreateGauge.coins: object expected');
						m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
					}
				}
				if (d.startTime != null) {
					if (typeof d.startTime !== 'object')
						throw TypeError('.osmosis.incentives.MsgCreateGauge.startTime: object expected');
					m.startTime = $root.google.protobuf.Timestamp.fromObject(d.startTime);
				}
				if (d.numEpochsPaidOver != null) {
					if ($util.Long) (m.numEpochsPaidOver = $util.Long.fromValue(d.numEpochsPaidOver)).unsigned = true;
					else if (typeof d.numEpochsPaidOver === 'string') m.numEpochsPaidOver = parseInt(d.numEpochsPaidOver, 10);
					else if (typeof d.numEpochsPaidOver === 'number') m.numEpochsPaidOver = d.numEpochsPaidOver;
					else if (typeof d.numEpochsPaidOver === 'object')
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
					d.owner = '';
					d.distributeTo = null;
					d.startTime = null;
					if ($util.Long) {
						var n = new $util.Long(0, 0, true);
						d.numEpochsPaidOver = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
					} else d.numEpochsPaidOver = o.longs === String ? '0' : 0;
				}
				if (m.isPerpetual != null && m.hasOwnProperty('isPerpetual')) {
					d.isPerpetual = m.isPerpetual;
				}
				if (m.owner != null && m.hasOwnProperty('owner')) {
					d.owner = m.owner;
				}
				if (m.distributeTo != null && m.hasOwnProperty('distributeTo')) {
					d.distributeTo = $root.osmosis.lockup.QueryCondition.toObject(m.distributeTo, o);
				}
				if (m.coins && m.coins.length) {
					d.coins = [];
					for (var j = 0; j < m.coins.length; ++j) {
						d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
					}
				}
				if (m.startTime != null && m.hasOwnProperty('startTime')) {
					d.startTime = $root.google.protobuf.Timestamp.toObject(m.startTime, o);
				}
				if (m.numEpochsPaidOver != null && m.hasOwnProperty('numEpochsPaidOver')) {
					if (typeof m.numEpochsPaidOver === 'number')
						d.numEpochsPaidOver = o.longs === String ? String(m.numEpochsPaidOver) : m.numEpochsPaidOver;
					else
						d.numEpochsPaidOver =
							o.longs === String
								? $util.Long.prototype.toString.call(m.numEpochsPaidOver)
								: o.longs === Number
								? new $util.LongBits(m.numEpochsPaidOver.low >>> 0, m.numEpochsPaidOver.high >>> 0).toNumber(true)
								: m.numEpochsPaidOver;
				}
				return d;
			};
			MsgCreateGauge.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return MsgCreateGauge;
		})();
		incentives.MsgAddToGauge = (function() {
			function MsgAddToGauge(p) {
				this.rewards = [];
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			MsgAddToGauge.prototype.owner = '';
			MsgAddToGauge.prototype.gaugeId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
			MsgAddToGauge.prototype.rewards = $util.emptyArray;
			MsgAddToGauge.create = function create(properties) {
				return new MsgAddToGauge(properties);
			};
			MsgAddToGauge.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.owner != null && Object.hasOwnProperty.call(m, 'owner')) w.uint32(10).string(m.owner);
				if (m.gaugeId != null && Object.hasOwnProperty.call(m, 'gaugeId')) w.uint32(16).uint64(m.gaugeId);
				if (m.rewards != null && m.rewards.length) {
					for (var i = 0; i < m.rewards.length; ++i)
						$root.cosmos.base.v1beta1.Coin.encode(m.rewards[i], w.uint32(26).fork()).ldelim();
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
							m.rewards.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
					if ($util.Long) (m.gaugeId = $util.Long.fromValue(d.gaugeId)).unsigned = true;
					else if (typeof d.gaugeId === 'string') m.gaugeId = parseInt(d.gaugeId, 10);
					else if (typeof d.gaugeId === 'number') m.gaugeId = d.gaugeId;
					else if (typeof d.gaugeId === 'object')
						m.gaugeId = new $util.LongBits(d.gaugeId.low >>> 0, d.gaugeId.high >>> 0).toNumber(true);
				}
				if (d.rewards) {
					if (!Array.isArray(d.rewards)) throw TypeError('.osmosis.incentives.MsgAddToGauge.rewards: array expected');
					m.rewards = [];
					for (var i = 0; i < d.rewards.length; ++i) {
						if (typeof d.rewards[i] !== 'object')
							throw TypeError('.osmosis.incentives.MsgAddToGauge.rewards: object expected');
						m.rewards[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.rewards[i]);
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
					d.owner = '';
					if ($util.Long) {
						var n = new $util.Long(0, 0, true);
						d.gaugeId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
					} else d.gaugeId = o.longs === String ? '0' : 0;
				}
				if (m.owner != null && m.hasOwnProperty('owner')) {
					d.owner = m.owner;
				}
				if (m.gaugeId != null && m.hasOwnProperty('gaugeId')) {
					if (typeof m.gaugeId === 'number') d.gaugeId = o.longs === String ? String(m.gaugeId) : m.gaugeId;
					else
						d.gaugeId =
							o.longs === String
								? $util.Long.prototype.toString.call(m.gaugeId)
								: o.longs === Number
								? new $util.LongBits(m.gaugeId.low >>> 0, m.gaugeId.high >>> 0).toNumber(true)
								: m.gaugeId;
				}
				if (m.rewards && m.rewards.length) {
					d.rewards = [];
					for (var j = 0; j < m.rewards.length; ++j) {
						d.rewards[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.rewards[j], o);
					}
				}
				return d;
			};
			MsgAddToGauge.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return MsgAddToGauge;
		})();
		return incentives;
	})();
	return osmosis;
})();
exports.google = $root.google = (() => {
	const google = {};
	google.protobuf = (function() {
		const protobuf = {};
		protobuf.Duration = (function() {
			function Duration(p) {
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			Duration.prototype.seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
			Duration.prototype.nanos = 0;
			Duration.create = function create(properties) {
				return new Duration(properties);
			};
			Duration.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.seconds != null && Object.hasOwnProperty.call(m, 'seconds')) w.uint32(8).int64(m.seconds);
				if (m.nanos != null && Object.hasOwnProperty.call(m, 'nanos')) w.uint32(16).int32(m.nanos);
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
					if ($util.Long) (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
					else if (typeof d.seconds === 'string') m.seconds = parseInt(d.seconds, 10);
					else if (typeof d.seconds === 'number') m.seconds = d.seconds;
					else if (typeof d.seconds === 'object')
						m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
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
						d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
					} else d.seconds = o.longs === String ? '0' : 0;
					d.nanos = 0;
				}
				if (m.seconds != null && m.hasOwnProperty('seconds')) {
					if (typeof m.seconds === 'number') d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
					else
						d.seconds =
							o.longs === String
								? $util.Long.prototype.toString.call(m.seconds)
								: o.longs === Number
								? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber()
								: m.seconds;
				}
				if (m.nanos != null && m.hasOwnProperty('nanos')) {
					d.nanos = m.nanos;
				}
				return d;
			};
			Duration.prototype.toJSON = function toJSON() {
				return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
			};
			return Duration;
		})();
		protobuf.Timestamp = (function() {
			function Timestamp(p) {
				if (p) for (var ks = Object.keys(p), i = 0; i < ks.length; ++i) if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
			}
			Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
			Timestamp.prototype.nanos = 0;
			Timestamp.create = function create(properties) {
				return new Timestamp(properties);
			};
			Timestamp.encode = function encode(m, w) {
				if (!w) w = $Writer.create();
				if (m.seconds != null && Object.hasOwnProperty.call(m, 'seconds')) w.uint32(8).int64(m.seconds);
				if (m.nanos != null && Object.hasOwnProperty.call(m, 'nanos')) w.uint32(16).int32(m.nanos);
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
					if ($util.Long) (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
					else if (typeof d.seconds === 'string') m.seconds = parseInt(d.seconds, 10);
					else if (typeof d.seconds === 'number') m.seconds = d.seconds;
					else if (typeof d.seconds === 'object')
						m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
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
						d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
					} else d.seconds = o.longs === String ? '0' : 0;
					d.nanos = 0;
				}
				if (m.seconds != null && m.hasOwnProperty('seconds')) {
					if (typeof m.seconds === 'number') d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
					else
						d.seconds =
							o.longs === String
								? $util.Long.prototype.toString.call(m.seconds)
								: o.longs === Number
								? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber()
								: m.seconds;
				}
				if (m.nanos != null && m.hasOwnProperty('nanos')) {
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
