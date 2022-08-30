import React from 'react';
import {initializeBlock, Box, Select, Switch, Label, Button, useBase, useRecords} from '@airtable/blocks/ui'
import SummaryCard from "./components/SummaryCard.js";
import {useState, useEffect} from 'react';

function BuxtonReporter() {

    const currentDate = new Date()

    const base = useBase()
    const enquiryTable = base.getTableByName("All Enquiries")
    const lotTable = base.getTableByName("Lot Activity")
    const progTable = base.getTableByName("ProgressTable")
    const histTable = base.getTableByName("LotHistory")
    const enquiryView = enquiryTable.getViewByName("APIView")
    const lotView = lotTable.getViewByName("APIView")
    const progView = progTable.getViewByName("All View")
    const histView = histTable.getViewByName("All View")
    const enquiryRecords = useRecords(enquiryView)
    const lotRecords = useRecords(lotView)
    const progRecords = useRecords(progView)
    const histRecords = useRecords(histView)

    const [selectedMonthView, setSelectedMonthView] = useState(currentDate.getMonth())
    const [selectedYearView, setSelectedYearView] = useState(currentDate.getFullYear())
    const [selectedYearOnlyView, setSelectedYearOnlyView] = useState(false)

    const [contractsIn, setContractsIn] = useState(0)
    const [contractsOut, setContractsOut] = useState(0)
    const [contractsHold, setContractsHold] = useState(0)

    let sleepTime = 1

    const [totalEnquiry, setTotalEnquiry] = useState(0)
    const [totalQualEnquiry, setQualEnquiry] = useState(0)
    const [totalUnqualEnquiry, setUnqualEnquiry] = useState(0)
    const [totalNoqualEnquiry, setNoqualEnquiry] = useState(0)
    const [buyerPurposes, setBuyerPurposes] = useState(lotTable.getFieldByName("Purchase Purpose").options["choices"].reduce((a,v) => ({...a, [v["name"]]: 0}),{}))

    const updateProgressTable = async () => {
        // for (let rec of progRecords) {
        //     console.log("A - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
        //     await new Promise(r => setTimeout(r, sleepTime));
        //     progTable.updateRecordAsync(rec,{"CurrentView": rec.getCellValueAsString("Month-Year") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())})
        // }
        // for (let rec of histRecords) {
        //     console.log("B - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
        //     await new Promise(r => setTimeout(r, sleepTime));
        //     histTable.updateRecordAsync(rec,{"CurrentView": rec.getCellValueAsString("Month-Year") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())})
        // }
        // for (let rec of lotRecords) {
        //     console.log("C - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
        //     await new Promise(r => setTimeout(r, sleepTime));
        //     histTable.updateRecordAsync(rec,{"CurrentView": rec.getCellValueAsString("SignedMonthYear") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())})
        // }
        let recArray = []
        for (let rec of progRecords) {
            console.log("A - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
            await recArray.push({"id": rec.id, "fields": {"CurrentView": rec.getCellValueAsString("Month-Year") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())}})

        }
        for (let i = 0; i < Math.ceil(recArray.length/50.0); i ++)
        {
            await progTable.updateRecordsAsync(recArray.slice(i*50,(i+1)*50))
        }

        recArray = []
        for (let rec of histRecords) {
            console.log("B - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
            await recArray.push({"id": rec.id, "fields": {"CurrentView": rec.getCellValueAsString("Month-Year") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())}})

        }
        for (let i = 0; i < Math.ceil(recArray.length/50.0); i ++)
        {
            await histTable.updateRecordsAsync(recArray.slice(i*50,(i+1)*50))
        }

        recArray = []
        for (let rec of lotRecords) {
            console.log("C - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
            await recArray.push({"id": rec.id, "fields": {"CurrentView": rec.getCellValueAsString("SignedMonthYear") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())}})

        }
        for (let i = 0; i < Math.ceil(recArray.length/50.0); i ++)
        {
            await lotTable.updateRecordsAsync(recArray.slice(i*50,(i+1)*50))
        }

        recArray = []
        for (let rec of enquiryRecords) {
            console.log("D - " + selectedMonthView.toString() + "-" + selectedYearView.toString())
            await recArray.push({"id": rec.id, "fields": {"CurrentView": rec.getCellValueAsString("Month-Year") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString())}})

        }
        for (let i = 0; i < Math.ceil(recArray.length/50.0); i ++)
        {
            await enquiryTable.updateRecordsAsync(recArray.slice(i*50,(i+1)*50))
        }


        recArray = []
        for (let rec of lotRecords) {
            console.log(selectedMonthView.toString() + "-" + selectedYearView.toString())
            let arr = []
            rec.getCellValueAsString("HoldMonthYear") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString()) ? arr.push({"name":"Hold"}) : null
            rec.getCellValueAsString("OutMonthYear") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString()) ? arr.push({"name":"Contracts Out"}) : null
            rec.getCellValueAsString("SignedMonthYear") === ((selectedMonthView+1).toString() + "-" + selectedYearView.toString()) ? arr.push({"name":"Sold – Fully Signed"}) : null
            console.log(arr)
            await recArray.push({"id": rec.id, "fields": {"APIGraphHelper": arr}})

        }
        for (let i = 0; i < Math.ceil(recArray.length/50.0); i ++)
        {
            await new Promise(r => setTimeout(r, sleepTime));
            await lotTable.updateRecordsAsync(recArray.slice(i*50,(i+1)*50))
        }

    }

    const parseEnquiryRecords = () => {
        updateProgressTable()
        let data = {
            "contractsIn": 0,
            "contractsOut": 0,
            "contractsHold": 0,
            "totalEnquiry": 0,
            "qualEnquiry": 0,
            "unqualEnquiry": 0,
            "noqualEnquiry": 0,
            "buyerPurposes": lotTable.getFieldByName("Purchase Purpose").options["choices"].reduce((a,v) => ({...a, [v["name"]]: 0}),{})
        }


        for (let rec of lotRecords){

            let dte = new Date(rec.getCellValue("Contracts Fully Signed"))
            let status = rec.getCellValueAsString("Status")
            if (dte.getFullYear() === selectedYearView && (dte.getMonth() === selectedMonthView || selectedYearOnlyView)){
                console.log(data["buyerPurposes"])
                data["buyerPurposes"][rec.getCellValueAsString("Purchase Purpose")] = data["buyerPurposes"][rec.getCellValueAsString("Purchase Purpose")] + 1

                data["contractsIn"] = status === "Sold - Fully Signed" ? data["contractsIn"] + 1 : data["contractsIn"]
                data["contractsIn"] = status === "Sold - Purchaser Signed" ? data["contractsIn"] + 1 : data["contractsIn"]
                data["contractsIn"] = status === "Settled" ? data["contractsIn"] + 1 : data["contractsIn"]
            }
            data["contractsOut"] = status === "Contracts Out" ? data["contractsOut"] + 1 : data["contractsOut"]
            data["contractsHold"] = status === "Hold" ? data[contractsHold] + 1 : data["contractsHold"]


        }

        for (let rec of enquiryRecords){
            let dte = new Date(rec.getCellValue("Date of Enquiry"))
            if (dte.getFullYear() === selectedYearView && (dte.getMonth() === selectedMonthView || selectedYearOnlyView)){
                data["totalEnquiry"] = data["totalEnquiry"] + 1
                let enqStatus = rec.getCellValueAsString("Enquiry Qualified?")
                data["qualEnquiry"] = enqStatus === "Qualified" ? data["qualEnquiry"] + 1 : data["qualEnquiry"]
                data["unqualEnquiry"] = enqStatus === "Unqualified" ? data["unqualEnquiry"] + 1 : data["unqualEnquiry"]
                data["noqualEnquiry"] = (enqStatus === "Qualified" && enqStatus === "Unqualified") ? data["noqualEnquiry"] + 1 : data["noqualEnquiry"]
            }
        }
        setContractsIn(data["contractsIn"])
        setContractsOut(data["contractsOut"])
        setContractsHold(data["contractsHold"])

        setTotalEnquiry(data["totalEnquiry"])
        setQualEnquiry(data["qualEnquiry"])
        setUnqualEnquiry(data["unqualEnquiry"])
        setNoqualEnquiry(data["noqualEnquiry"])

        setBuyerPurposes(data["buyerPurposes"])


    }

    const monthOptions = [
        {   label: "January",
            value: 0 },
        {   label: "February",
            value: 1 },
        {   label: "March",
            value: 2 },
        {   label: "April",
            value: 3 },
        {   label: "May",
            value: 4 },
        {   label: "June",
            value: 5 },
        {   label: "July",
            value: 6 },
        {   label: "August",
            value: 7 },
        {   label: "September",
            value: 8 },
        {   label: "October",
            value: 9 },
        {   label: "November",
            value: 10 },
        {   label: "December",
            value: 11 },
    ]
    const yearOptions = [
        {   label: "2020",
            value: 2020 },
        {   label: "2021",
            value: 2021 },
        {   label: "2022",
            value: 2022 },
        {   label: "2023",
            value: 2023 },
        {   label: "2024",
            value: 2024 },
        {   label: "2025",
            value: 2025 },
    ]


    return (
        <React.Fragment>
            <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"space-around"} backgroundColor="lightblue">
                <Select width="25vw" disabled={selectedYearOnlyView} value={selectedMonthView} options={monthOptions} onChange={setSelectedMonthView}/>
                <Select width="25vw" value={selectedYearView} options={yearOptions} onChange={setSelectedYearView}/>
                <Switch value={selectedYearOnlyView} onChange={newValue => setSelectedYearOnlyView(newValue)} label="Full Year" width="320px" />
                <Button marginLeft={3} icon={"bolt"} onClick={() => parseEnquiryRecords()}>Update Data</Button>
            </Box>
            <Box>
                {/*<Box display={"flex"} flexWrap={"nowrap"} justifyContent={"space-between"}>*/}
                {/*    <SummaryCard countColour="green" recordCount={contractsIn} recordTitle={"Contracts Signed"} />*/}
                {/*    <SummaryCard countColour="red" recordCount={contractsOut} recordTitle={"Contracts Out (Current)"} />*/}
                {/*    <SummaryCard countColour="orange" recordCount={contractsHold} recordTitle={"Hold (Current)"} />*/}
                {/*</Box>*/}
                {/*<Box display={"flex"} flexWrap={"nowrap"} justifyContent={"space-between"}>*/}
                {/*    <SummaryCard countColour="blue" recordCount={totalEnquiry} recordTitle={"Total Enquiries"} />*/}
                {/*    <SummaryCard countColour="green" recordCount={totalQualEnquiry} recordTitle={"Qualified Enquiry"} />*/}
                {/*    <SummaryCard countColour="orange" recordCount={totalUnqualEnquiry} recordTitle={"Unqualified Enquiry"} />*/}
                {/*    <SummaryCard countColour="red" recordCount={totalNoqualEnquiry} recordTitle={"Unknown Qualification"} />*/}
                {/*</Box>*/}
                {/*<Box display={"flex"} flexWrap={"nowrap"} justifyContent={"space-between"}>*/}
                {/*    {Object.keys(buyerPurposes).map((keyName, i) => (*/}
                {/*        <SummaryCard key={i} countColour="Blue" recordCount={buyerPurposes[keyName]} recordTitle={keyName} />*/}
                {/*        ))}*/}
                {/*</Box>*/}

            </Box>

        </React.Fragment>
    )
}

initializeBlock(() => <BuxtonReporter />);
