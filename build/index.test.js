const subject = require("./index.js");

test("Query Company By Business Id (Correct Input)", async() => {
    let bis = new subject.BisApi();
    const res = await bis.checkCompanyWithBusinessId("2299022-8");
    expect(res.results[0].name).toBe("LeadDesk Oyj");
});

test("Query Company By Business Id (Wrong Input)", async () => {
    async function innertest () {
        let bis = new subject.BisApi();
        await bis.checkCompanyWithBusinessId("ASDFXC-8");
    }
    await expect(innertest())
        .rejects.toThrow(new Error("business Id is not Valid"));
});

test("Company Query init function test (Correct Input)", () => {
    let bis = new subject.BisApi();
    let res = bis.typeQueryBody({
        name: "KES",
        companyRegistrationFrom: "1999-01-01",
        companyForm: "OY"
    });

    expect(res.name).toBe("KES");

    let res_ = bis.typeQueryBody({
        name: "VR",
        companyForm: "oy"
    });
    expect(res_.name).toBe("VR");
});

test("Company Query init function test (invalid companyForm)", () => {
    expect(() => {
        let bis = new subject.BisApi();
        let res = bis.typeQueryBody({
            name: "VR",
            companyForm: "AAA"
        });
    }).toThrow(new Error( "companyForm is not in Valid form"));
});

test("Company Query init function test (invalid date)", () => {
    expect(() => {
        let bis = new subject.BisApi();
        let res = bis.typeQueryBody({
            name: "VR",
            companyRegistrationFrom: "10000-01-01",
        });
    }).toThrow(new Error( "companyRegistrationFrom the Date is not in Valid form"));
    expect(() => {
        let bis = new subject.BisApi();
        let res = bis.typeQueryBody({
            name: "VR",
            companyRegistrationFrom: "1999-01-99",
        });
    }).toThrow(new Error( "companyRegistrationFrom the Date is not in Valid form"));
    expect(() => {
        let bis = new subject.BisApi();
        let res = bis.typeQueryBody({
            name: "VR",
            companyRegistrationFrom: "1999-01-01",
            companyRegistrationTo: "1000-1-1"
        });
    }).toThrow(new Error( "companyRegistrationTo the Date is not in Valid form"));
});

test("Query Company By Params (Correct Input)", async() => {
    let bis = new subject.BisApi();
    const res = await bis.checkCompanyWithQueryObject({
        name: "KES",
        companyRegistrationFrom: "1999-01-01",
    });
    expect(res.results.length).toBe(10);
});


