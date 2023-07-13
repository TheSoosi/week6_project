import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"

const jsonQuery = {
    "query": [
        {
            "code": "Vuosi",
            "selection": {
                "filter": "item",
                "values": [
                    "2000",
                    "2001",
                    "2002",
                    "2003",
                    "2004",
                    "2005",
                    "2006",
                    "2007",
                    "2008",
                    "2009",
                    "2010",
                    "2011",
                    "2012",
                    "2013",
                    "2014",
                    "2015",
                    "2016",
                    "2017",
                    "2018",
                    "2019",
                    "2020",
                    "2021"
                ]
            }
        },
        {
            "code": "Alue",
            "selection": {
                "filter": "item",
                "values": [
                    "SSS"
                ]
            }
        },
        {
            "code": "Tiedot",
            "selection": {
                "filter": "item",
                "values": [
                    "vaesto"
                ]
            }
        }
    ],
    "response": {
        "format": "json-stat2"
    }
}

const getData = async (municipalityCode) => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"

    jsonQuery.query[1].selection.values = [municipalityCode]

    const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "applicatoin/json"},
        body: JSON.stringify(jsonQuery)
    })
    


    if(!res.ok) {
        return;
    }

    const data = await res.json();
    return data;
}

const getMunicipalities = async  () => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"

    const res = await fetch(url, {
        method: "GET",
        headers: {"content-type": "applicatoin/json"},
    })
    
    if(!res.ok) {
        return;
    }

    const municipalityData = await res.json();
    return municipalityData;
}

const buildChart = async (municipality) => {
    const municipalityData = await getMunicipalities()

    const municipalityNames = municipalityData.variables[1].valueTexts
        .map((element) => {
            return element.toLowerCase()
        })

    const index = municipalityNames.indexOf(municipality.trim().toLowerCase())

    if(index < 0) {
        return;
    }

    const municipalityCode = municipalityData.variables[1].values[index]

    const data = await getData(municipalityCode)

    const labels = Object.values(data.dimension.Vuosi.category.label)

    const chartData = {
        labels: labels,
        datasets: [{
            name: "population",
            values: data.value,
        }]
    }

    frappeChart = new Chart("#chart", {
        data: chartData,
        title: "Population by year",
        height: 450,
        type: "line",
        colors: ["#eb5146"],

    })
}

const button = document.getElementById("submit-data");
const input = document.getElementById("input-area");
const estimateButton = document.getElementById("add-data");

button.onclick = () => {
    buildChart(input.value)
} 

estimateButton.onclick = () => {
    if (frappeChart == null) {
        return false;
    }

    const data = frappeChart.realData.datasets[0].values
    let deltaSum = 0;
    for (let i = 1; i < data.length; i++) {
        deltaSum += data[i] - data[i-1];        
    }
    const value = data[data.length - 1] + deltaSum/(data.length - 1)
    frappeChart.addDataPoint("2022", [value])

}

let frappeChart = null;

buildChart(input.value);



