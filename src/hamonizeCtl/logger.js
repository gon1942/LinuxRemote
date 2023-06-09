const winston = require('winston');
require('winston-daily-rotate-file');
require('date-utils');



const logger = winston.createLogger({
    level: 'info', // 최소 레벨
    // 파일저장
    transports: [
        new winston.transports.DailyRotateFile({
            filename : '/var/log/hamonize/hamonize.log', // log 폴더에 system.log 이름으로 저장
            // filename : '/var/log/hamonize/agentjob/agentjob.log', // log 폴더에 system.log 이름으로 저장
            zippedArchive: true, // 압축여부
            maxFiles: '1d',
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        }),
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        })
    ]
});
 


// function isRoot () {
//     return process.getuid() == 0;
// }

// (async () => {
// 	let isRoot = await isRoot();
// 	if (!isRoot) {
// 		// hamonizeFuns.logErrorMsg('', ' 루트 계정으로 𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮  실행해주세요. ex) sudo hamonizeCtl --start')
//         console.log("============2");
// 		process.exit(1)
// 	}else{
//         console.log("============3");
//     }
// })();


module.exports = logger;