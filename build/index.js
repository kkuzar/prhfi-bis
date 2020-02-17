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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const defaultOptions = {
    hostname: "avoindata.prh.fi",
    port: 443,
    path: "/bis/v1",
    method: "GET",
    protocol: "https"
};
class BisApi {
    // ================ Exposed functions below ========================================
    constructor(options) {
        this.responseString = "";
        if ((options === null) || (typeof options === 'undefined')) {
            this.options = defaultOptions;
        }
        else {
            this.options = options;
        }
    }
    /**
     * init and get a proper query object for query with Id.
     * @param busid
     */
    initBisCompanyNumberQueryObject(busid) {
        let res = {
            businessId: busid
        };
        return res;
    }
    /**
     * init and get a proper query object with query with params.
     * @param inputObj
     */
    typeQueryBody(inputObj) {
        let companyQuery = this.initBisCompanyDetailQueryObject();
        this.validateCompanyQueryInput(inputObj);
        // @ts-ignore
        if (inputObj.hasOwnProperty('totalResults'))
            companyQuery.totalResults = inputObj.totalResults;
        // @ts-ignore
        if (inputObj.hasOwnProperty('maxResults'))
            companyQuery.maxResults = inputObj.maxResults;
        // @ts-ignore
        if (inputObj.hasOwnProperty('resultsFrom'))
            companyQuery.resultsFrom = inputObj.resultsFrom;
        // @ts-ignore
        if (inputObj.hasOwnProperty('name'))
            companyQuery.name = inputObj.name;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessId'))
            companyQuery.businessId = inputObj.businessId;
        // @ts-ignore
        if (inputObj.hasOwnProperty('registeredOffice'))
            companyQuery.registeredOffice = inputObj.registeredOffice;
        // @ts-ignore
        if (inputObj.hasOwnProperty('streetAddressPostCode'))
            companyQuery.streetAddressPostCode = inputObj.streetAddressPostCode;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyForm'))
            companyQuery.companyForm = inputObj.companyForm;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessLine'))
            companyQuery.businessLine = inputObj.businessLine;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessLineCode'))
            companyQuery.businessLineCode = inputObj.businessLineCode;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyRegistrationFrom'))
            companyQuery.companyRegistrationFrom = inputObj.companyRegistrationFrom;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyRegistrationTo'))
            companyQuery.companyRegistrationTo = inputObj.companyRegistrationTo;
        return companyQuery;
    }
    /**
     *  Query By Company Id Entrance
     * @param inputId
     */
    getCompanyDetailWithBusinessId(inputId) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestObj = this.initBisCompanyNumberQueryObject(inputId);
            return yield this.queryCompanyNumber(requestObj);
        });
    }
    /**
     *  Query By Company Object in different field Entrance
     * @param inputObj
     */
    getCompanyDetailWithQueryParam(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryObj = this.typeQueryBody(inputObj);
            return yield this.queryWithCompanyObject(queryObj);
        });
    }
    /**
     * return structed data of company by business Id.
     * @param inputId
     */
    getCompanyWithBID(inputId) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let requestObj = that.initBisCompanyNumberQueryObject(inputId);
            let returnBody = yield that.queryCompanyNumber(requestObj);
            if (returnBody.results.length === 0)
                return [];
            let res = yield that.parsingResultsToStructed(returnBody.results);
            return Promise.all(res);
        });
    }
    /**
     * return structed data of company by query params.
     * @param inputObj
     */
    getCompanyWithParam(inputObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let queryObj = that.typeQueryBody(inputObj);
            let returnBody = yield that.queryWithCompanyObject(queryObj);
            let companysResults = [];
            if (returnBody.results.length === 0)
                return [];
            if (returnBody.results.length === 1) {
                // This is the case that located only one company, which will return full detail.
                // With this case do exactly like the things we do in fetch by business Id.
                return Promise.all(that.parsingResultsToStructed(returnBody.results));
            }
            if (returnBody.results.length > 1) {
                // This case have to iterate the breif msg.
                let urls = returnBody.results.map(function (e) {
                    if (e.detailsUri) {
                        return e.detailsUri;
                    }
                });
                let ids = urls.map(function (e) {
                    if (String(e).length) {
                        let strArr = String(e).split("/");
                        return strArr[strArr.length - 1];
                    }
                });
                let loop = 0;
                for (loop; loop < ids.length; loop++) {
                    let tmp = yield this.getCompanyWithBID(String(ids[loop]));
                    if (tmp.length) {
                        companysResults.push(tmp[0]);
                    }
                }
            }
            return companysResults;
        });
    }
    // ==================== internal functions below ===========================================
    parsingResultsToStructed(results) {
        let that = this;
        return results.map(function (e) {
            return __awaiter(this, void 0, void 0, function* () {
                let companyItem = that.initStructedCompanyInfomation();
                companyItem.name = e.name;
                companyItem.businessId = e.businessId;
                companyItem.companyForm = e.companyForm;
                // @ts-ignore
                companyItem.latestAddr = yield that.fetchFirstLatestValueByKey("registrationDate", "street", e.addresses);
                // @ts-ignore
                companyItem.latestPost = yield that.fetchFirstLatestValueByKey("registrationDate", "postCode", e.addresses);
                // @ts-ignore
                companyItem.latestPost = yield that.fetchFirstLatestValueByKey("registrationDate", "city", e.addresses);
                // @ts-ignore
                companyItem.latestAuxiliaryNames = yield that.fetchFirstLatestValueByKey("registrationDate", "name", e.auxiliaryNames);
                // @ts-ignore
                companyItem.website = yield that.fetchFirstLatestValueByKey("registrationDate", "value", e.contactDetails);
                // @ts-ignore
                companyItem.latestBusinessCode = yield that.fetchFirstLatestValueByKey("registrationDate", "code", e.businessLines);
                // @ts-ignore
                companyItem.latestBusinessLine = yield that.fetchFirstLatestValueByKey("registrationDate", "name", e.businessLines);
                // @ts-ignore
                return companyItem;
            });
        });
    }
    fetchFirstLatestValueByKey(sortKey, key, inputArr) {
        let sortedArr = inputArr.sort((a, b) => {
            // @ts-ignore
            return (Date(a[sortKey]) > Date(b[sortKey])) ? 1 : -1;
        });
        if (sortedArr.length) {
            // @ts-ignore
            return sortedArr[0][key];
        }
        return "";
    }
    validateCompanyQueryInput(inputObj) {
        let companyType = { AOY: "AOY", OYJ: "OYJ", OY: "OY", OK: "OK", VOJ: "VOJ" };
        if (inputObj.hasOwnProperty("companyRegistrationFrom") || inputObj.hasOwnProperty("companyRegistrationTo")) {
            // @ts-ignore
            if (!this.isValidDate(inputObj.companyRegistrationFrom) && inputObj.companyRegistrationFrom) {
                throw new Error("companyRegistrationFrom the Date is not in Valid form");
            }
            // @ts-ignore
            if (!this.isValidDate(inputObj.companyRegistrationTo) && inputObj.companyRegistrationTo) {
                throw new Error("companyRegistrationTo the Date is not in Valid form");
            }
        }
        if (inputObj.hasOwnProperty("companyForm")) {
            // @ts-ignore
            if (inputObj.companyForm && !(String(inputObj.companyForm).toUpperCase() in companyType)) {
                throw new Error("companyForm is not in Valid form");
            }
        }
    }
    isValidDate(dateString) {
        var regEx = /^\d{4}-\d{2}-\d{2}$/g;
        if (!regEx.exec(dateString))
            return false; // Invalid format
        var d = new Date(dateString);
        var dNum = d.getTime();
        if (!dNum && dNum !== 0)
            return false; // NaN value, Invalid date
        return d.toISOString().slice(0, 10) === dateString;
    }
    /**
     * Process the case when there for BIS/V1/{businessID}
     * @param input
     *
     */
    queryCompanyNumber(input) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            const FINNISH_BUSINESS_ID = /^[\d]{7}-[\d]/gm;
            let reg = FINNISH_BUSINESS_ID.exec(input.businessId);
            if (reg === null)
                throw new Error("business Id is not Valid");
            let url = [that.options.protocol, "://", this.options.hostname, this.options.path, "/", input.businessId].join("");
            const response = yield that.ajaxGetRequests(url)
                .then((res) => {
                // @ts-ignore
                that.responseString = res.body;
            }).catch((err) => console.error(err));
            return that.assignReturnBodyToType(that.responseString);
        });
    }
    /**
     * Process for the case check with query
     * @param queryObj
     *
     */
    queryWithCompanyObject(queryObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            let getQuery = [];
            if (queryObj) {
                Object.keys(queryObj).map(function (k, i) {
                    // @ts-ignore
                    if (queryObj[k] !== null && (typeof queryObj[k] !== 'undefined') && (queryObj[k] !== "")) {
                        // @ts-ignore
                        getQuery.push(k + "=" + encodeURI(queryObj[k]));
                    }
                });
            }
            let url = [that.options.protocol, "://", that.options.hostname, that.options.path, "?", getQuery.join("&")].join("");
            const response = yield that.ajaxGetRequests(url)
                .then((res) => {
                // @ts-ignore
                that.responseString = res.body;
            }).catch((err) => console.error(err));
            return that.assignReturnBodyToType(that.responseString);
        });
    }
    ajaxGetRequests(urlOptions) {
        return new Promise((resolve, reject) => {
            const req = https_1.default.get(urlOptions, (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk.toString()));
                res.on('error', reject);
                res.on('end', () => {
                    // @ts-ignore
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
                    }
                    else {
                        reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                    }
                });
            });
            req.on('error', reject);
            // req.write(data, 'binary');
            req.end();
        });
    }
    assignReturnBodyToType(jsonStrings) {
        let jsonObj = JSON.parse(jsonStrings);
        let dataReturn = this.initBisReturnBody();
        [jsonObj].forEach(function (out_e) {
            dataReturn.type = out_e.type;
            dataReturn.version = out_e.version;
            dataReturn.totalResults = out_e.totalResults;
            dataReturn.resultsFrom = out_e.resultsFrom;
            dataReturn.previousResultsUri = out_e.previousResultsUri;
            dataReturn.nextResultsUri = out_e.nextResultsUri;
            dataReturn.exceptionNoticeUri = out_e.exceptionNoticeUri;
            dataReturn.results = out_e.results;
        });
        return dataReturn;
    }
    // ====================== initializers ===================================
    initBisCompanyDetailQueryObject() {
        let res = {
            totalResults: "false",
            maxResults: "10",
            resultsFrom: "0",
            name: "",
            businessId: "",
            registeredOffice: "",
            streetAddressPostCode: "",
            companyForm: "",
            businessLine: "",
            businessLineCode: "",
            companyRegistrationFrom: "",
            companyRegistrationTo: ""
        };
        return res;
    }
    initBisReturnBody() {
        return {
            type: "",
            version: "",
            totalResults: 0,
            resultsFrom: 0,
            previousResultsUri: null,
            nextResultsUri: null,
            exceptionNoticeUri: null,
            results: []
        };
    }
    initBisCompanyDetails() {
        return {
            names: null,
            auxiliaryNames: null,
            addresses: null,
            companyForms: null,
            liquidations: null,
            businessLines: null,
            languages: null,
            registeredOffices: null,
            contactDetails: null,
            registeredEntries: null,
            businessIdChanges: null,
            businessId: "",
            registrationDate: "",
            companyForm: null,
            detailsUri: null,
            name: "",
        };
    }
    initBisCompanyName() {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        };
    }
    initBisAddress() {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            careOf: null,
            street: null,
            postCode: null,
            city: null,
            language: null,
            type: 0,
            country: null,
        };
    }
    initBisCompanyForm() {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
            type: "",
        };
    }
    initBisCompanyLiquidation() {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
            type: "",
        };
    }
    initBisCompanyBusinessLine() {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        };
    }
    initBisCompanyLanguage() {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        };
    }
    initBisCompanyRegisteredOffice() {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        };
    }
    initBisCompanyContactDetail() {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            language: null,
            value: "",
            type: "",
        };
    }
    initBisCompanyRegisteredEntry() {
        return {
            description: "",
            status: 0,
            registrationDate: "",
            endDate: null,
            register: 0,
            language: null,
            authority: 0,
        };
    }
    initBisCompanyBusinessIdChange() {
        return {
            source: null,
            description: "",
            reason: "",
            changeDate: "",
            change: 0,
            oldBusinessId: "",
            newBusinessId: "",
            language: null,
        };
    }
    initBisCompany() {
        return {
            businessId: "",
            registrationDate: "",
            companyForm: null,
            detailsUri: null,
            name: ""
        };
    }
    initStructedCompanyInfomation() {
        return {
            name: null,
            businessId: null,
            companyForm: null,
            website: null,
            latestAddr: null,
            latestPost: null,
            latestCity: null,
            latestBusinessCode: null,
            latestBusinessLine: null,
            latestAuxiliaryNames: null,
        };
    }
}
exports.BisApi = BisApi;
//# sourceMappingURL=index.js.map