import { getErrorMessage, logMessage, } from './helpers';
import { HistoryProvider, } from './history-provider';
import { DataPulseProvider } from './data-pulse-provider';
import { QuotesPulseProvider } from './quotes-pulse-provider';
import { SymbolsStorage } from './symbols-storage';
function extractField(data, field, arrayIndex) {
    const value = data[field];
    return Array.isArray(value) ? value[arrayIndex] : value;
}
/**
 * This class implements interaction with UDF-compatible datafeed.
 * See [UDF protocol reference](@docs/connecting_data/UDF)
 */
export class UDFCompatibleDatafeedBase {
    constructor(datafeedURL, quotesProvider, requester, updateFrequency = 10 * 1000, limitedServerResponse) {
        this._configuration = defaultConfiguration();
        this._symbolsStorage = null;
        this._datafeedURL = datafeedURL;
        this._requester = requester;
        this._historyProvider = new HistoryProvider(datafeedURL, this._requester, limitedServerResponse);
        this._quotesProvider = quotesProvider;
        this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency);
        this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);
        this._configurationReadyPromise = this._requestConfiguration()
            .then((configuration) => {
            if (configuration === null) {
                configuration = defaultConfiguration();
            }
            this._setupWithConfiguration(configuration);
        });
    }
    onReady(callback) {
        this._configurationReadyPromise.then(() => {
            callback(this._configuration);
        });
    }
    getQuotes(symbols, onDataCallback, onErrorCallback) {
        this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
    }
    subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
        this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
    }
    unsubscribeQuotes(listenerGuid) {
        this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
    }
    getMarks(symbolInfo, from, to, onDataCallback, resolution) {
        if (!this._configuration.supports_marks) {
            return;
        }
        const requestParams = {
            symbol: symbolInfo.ticker || '',
            from: from,
            to: to,
            resolution: resolution,
        };
        this._send('marks', requestParams)
            .then((response) => {
            if (!Array.isArray(response)) {
                const result = [];
                for (let i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i),
                        color: extractField(response, 'color', i),
                        text: extractField(response, 'text', i),
                        label: extractField(response, 'label', i),
                        labelFontColor: extractField(response, 'labelFontColor', i),
                        minSize: extractField(response, 'minSize', i),
                        borderWidth: extractField(response, 'borderWidth', i),
                        hoveredBorderWidth: extractField(response, 'hoveredBorderWidth', i),
                        imageUrl: extractField(response, 'imageUrl', i),
                        showLabelWhenImageLoaded: extractField(response, 'showLabelWhenImageLoaded', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch((error) => {
            logMessage(`UdfCompatibleDatafeed: Request marks failed: ${getErrorMessage(error)}`);
            onDataCallback([]);
        });
    }
    getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
        if (!this._configuration.supports_timescale_marks) {
            return;
        }
        const requestParams = {
            symbol: symbolInfo.ticker || '',
            from: from,
            to: to,
            resolution: resolution,
        };
        this._send('timescale_marks', requestParams)
            .then((response) => {
            if (!Array.isArray(response)) {
                const result = [];
                for (let i = 0; i < response.id.length; ++i) {
                    result.push({
                        id: extractField(response, 'id', i),
                        time: extractField(response, 'time', i),
                        color: extractField(response, 'color', i),
                        label: extractField(response, 'label', i),
                        tooltip: extractField(response, 'tooltip', i),
                        imageUrl: extractField(response, 'imageUrl', i),
                        showLabelWhenImageLoaded: extractField(response, 'showLabelWhenImageLoaded', i),
                    });
                }
                response = result;
            }
            onDataCallback(response);
        })
            .catch((error) => {
            logMessage(`UdfCompatibleDatafeed: Request timescale marks failed: ${getErrorMessage(error)}`);
            onDataCallback([]);
        });
    }
    getServerTime(callback) {
        if (!this._configuration.supports_time) {
            return;
        }
        this._send('time')
            .then((response) => {
            const time = parseInt(response);
            if (!isNaN(time)) {
                callback(time);
            }
        })
            .catch((error) => {
            logMessage(`UdfCompatibleDatafeed: Fail to load server time, error=${getErrorMessage(error)}`);
        });
    }
    searchSymbols(userInput, exchange, symbolType, onResult) {
        if (this._configuration.supports_search) {
            const params = {
                limit: 30 /* Constants.SearchItemsLimit */,
                query: userInput.toUpperCase(),
                type: symbolType,
                exchange: exchange,
            };
            this._send('search', params)
                .then((response) => {
                if (response.s !== undefined) {
                    logMessage(`UdfCompatibleDatafeed: search symbols error=${response.errmsg}`);
                    onResult([]);
                    return;
                }
                onResult(response);
            })
                .catch((reason) => {
                logMessage(`UdfCompatibleDatafeed: Search symbols for '${userInput}' failed. Error=${getErrorMessage(reason)}`);
                onResult([]);
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, 30 /* Constants.SearchItemsLimit */)
                .then(onResult)
                .catch(onResult.bind(null, []));
        }
    }
    resolveSymbol(symbolName, onResolve, onError, extension) {
        logMessage('Resolve requested');
        const currencyCode = extension && extension.currencyCode;
        const unitId = extension && extension.unitId;
        const resolveRequestStartTime = Date.now();
        function onResultReady(symbolInfo) {
            logMessage(`Symbol resolved: ${Date.now() - resolveRequestStartTime}ms`);
            onResolve(symbolInfo);
        }
        if (!this._configuration.supports_group_request) {
            const params = {
                symbol: symbolName,
            };
            if (currencyCode !== undefined) {
                params.currencyCode = currencyCode;
            }
            if (unitId !== undefined) {
                params.unitId = unitId;
            }
            this._send('symbols', params)
                .then((response) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
                if (response.s !== undefined) {
                    onError('unknown_symbol');
                }
                else {
                    const symbol = response.name;
                    const listedExchange = (_a = response.listed_exchange) !== null && _a !== void 0 ? _a : response['exchange-listed'];
                    const tradedExchange = (_b = response.exchange) !== null && _b !== void 0 ? _b : response['exchange-traded'];
                    const result = {
                        ...response,
                        name: symbol,
                        base_name: [listedExchange + ':' + symbol],
                        listed_exchange: listedExchange,
                        exchange: tradedExchange,
                        ticker: response.ticker,
                        currency_code: (_c = response.currency_code) !== null && _c !== void 0 ? _c : response['currency-code'],
                        original_currency_code: (_d = response.original_currency_code) !== null && _d !== void 0 ? _d : response['original-currency-code'],
                        unit_id: (_e = response.unit_id) !== null && _e !== void 0 ? _e : response['unit-id'],
                        original_unit_id: (_f = response.original_unit_id) !== null && _f !== void 0 ? _f : response['original-unit-id'],
                        unit_conversion_types: (_g = response.unit_conversion_types) !== null && _g !== void 0 ? _g : response['unit-conversion-types'],
                        has_intraday: (_j = (_h = response.has_intraday) !== null && _h !== void 0 ? _h : response['has-intraday']) !== null && _j !== void 0 ? _j : false,
                        visible_plots_set: (_k = response.visible_plots_set) !== null && _k !== void 0 ? _k : response['visible-plots-set'],
                        minmov: (_m = (_l = response.minmovement) !== null && _l !== void 0 ? _l : response.minmov) !== null && _m !== void 0 ? _m : 0,
                        minmove2: (_o = response.minmovement2) !== null && _o !== void 0 ? _o : response.minmove2,
                        session: (_p = response.session) !== null && _p !== void 0 ? _p : response['session-regular'],
                        session_holidays: (_q = response.session_holidays) !== null && _q !== void 0 ? _q : response['session-holidays'],
                        supported_resolutions: (_t = (_s = (_r = response.supported_resolutions) !== null && _r !== void 0 ? _r : response['supported-resolutions']) !== null && _s !== void 0 ? _s : this._configuration.supported_resolutions) !== null && _t !== void 0 ? _t : [],
                        has_daily: (_v = (_u = response.has_daily) !== null && _u !== void 0 ? _u : response['has-daily']) !== null && _v !== void 0 ? _v : true,
                        intraday_multipliers: (_x = (_w = response.intraday_multipliers) !== null && _w !== void 0 ? _w : response['intraday-multipliers']) !== null && _x !== void 0 ? _x : ['1', '5', '15', '30', '60'],
                        has_weekly_and_monthly: (_y = response.has_weekly_and_monthly) !== null && _y !== void 0 ? _y : response['has-weekly-and-monthly'],
                        has_empty_bars: (_z = response.has_empty_bars) !== null && _z !== void 0 ? _z : response['has-empty-bars'],
                        volume_precision: (_0 = response.volume_precision) !== null && _0 !== void 0 ? _0 : response['volume-precision'],
                        format: (_1 = response.format) !== null && _1 !== void 0 ? _1 : 'price',
                    };
                    onResultReady(result);
                }
            })
                .catch((reason) => {
                logMessage(`UdfCompatibleDatafeed: Error resolving symbol: ${getErrorMessage(reason)}`);
                onError('unknown_symbol');
            });
        }
        else {
            if (this._symbolsStorage === null) {
                throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
            }
            this._symbolsStorage.resolveSymbol(symbolName, currencyCode, unitId).then(onResultReady).catch(onError);
        }
    }
    getBars(symbolInfo, resolution, periodParams, onResult, onError) {
        this._historyProvider.getBars(symbolInfo, resolution, periodParams)
            .then((result) => {
            onResult(result.bars, result.meta);
        })
            .catch(onError);
    }
    subscribeBars(symbolInfo, resolution, onTick, listenerGuid, _onResetCacheNeededCallback) {
        this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
    }
    unsubscribeBars(listenerGuid) {
        this._dataPulseProvider.unsubscribeBars(listenerGuid);
    }
    _requestConfiguration() {
        return this._send('config')
            .catch((reason) => {
            logMessage(`UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=${getErrorMessage(reason)}`);
            return null;
        });
    }
    _send(urlPath, params) {
        return this._requester.sendRequest(this._datafeedURL, urlPath, params);
    }
    _setupWithConfiguration(configurationData) {
        this._configuration = configurationData;
        if (configurationData.exchanges === undefined) {
            configurationData.exchanges = [];
        }
        if (!configurationData.supports_search && !configurationData.supports_group_request) {
            throw new Error('Unsupported datafeed configuration. Must either support search, or support group request');
        }
        if (configurationData.supports_group_request || !configurationData.supports_search) {
            this._symbolsStorage = new SymbolsStorage(this._datafeedURL, configurationData.supported_resolutions || [], this._requester);
        }
        logMessage(`UdfCompatibleDatafeed: Initialized with ${JSON.stringify(configurationData)}`);
    }
}
function defaultConfiguration() {
    return {
        supports_search: false,
        supports_group_request: true,
        supported_resolutions: [
            '1',
            '5',
            '15',
            '30',
            '60',
            '1D',
            '1W',
            '1M',
        ],
        supports_marks: false,
        supports_timescale_marks: false,
    };
}
