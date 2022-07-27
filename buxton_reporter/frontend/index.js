import {initializeBlock, Input} from '@airtable/blocks/ui';
import React from 'react';
import {Box, Select, Label, Button, useBase, useRecords} from '@airtable/blocks/ui'
import {useState, useEffect} from 'react';
import { format } from "date-fns";

const updateRecords = (data) => {
    let sDate;
    let eDate;
    let retData = []
    for (let i = 0; i < 24; i++){
        retData.push({"answered": 0, "unanswered": 0})
    }
    switch (data["selectedMenuView"]) {

        case "All":
            for (let rec of data["records"]) {
                retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] = retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] + 1
            }
            for (let rec of data["retRecords"]) {
                data["retTable"].updateRecordAsync(rec,retData[rec.getCellValue("Time")])
            }
            break
        case "DOW":
            for (let rec of data["records"]) {
                let d = new Date(rec.getCellValue("Call Time")).getDay()
                if (d === data["selectedDay"]) {
                    retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] = retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] + 1
                }
            }
            for (let rec of data["retRecords"]) {
                data["retTable"].updateRecordAsync(rec,retData[rec.getCellValue("Time")])
            }
            break
        case "Range":
            sDate = new Date(data["startDate"].split("/")[2], data["startDate"].split("/")[1]-1, data["startDate"].split("/")[0], 0,0,0)
            eDate = new Date(data["endDate"].split("/")[2], data["endDate"].split("/")[1]-1, data["endDate"].split("/")[0], 23,59,59)
            for (let rec of data["records"]) {
                let d = new Date(rec.getCellValue("Call Time"))
                if (sDate < d && d < eDate) {
                    retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] = retData[rec.getCellValue("Hour")][rec.getCellValue("Status")] + 1
                }
            }
            for (let rec of data["retRecords"]) {
                data["retTable"].updateRecordAsync(rec,retData[rec.getCellValue("Time")])
            }
            break
    }
}

function BuxtonReporter() {

    const currentDate = new Date()

    const [selectedMenuView, setSelectedMenuView] = useState('All')
    const [selectedDay, setSelectedDay] = useState(0)
    const [startDate, setStartDate] = useState(format(currentDate, "dd/MM/yyyy"))
    const [endDate, setEndDate] = useState(format(currentDate, "dd/MM/yyyy"))

    const base = useBase()
    const table = base.getTableByName("3Cx")
    const view = table.getViewByName("API Data")
    const records = useRecords(view)

    const retTable = base.getTableByName("HourlySplit")
    const retView = retTable.getViewByName("All")
    const retRecords = useRecords(retView)



    const selectMenuOptions = [
        {
            label: "View All Data",
            value: "All"
        },
        {
            label: "View Day Of Week",
            value: "DOW"
        },
        {
            label: "View Date Range",
            value: "Range"
        }
    ]

    const selectDayOptions = [
        {
            label: "Monday",
            value: 1
        },
        {
            label: "Tuesday",
            value: 2
        },
        {
            label: "Wednesday",
            value: 3
        },
        {
            label: "Thursday",
            value: 4
        },
        {
            label: "Friday",
            value: 5
        },
        {
            label: "Saturday",
            value: 6
        },
        {
            label: "Sunday",
            value: 0
        }
    ]

    return (
        <React.Fragment>
            <Box paddingY={3} paddingX={2} display={"flex"} alignItems={"center"} justifyContent={"space-around"} backgroundColor="lightblue">
                <Select width="100vw" value={selectedMenuView} options={selectMenuOptions} onChange={setSelectedMenuView}/>
            </Box>
            {selectedMenuView === "All" && (
                <Box>
                    <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        <Button icon={"check"} onClick={() => updateRecords({"selectedMenuView": selectedMenuView, "records": records, "retTable": retTable, "retRecords": retRecords})}>Confirm</Button>
                    </Box>
                </Box>
            )}
            {selectedMenuView === "DOW" && (
                <Box>
                    <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        <Select width="50vw" value={selectedDay} options={selectDayOptions} onChange={setSelectedDay}/>
                    </Box>
                    <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        <Button icon={"check"} onClick={() => updateRecords({"selectedMenuView": selectedMenuView, "records": records, "selectedDay": selectedDay, "retTable": retTable, "retRecords": retRecords})}>Confirm</Button>
                    </Box>
                </Box>
            )}
            {selectedMenuView === "Range" && (
                <Box>
                    <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        <Label>Start Date (DD/MM/YYYY)</Label>
                        <Input id="endDate" marginY={1} marginX={1} width={"20vw"} onChange={e => setStartDate(e.target.value)} value={startDate}/>
                        <Label>End Date (DD/MM/YYYY)</Label>
                        <Input id="startDate" marginY={1} marginX={1} width={"20vw"} onChange={e => setEndDate(e.target.value)} value={endDate}/>
                    </Box>
                    <Box paddingY={3} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        <Button icon={"check"} onClick={() => updateRecords({"selectedMenuView": selectedMenuView, "records": records, "startDate": startDate, "endDate": endDate, "retTable": retTable, "retRecords": retRecords})}>Confirm</Button>
                    </Box>
                </Box>
            )}
        </React.Fragment>
    )
}

initializeBlock(() => <DatePickerApp />);
