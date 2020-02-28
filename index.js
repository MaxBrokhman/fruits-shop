const http = require('http')
const fs = require('fs')
const url = require('url')

const data = fs.readFileSync(`${__dirname}/data.json`, 'utf-8')
const overviewTemp = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8')
const cardTemp = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8')
const productTemp = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')
const parsedData = JSON.parse(data)

const replaceTemplate = (template, product) => {
  const updatedTemp = template
          .replace(/{%PRODUCTNAME%}/g, product.productName)
          .replace(/{%FROM%}/g, product.from)
          .replace(/{%NUTRIENTS%}/g, product.nutrients)
          .replace(/{%QUANTITY%}/g, product.quantity)
          .replace(/{%PRICE%}/g, product.price)
          .replace(/{%DESCRIPTION%}/g, product.description)
          .replace(/{%IMAGE%}/g, product.image)
          .replace(/{%ID%}/g, product.id)
  return product.organic
    ? updatedTemp.replace(/{%NOT_ORGANIC%}/g, '')
    : updatedTemp.replace(/{%NOT_ORGANIC%}/g, 'not-organic')
}

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true)
  switch(pathname){
    case '/':
      const cardsHtml = parsedData.map(item => replaceTemplate(cardTemp, item)).join('')
      const overviewHtml = overviewTemp.replace(/{%PRODUCT_CARDS%}/g, cardsHtml)
      res.writeHead(200, {
        'Content-Type': 'text/html',
      })
      res.end(overviewHtml)
      break
    case '/api':
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.end(data)
      break
    case '/product':
      const product = parsedData.find(product => product.id === Number(query.id))
      if(product){
        const productHtml = replaceTemplate(productTemp, product)
        res.writeHead(200, {
          'Content-Type': 'text/html',
        })
        res.end(productHtml)
        break
      }
    default:
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      res.end('<h1>Page not found</h1>')
  }
})

const port = process.env.PORT || 3000

server.listen(port, '127.0.0.1')
