/**
 *  Typesd for the BIS v1 return body.
 */

export type BisCompany = {
    businessId : string,
    registrationDate : string,
    companyForm: (string | null),
    detailsUri: (string | null),
    name: string
}

export type BisCompanyName = {
    source : (number | null),
    order : number,
    version : number,
    registrationDate : string,
    endDate : (string | null),
    name : string,
    language : (string | null),
}

export type BisAddress = {
    source : (number | null),
    version : number,
    registrationDate : string,
    endDate : (string | null),
    careOf : (string | null),
    street : (string | null),
    postCode : (string | null),
    city : (string | null),
    language : (string | null),
    type : number,
    country : (string | null),
}

export type BisCompanyForm = {
    source : (number | null),
    version : number,
    registrationDate : string,
    endDate : (string | null),
    name : string,
    language : (string | null),
    type : string,
}

export type BisCompanyLiquidation = {
    source: (number | null),
    version: number,
    registrationDate: string,
    endDate: (string | null),
    name: string,
    language: (string | null),
    type: string,
}

export type BisCompanyBusinessLine = {
    source : (number | null),
    order :  number,
    version : number,
    registrationDate : string,
    endDate : (string | null),
    name : string,
    language : (string | null),
}

export type BisCompanyLanguage  = {
    source : (number | null),
    version : number,
    registrationDate : string,
    endDate : (string | null),
    name : string,
    language : (string | null),
}

export type BisCompanyRegisteredOffice = {
    source:  (number | null),
    order:  number,
    version:  number,
    registrationDate:  string,
    endDate:  (string | null),
    name:  string,
    language:  (string | null),
}

export type BisCompanyContactDetail = {
    source: (number | null),
    version: number,
    registrationDate: string,
    endDate: (string | null),
    language: (string | null),
    value: string,
    type: string,
}

export type BisCompanyRegisteredEntry = {
    description : string,
    status : number,
    registrationDate : (string),
    endDate : (string | null),
    register : number,
    language : (string | null),
    authority : number,
}

export type BisCompanyBusinessIdChange  = {
    source : (number | null),
    description : string,
    reason : string,
    changeDate : (string | null),
    change : number,
    oldBusinessId : string,
    newBusinessId : string,
    language : (string | null),
}

export type BisCompanyDetails = {
    names :  BisCompanyName,
    auxiliaryNames :  (BisCompanyName | null),
    addresses :  (BisAddress | null),
    companyForms :  (BisCompanyForm | null),
    liquidations :  (BisCompanyLiquidation | null),
    businessLines :  (BisCompanyBusinessLine | null),
    languages :  (BisCompanyLanguage | null),
    registeredOffices :  (BisCompanyRegisteredOffice | null),
    contactDetails :  (BisCompanyContactDetail | null),
    registeredEntries :  (BisCompanyRegisteredEntry | null),
    businessIdChanges :  (BisCompanyBusinessIdChange | null),
    businessId :  string,
    registrationDate :  string,
    companyForm :  (string | null),
    detailsUri :  (string | null),
    name  : string,
}