const bunyan = require('bunyan')

exports.loggerInstance = bunyan.createLogger({
    name: 'transaction-notifier',
    serializers: {
        req: require('bunyan-express-serializer'),
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
    },
    level: 'info',
    streams: [
        {
            path: './foo.log'
        },
        {
            stream: process.stdout
        }
    ]


});

exports.logResponse = function (user, body, msg) {
    var log = this.loggerInstance.child({
     
        body: body,
        msg: msg
    }, true)
    log.info(msg)
}