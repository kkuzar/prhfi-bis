import https from 'https'
import {
    BisAddress,
    BisCompany,
    BisCompanyBusinessIdChange,
    BisCompanyBusinessLine,
    BisCompanyContactDetail,
    BisCompanyDetails,
    BisCompanyForm,
    BisCompanyLanguage,
    BisCompanyLiquidation,
    BisCompanyName,
    BisCompanyRegisteredEntry,
    BisCompanyRegisteredOffice,
    BisConfig,
    BisRequestQueryCompanyNumber,
    BisRequestQueryDetail,
    BisReturnBody,
    StructedCompanyInfomation
} from "./Bisv1";

const defaultOptions: BisConfig = {
    hostname: "avoindata.prh.fi",
    port: 443,
    path: "/bis/v1",
    method: "GET",
    protocol: "https"
};

export class BisApi {

    public options: BisConfig;
    public responseString: string = "";

// ================ Exposed functions below ========================================

    public constructor(options: (BisConfig | null)) {
        if ((options === null) || (typeof options === 'undefined')) {
            this.options = defaultOptions;
        } else {
            this.options = options;
        }
    }

    /**
     * init and get a proper query object for query with Id.
     * @param busid
     */
    public initBisCompanyNumberQueryObject(busid: string) {
        let res: BisRequestQueryCompanyNumber = {
            businessId: busid
        };
        return res;
    }

    /**
     * init and get a proper query object with query with params.
     * @param inputObj
     */
    public typeQueryBody(inputObj: object): BisRequestQueryDetail {
        let companyQuery: BisRequestQueryDetail = this.initBisCompanyDetailQueryObject();
        this.validateCompanyQueryInput(inputObj);

        // @ts-ignore
        if (inputObj.hasOwnProperty('totalResults')) companyQuery.totalResults = inputObj.totalResults;
        // @ts-ignore
        if (inputObj.hasOwnProperty('maxResults')) companyQuery.maxResults = inputObj.maxResults;
        // @ts-ignore
        if (inputObj.hasOwnProperty('resultsFrom')) companyQuery.resultsFrom = inputObj.resultsFrom;
        // @ts-ignore
        if (inputObj.hasOwnProperty('name')) companyQuery.name = inputObj.name;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessId')) companyQuery.businessId = inputObj.businessId;
        // @ts-ignore
        if (inputObj.hasOwnProperty('registeredOffice')) companyQuery.registeredOffice = inputObj.registeredOffice;
        // @ts-ignore
        if (inputObj.hasOwnProperty('streetAddressPostCode')) companyQuery.streetAddressPostCode = inputObj.streetAddressPostCode;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyForm')) companyQuery.companyForm = inputObj.companyForm;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessLine')) companyQuery.businessLine = inputObj.businessLine;
        // @ts-ignore
        if (inputObj.hasOwnProperty('businessLineCode')) companyQuery.businessLineCode = inputObj.businessLineCode;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyRegistrationFrom')) companyQuery.companyRegistrationFrom = inputObj.companyRegistrationFrom;
        // @ts-ignore
        if (inputObj.hasOwnProperty('companyRegistrationTo')) companyQuery.companyRegistrationTo = inputObj.companyRegistrationTo;

        return companyQuery;
    }

    /**
     *  Query By Company Id Entrance
     * @param inputId
     */
    public async getCompanyDetailWithBusinessId(inputId: string) {
        let requestObj = this.initBisCompanyNumberQueryObject(inputId);
        return await this.queryCompanyNumber(requestObj);
    }

    /**
     *  Query By Company Object in different field Entrance
     * @param inputObj
     */
    public async getCompanyDetailWithQueryParam(inputObj: object) {
        let queryObj: BisRequestQueryDetail = this.typeQueryBody(inputObj);
        return await this.queryWithCompanyObject(queryObj);
    }

    /**
     * return structed data of company by business Id.
     * @param inputId
     */
    public async getCompanyWithBID(inputId: string): Promise<StructedCompanyInfomation[]> {
        let that = this;
        let requestObj = that.initBisCompanyNumberQueryObject(inputId);
        let returnBody = await that.queryCompanyNumber(requestObj);

        if (returnBody.results.length === 0) return [];
        let res = await that.parsingResultsToStructed(returnBody.results);
        return Promise.all(res);
    }

    /**
     * return structed data of company by query params.
     * @param inputObj
     */
    public async getCompanyWithParam(inputObj: object) {
        let that = this;
        let queryObj: BisRequestQueryDetail = that.typeQueryBody(inputObj);
        let returnBody = await that.queryWithCompanyObject(queryObj);
        let companysResults: StructedCompanyInfomation [] = [];

        if (returnBody.results.length === 0) return [];

        if (returnBody.results.length === 1) {
            // This is the case that located only one company, which will return full detail.
            // With this case do exactly like the things we do in fetch by business Id.
            return  Promise.all(that.parsingResultsToStructed(returnBody.results));
        }

        if (returnBody.results.length > 1) {
            // This case have to iterate the breif msg.
            let urls = returnBody.results.map(function (e) {
                if (e.detailsUri) {
                    return e.detailsUri
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
                let tmp = await this.getCompanyWithBID(String(ids[loop]));
                if (tmp.length) {
                    companysResults.push(tmp[0]);
                }
            }

        }
        return companysResults;
    }

// ==================== internal functions below ===========================================

    protected parsingResultsToStructed(results: BisCompanyDetails[]) {
        let that = this;
        return results.map(async function (e) {
            let companyItem: StructedCompanyInfomation = that.initStructedCompanyInfomation();
            companyItem.name = e.name;
            companyItem.businessId = e.businessId;
            companyItem.companyForm = e.companyForm;
            // @ts-ignore
            companyItem.latestAddr = await that.fetchFirstLatestValueByKey("registrationDate", "street", e.addresses);
            // @ts-ignore
            companyItem.latestPost = await that.fetchFirstLatestValueByKey("registrationDate", "postCode", e.addresses);
            // @ts-ignore
            companyItem.latestPost = await that.fetchFirstLatestValueByKey("registrationDate", "city", e.addresses);
            // @ts-ignore
            companyItem.latestAuxiliaryNames = await that.fetchFirstLatestValueByKey("registrationDate", "name", e.auxiliaryNames);
            // @ts-ignore
            companyItem.website = await that.fetchFirstLatestValueByKey("registrationDate", "value", e.contactDetails);
            // @ts-ignore
            companyItem.latestBusinessCode = await that.fetchFirstLatestValueByKey("registrationDate", "code", e.businessLines);
            // @ts-ignore
            companyItem.latestBusinessLine = await that.fetchFirstLatestValueByKey("registrationDate", "name", e.businessLines);

            // @ts-ignore
            return companyItem;
        });
    }

    protected fetchFirstLatestValueByKey(sortKey: string, key: string, inputArr: []) {
        let sortedArr = inputArr.sort((a: object, b: object) => {
            // @ts-ignore
            return (Date(a[sortKey]) > Date(b[sortKey])) ? 1 : -1;
        });

        if (sortedArr.length) {
            // @ts-ignore
            return sortedArr[0][key];
        }
        return ""
    }

    protected validateCompanyQueryInput(inputObj: object) {
        let companyType = {AOY: "AOY", OYJ: "OYJ", OY: "OY", OK: "OK", VOJ: "VOJ"};
        if (inputObj.hasOwnProperty("companyRegistrationFrom") || inputObj.hasOwnProperty("companyRegistrationTo")) {
            // @ts-ignore
            if (!this.isValidDate(inputObj.companyRegistrationFrom) && inputObj.companyRegistrationFrom) {
                throw  new Error("companyRegistrationFrom the Date is not in Valid form");
            }
            // @ts-ignore
            if (!this.isValidDate(inputObj.companyRegistrationTo) && inputObj.companyRegistrationTo) {
                throw  new Error("companyRegistrationTo the Date is not in Valid form");
            }
        }

        if (inputObj.hasOwnProperty("companyForm")) {
            // @ts-ignore
            if (inputObj.companyForm && !(String(inputObj.companyForm).toUpperCase() in companyType)) {
                throw  new Error("companyForm is not in Valid form");
            }
        }
    }

    protected isValidDate(dateString: string) {
        var regEx = /^\d{4}-\d{2}-\d{2}$/g;
        if (!regEx.exec(dateString)) return false;  // Invalid format
        var d = new Date(dateString);
        var dNum = d.getTime();
        if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return d.toISOString().slice(0, 10) === dateString;
    }

    /**
     * Process the case when there for BIS/V1/{businessID}
     * @param input
     *
     */
    protected async queryCompanyNumber(input: BisRequestQueryCompanyNumber): Promise<BisReturnBody> {
        let that = this;
        const FINNISH_BUSINESS_ID = /^[\d]{7}-[\d]/gm;
        let reg = FINNISH_BUSINESS_ID.exec(input.businessId);
        if (reg === null) throw new Error("business Id is not Valid");

        let url = [that.options.protocol, "://", this.options.hostname, this.options.path, "/", input.businessId].join("");

        const response = await that.ajaxGetRequests(url)
            .then((res) => {
                // @ts-ignore
                that.responseString = res.body
            }).catch((err) => console.error(err));

        return that.assignReturnBodyToType(that.responseString);
    }

    /**
     * Process for the case check with query
     * @param queryObj
     *
     */
    protected async queryWithCompanyObject(queryObj: BisRequestQueryDetail): Promise<BisReturnBody> {
        let that = this;
        let getQuery: string[] = [];

        if (queryObj) {
            Object.keys(queryObj).map(function (k, i) {
                // @ts-ignore
                if (queryObj[k] !== null && (typeof queryObj[k] !== 'undefined') && (queryObj[k] !== "")) {
                    // @ts-ignore
                    getQuery.push(k + "=" + encodeURI(queryObj[k]));
                }
            })
        }

        let url = [that.options.protocol, "://", that.options.hostname, that.options.path, "?", getQuery.join("&")].join("");

        const response = await that.ajaxGetRequests(url)
            .then((res) => {
                // @ts-ignore
                that.responseString = res.body
            }).catch((err) => console.error(err));

        return that.assignReturnBodyToType(that.responseString);
    }

    protected ajaxGetRequests(urlOptions: string) {
        return new Promise((resolve, reject) => {
            const req = https.get(urlOptions,
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk.toString()));
                    res.on('error', reject);
                    res.on('end', () => {
                        // @ts-ignore
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            resolve({statusCode: res.statusCode, headers: res.headers, body: body});
                        } else {
                            reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                        }
                    });
                });
            req.on('error', reject);
            // req.write(data, 'binary');
            req.end();
        });
    }

    protected assignReturnBodyToType(jsonStrings: string): BisReturnBody {
        let jsonObj = JSON.parse(jsonStrings);
        let dataReturn: BisReturnBody = this.initBisReturnBody();

        [jsonObj].forEach(function (out_e: BisReturnBody) {
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

    protected initBisCompanyDetailQueryObject() {
        let res: BisRequestQueryDetail = {
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

    protected initBisReturnBody(): BisReturnBody {
        return {
            type: "",
            version: "",
            totalResults: 0,
            resultsFrom: 0,
            previousResultsUri: null,
            nextResultsUri: null,
            exceptionNoticeUri: null,
            results: []
        }
    }

    protected initBisCompanyDetails(): BisCompanyDetails {
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
        }
    }

    protected initBisCompanyName(): BisCompanyName {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        }
    }

    protected initBisAddress(): BisAddress {
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
        }
    }

    protected initBisCompanyForm(): BisCompanyForm {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
            type: "",
        }
    }

    protected initBisCompanyLiquidation(): BisCompanyLiquidation {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
            type: "",
        }
    }

    protected initBisCompanyBusinessLine(): BisCompanyBusinessLine {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        }
    }

    protected initBisCompanyLanguage(): BisCompanyLanguage {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        }
    }

    protected initBisCompanyRegisteredOffice(): BisCompanyRegisteredOffice {
        return {
            source: null,
            order: 0,
            version: 0,
            registrationDate: "",
            endDate: null,
            name: "",
            language: null,
        }
    }

    protected initBisCompanyContactDetail(): BisCompanyContactDetail {
        return {
            source: null,
            version: 0,
            registrationDate: "",
            endDate: null,
            language: null,
            value: "",
            type: "",
        }
    }

    protected initBisCompanyRegisteredEntry(): BisCompanyRegisteredEntry {
        return {
            description: "",
            status: 0,
            registrationDate: "",
            endDate: null,
            register: 0,
            language: null,
            authority: 0,
        }
    }

    protected initBisCompanyBusinessIdChange(): BisCompanyBusinessIdChange {
        return {
            source: null,
            description: "",
            reason: "",
            changeDate: "",
            change: 0,
            oldBusinessId: "",
            newBusinessId: "",
            language: null,
        }
    }

    protected initBisCompany(): BisCompany {
        return {
            businessId: "",
            registrationDate: "",
            companyForm: null,
            detailsUri: null,
            name: ""
        }
    }

    protected initStructedCompanyInfomation(): StructedCompanyInfomation {
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
        }
    }
}
