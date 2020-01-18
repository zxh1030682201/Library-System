/* eslint-disable no-control-regex */
const log4js = require('log4js')
const logConfig = require('../../../config/log.config')

// 加载配置文件
log4js.configure(logConfig)

var errorLogger = log4js.getLogger('error')
var resLogger = log4js.getLogger()

function logResponse (ctx, resTime) {
  if (ctx) {
    resLogger.info(formatRes(ctx, resTime))
  }
}

// 格式化请求日志
function formatReqLog (req, resTime) {
  var logText = ''

  var method = req.method
  // 访问方法
  logText += 'request method: ' + method + '\n'

  // 请求原始地址
  logText += 'request originalUrl:  ' + req.originalUrl + '\n'

  // 客户端ip
  logText += 'request client ip:  ' + req.ip + '\n'
  // 请求参数
  if (method === 'GET') {
    logText += 'request query:  ' + JSON.stringify(req.query) + '\n'
  } else {
    logText += 'request body: ' + '\n' + JSON.stringify(req.body) + '\n'
  }
  // 服务器响应时间
  logText += 'response time: ' + resTime + '\n'

  return logText
}

// 格式化错误日志
function formatError (ctx, err, resTime) {
  var logText = ''

  // 错误信息开始
  logText += '\n' + '*************** error log start ***************' + '\n'

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime)

  // 错误名称
  logText += 'err name: ' + err.name + '\n'
  // 错误信息
  logText += 'err message: ' + err.message + '\n'
  // 错误详情
  logText += 'err stack: ' + err.stack + '\n'

  // 错误信息结束
  logText += '*************** error log end ***************' + '\n'

  return logText
}

// 封装错误日志
function logError (ctx, error, resTime) {
  if (ctx && error) {
    errorLogger.error(formatError(ctx, error, resTime))
  }
}

// 格式化响应日志
function formatRes (ctx, resTime) {
  var logText = ''

  // 响应日志开始
  logText += '\n' + '*************** response log start ***************' + '\n'

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime)

  // 响应状态码
  logText += 'response status: ' + ctx.status + '\n'
  var resData = ctx.body

  // 响应内容
  logText += 'response body: ' + '\n' + JSON.stringify(resData) + '\n'

  // 响应日志结束
  logText += '*************** response log end ***************' + '\n'

  return logText
}

module.exports.getLogger = function (name) {
  return log4js.getLogger(name || 'iobp')
}

const logger = log4js.getLogger('iobp')
module.exports.logger = logger

module.exports.intercept = function () {
  return async function (ctx, next) {
    const start = Date.now()
    try {
      await next()
      const ms = Date.now() - start
      logResponse(ctx, ms)
    } catch (error) {
      console.log(error)
      const ms = Date.now() - start
      logError(ctx, error, ms)
      throw error
    }
  }
}
