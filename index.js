const fetch = require("node-fetch");
const {AxieGene} = require("agp-npm/dist/axie-gene");

function constructQuery() {
    let query = "query GetAxieBriefList($criteria: AxieSearchCriteria) { "
    for (let i = 0; i < 30; i++) {
        query += `ax${i}: axies(auctionType: Sale, sort: PriceAsc, criteria: $criteria, from: ${i * 100}, size: 100) `
        query += "{ results { id genes auction { currentPrice } } }\n"
    }
    query += " }"
    return query
}

endpoint = "https://axieinfinity.com/graphql-server-v2/graphql"
breedCount = [0]
parts = ["tail-thorny-caterpillar", "mouth-tiny-turtle", "horn-lagging", "back-snail-shell"]
classes = ["Reptile"]

body = {
    "operationName": "GetAxieBriefList",
    "variables": {"criteria": {"classes": classes, "breedCount": breedCount, "parts": parts}},
    "query": constructQuery()
}

fetch(endpoint, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
    .then(resp =>
        resp.json().then(body => {
            let matchedAxies = [];
            for (let i = 0; i < 30; i++) {
                body.data[`ax${i}`].results.forEach(axie => {
                    try {
                        const genes = new AxieGene(axie.genes)
                        if (genes.horn.d.partId !== genes.horn.r1.partId) return
                        if (genes.mouth.d.partId !== genes.mouth.r1.partId) return
                        if (genes.tail.d.partId !== genes.tail.r1.partId) return
                        if (genes.back.d.partId !== genes.back.r1.partId) return
                        matchedAxies = [...matchedAxies, axie]
                    } catch (error) {
                        console.log("Error parsing", axie.id, error)
                    }
                })
            }
            matchedAxies.forEach(axie => {
                console.log(axie.id, (parseFloat(axie.auction.currentPrice.slice(0, -14)) / 10000).toString())
            })
        })
    )