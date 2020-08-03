import axios from 'axios'
import jsdom from 'jsdom'
import _ from 'lodash'

const { JSDOM } = jsdom

class ScreenerOptions {
    pagingIndex: number = 0
    tradesShareMax: number = 100
}

const marketWatch = (
    options: ScreenerOptions = new ScreenerOptions()
) => (
        'https://www.marketwatch.com/tools/stockresearch/screener/results.asp?' +
        'TradesShareEnable=True&' +
        `TradesShareMax=${options.tradesShareMax}&` +
        'PriceDirEnable=True&' +
        'PriceDir=Up&' +
        'LastYearEnable=False&' +
        'TradeVolEnable=False&' +
        'BlockEnable=False&' +
        'PERatioEnable=False&' +
        'MktCapEnable=False&' +
        'MovAvgEnable=False&' +
        'MovAvgType=Outperform&' +
        'MovAvgTime=FiftyDay&' +
        'MktIdxEnable=False&' +
        'MktIdxType=Outperform&' +
        'Exchange=All&' +
        'IndustryEnable=False&' +
        'Industry=Accounting&' +
        'Symbol=True&' +
        'CompanyName=True&' +
        'Price=True&' +
        'Change=True&' +
        'ChangePct=True&' +
        'Volume=True&' +
        'LastTradeTime=True&' +
        'FiftyTwoWeekHigh=False&' +
        'FiftyTwoWeekLow=False&' +
        'PERatio=False&' +
        'MarketCap=True&' +
        'MoreInfo=False&' +
        'SortyBy=Volume&' +
        'SortDirection=Descending&' +
        'ResultsPerPage=OneHundred&' +
        `PagingIndex=${options.pagingIndex}`
    )

const unitHelper = (number: number, unit: string) => {
    switch (unit) {
        case 'M':
            return number * 1000000
        case 'B':
            return number * 1000000000
        default:
            return number
    }
}

export default async (req, res) => {
    const result = await axios.get(marketWatch(0))

    const { document } = (new JSDOM(result.data)).window

    const stocks = document.getElementsByClassName('results')[1].getElementsByTagName('tbody')[0].children

    const columns = document.getElementsByClassName('results')[1].getElementsByTagName('thead')[0].children[0].children

    const header = []
    const rows = []

    _.each(columns, (column) => {
        if (column.children[0]) {
            header.push(column.children[0].innerHTML)
        } else {
            header.push(column.innerHTML)
        }
    })

    _.each(stocks, (stock) => {
        const row = []
        _.each(stock.children, (td) => {
            if (td.children[0]) {
                row.push(td.children[0].innerHTML)
            } else {
                row.push(td.innerHTML)
            }
        })
        rows.push(row)
    })

    res.json(
        rows.map((row) => {
            const tmp = {}

            _.each(header, (label: string, index: number) => {
                const rowString = row[index]
                const regexpGroups = (/(?<prepend>[-+$])?(?<number>[0-9,.]*)(?<unit>.*)/).exec(rowString).groups

                // console.log(regexpGroups.prepend)
                // console.log(regexpGroups.number)
                // console.log(regexpGroups.unit)

                const rowNumber = unitHelper(
                    Number(
                        regexpGroups.prepend ?
                            `${regexpGroups.prepend}${regexpGroups.number}` :
                            regexpGroups.number
                    ),
                    regexpGroups.unit,
                )

                tmp[label] = {
                    number: rowNumber,
                    string: rowString,
                    regexpGroups,
                }
            })

            return tmp
        })
    )
}
