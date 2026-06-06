const app = require('./app')
const env = require('./config/env')

app.listen(env.port, () => {
  console.log(`Tribe Trip API listening on http://localhost:${env.port}`)
  console.log(`Health check: http://localhost:${env.port}/api/health`)
})
