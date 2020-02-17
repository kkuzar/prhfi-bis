# prhfi-bis
a small wrapper of Finnish Patent and Registration Office BIS v1 api  
*original document* for the API => [avoindata.prh.fi](https://avoindata.prh.fi/ytj_en.html)

# Table of Contents
1. [How to Install](#install)
2. [API functions](#api-functions)
3. [Helper Function](#helper-functions)


## install 

install from npm:
```bash
$> npm i profi-bis
``` 

git & build:

```bash
$> git clone https://github.com/kkuzar/prhfi-bis.git
$> cd prhfi-bis 
$> npm run build
```
 
test build:

```bash
$> npm test
``` 
 
## init

construct the new class:
``` javascript
import {BisApi} from 'prhfi-bis'
// or using require

// input options here, if null then use default.
let bisapi = new BisApi()  
```

default options:

``` typescript
const defaultOptions: BisConfig = {
    hostname: "avoindata.prh.fi",
    port: 443,
    path: "/bis/v1",
    method: "GET",
    protocol: "https"
};

// this class can take any config in this format
```

## API Functions

### Full Wrapper for Bis v1 API.

#### fetch by Business Id `getCompanyDetailWithBusinessId(intput: string)`
fetch Company Full Detail with Finnish Business Id

``` typescript
 let bis = new BisApi();
 const res = await bis.getCompanyDetailWithBusinessId("2299022-8");
```

this function will return a detail JSON as BIS website shows.

#### fetch using query param `getCompanyDetailWithQueryParam(inputObj: object)`

```javascript
let bis = new BisApi();
const res = await bis.getCompanyDetailWithQueryParam({
    name: "KES",
    companyRegistrationFrom: "1999-01-01",
});
```
this function will return a detail JSON as BIS website shows.
This if the query is detail enough  this function will return one full detail
other wise it will return a list of potential company, more detail on BIS document in above link.

e.g.

```json
{
  "type": "fi.prh.opendata.bis",
  "version": "1",
  "totalResults": -1,
  "resultsFrom": 0,
  "previousResultsUri": null,
  "nextResultsUri": "http://avoindata.prh.fi/opendata/bis/v1?totalResults=false&maxResults=10&resultsFrom=10&name=KES&companyRegistrationFrom=2014-02-28",
  "exceptionNoticeUri": null,
  "results": [
    {
      "businessId": "3114031-3",
      "name": "Kestimestarit Oy",
      "registrationDate": "2020-01-24",
      "companyForm": "OY",
      "detailsUri": "http://avoindata.prh.fi/opendata/bis/v1/3114031-3"
    },
    {
      "businessId": "3109375-6",
      "name": "Kesar Oy",
      "registrationDate": "2020-01-07",
      "companyForm": "OY",
      "detailsUri": "http://avoindata.prh.fi/opendata/bis/v1/3109375-6"
    },
    ...
  ]
}
```
### Custom JSON return

```typescript
// Custom return body format
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
```

the return value will be `StructedCompanyInfomation` or array of it `StructedCompanyInfomation[]`

#### fetch Company Brief Structed Information with Business ID `getCompanyWithBID(inputObj: object)`

```typescript
 let bis = new BisApi();
 const res = await bis.getCompanyWithBID("2299022-8");
```

#### fetch Company Brief Structed Information with Params `getCompanyWithParam(inputObj: object)`

```typescript
let bis = new subject.BisApi();
const res = await bis.getCompanyWithParam({
    name: "Kesäturva Oy",
    companyRegistrationFrom: "1999-01-01",
});
```

#### example return for Structed Information:

```text
[
  {
    name: 'Suomen Ajoneuvotekniikka Oy',
    businessId: '3099016-4',
    companyForm: 'OY',
    website: '0400643313',
    latestAddr: 'Marjahaankierto 2-4',
    latestPost: 'IISALMI',
    latestCity: null,
    latestBusinessCode: '45112',
    latestBusinessLine: 'Retail sale of cars and light motor vehicles',
    latestAuxiliaryNames: 'Keski-Suomen Rengas'
  },
  {
    name: 'Kestävä Kollektiivi Oy',
    businessId: '3093045-2',
    companyForm: 'OY',
    website: 'www.kestava.net',
    latestAddr: 'Husares 1853, depto 302 1428   CABA ARGENTINA',
    latestPost: null,
    latestCity: null,
    latestBusinessCode: '71121',
    latestBusinessLine: 'Town and city planning',
    latestAuxiliaryNames: ''
  },
  ...
]
```

## Helper Functions

### Assemble a company Request Query With Object that has same key `typeQueryBody(inputObj: object)`

example code snippet
```javascript
 let bis = new BisApi();
 let res = bis.typeQueryBody({
     name: "KES",
     companyRegistrationFrom: "1999-01-01",
     companyForm: "OY"
 });
```

This helper will return a query object type has strutrue as following:

```typescript
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
```

For now it will only validate the ``companyForm`` , ``companyRegistrationFrom``, ``companyRegistrationTo``.