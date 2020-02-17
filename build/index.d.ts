import { BisAddress, BisCompany, BisCompanyBusinessIdChange, BisCompanyBusinessLine, BisCompanyContactDetail, BisCompanyDetails, BisCompanyForm, BisCompanyLanguage, BisCompanyLiquidation, BisCompanyName, BisCompanyRegisteredEntry, BisCompanyRegisteredOffice, BisConfig, BisRequestQueryCompanyNumber, BisRequestQueryDetail, BisReturnBody, StructedCompanyInfomation } from "./Bisv1";
export declare class BisApi {
    options: BisConfig;
    responseString: string;
    constructor(options: (BisConfig | null));
    /**
     * init and get a proper query object for query with Id.
     * @param busid
     */
    initBisCompanyNumberQueryObject(busid: string): BisRequestQueryCompanyNumber;
    /**
     * init and get a proper query object with query with params.
     * @param inputObj
     */
    typeQueryBody(inputObj: object): BisRequestQueryDetail;
    /**
     *  Query By Company Id Entrance
     * @param inputId
     */
    getCompanyDetailWithBusinessId(inputId: string): Promise<BisReturnBody>;
    /**
     *  Query By Company Object in different field Entrance
     * @param inputObj
     */
    getCompanyDetailWithQueryParam(inputObj: object): Promise<BisReturnBody>;
    /**
     * return structed data of company by business Id.
     * @param inputId
     */
    getCompanyWithBID(inputId: string): Promise<StructedCompanyInfomation[]>;
    /**
     * return structed data of company by query params.
     * @param inputObj
     */
    getCompanyWithParam(inputObj: object): Promise<StructedCompanyInfomation[]>;
    protected parsingResultsToStructed(results: BisCompanyDetails[]): Promise<StructedCompanyInfomation>[];
    protected fetchFirstLatestValueByKey(sortKey: string, key: string, inputArr: []): any;
    protected validateCompanyQueryInput(inputObj: object): void;
    protected isValidDate(dateString: string): boolean;
    /**
     * Process the case when there for BIS/V1/{businessID}
     * @param input
     *
     */
    protected queryCompanyNumber(input: BisRequestQueryCompanyNumber): Promise<BisReturnBody>;
    /**
     * Process for the case check with query
     * @param queryObj
     *
     */
    protected queryWithCompanyObject(queryObj: BisRequestQueryDetail): Promise<BisReturnBody>;
    protected ajaxGetRequests(urlOptions: string): Promise<unknown>;
    protected assignReturnBodyToType(jsonStrings: string): BisReturnBody;
    protected initBisCompanyDetailQueryObject(): BisRequestQueryDetail;
    protected initBisReturnBody(): BisReturnBody;
    protected initBisCompanyDetails(): BisCompanyDetails;
    protected initBisCompanyName(): BisCompanyName;
    protected initBisAddress(): BisAddress;
    protected initBisCompanyForm(): BisCompanyForm;
    protected initBisCompanyLiquidation(): BisCompanyLiquidation;
    protected initBisCompanyBusinessLine(): BisCompanyBusinessLine;
    protected initBisCompanyLanguage(): BisCompanyLanguage;
    protected initBisCompanyRegisteredOffice(): BisCompanyRegisteredOffice;
    protected initBisCompanyContactDetail(): BisCompanyContactDetail;
    protected initBisCompanyRegisteredEntry(): BisCompanyRegisteredEntry;
    protected initBisCompanyBusinessIdChange(): BisCompanyBusinessIdChange;
    protected initBisCompany(): BisCompany;
    protected initStructedCompanyInfomation(): StructedCompanyInfomation;
}
//# sourceMappingURL=index.d.ts.map