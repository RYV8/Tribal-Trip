const { ZodError } = require('zod')
const { ApiError } = require('../utils/http')

function formatIssues(issues) {
  return issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'request'
    return `${path}: ${issue.message}`
  })
}

function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      for (const location of ['params', 'query', 'body']) {
        if (!schemas[location]) continue
        req[location] = schemas[location].parse(req[location] || {})
      }
      return next()
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ApiError(400, 'Invalid request payload', formatIssues(err.issues)))
      }
      return next(err)
    }
  }
}

module.exports = { validate }
