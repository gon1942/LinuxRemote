#!/usr/bin/env node

const si = require('systeminformation');
const helpFormatter = require('./lib/help-formatter.js');
const chalk = require('chalk');
const unirest = require('unirest');
const path = require('path');
const fs = require('fs');
const os = require("os");
const { resolve } = require('path');
// clean : require('./lib/clean.js') 

const log = console.log;
var restApiUrl = new Map();
restApiUrl.set('authchk', '/hmsvc/getOrgAuth');
restApiUrl.set('orgdata', '/hmsvc/getOrgData');
restApiUrl.set('vpnused', '/hmsvc/isVpnUsed');
restApiUrl.set('setPcInfo', '/hmsvc/setPcInfo');
restApiUrl.set('setVpnUpdate', '/hmsvc/setVpnUpdate');
restApiUrl.set('eqhw', '/hmsvc/eqhw');
restApiUrl.set('unauth', '/hmsvc/unauth');

// Call Linux Cmd  -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------------- 
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
const execShellCommand = function (cmd) {
    return new Promise((resolve, reject) => {
        const { exec } = require('child_process')
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                log(`command Run Error :: ${error.message}`);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}


function run_shell_command(command, cb) {
    const { exec } = require('child_process')
    exec(command, function (err, stdout, stderr) {
        if (err) {
            cb(stderr);
        } else {
            cb(stdout ? stdout : stderr);
        }
    });
}

async function run(cmd) {
    const child_process = require("child_process");
    var out = "";
    try {
        out = child_process.execSync(cmd);
    } catch (err) {
        out = err.stdout;
    }
    return out.toString();
}

//  os User Root Check 
exports.isCurrentUserRoot = async function () {
    return process.getuid() == 0;
}

// OS Display Check   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// 
let isOsDisplayYn = "";
async function getOsRunlevel() {
    // let  chkDisplay = await run( "ps -A | egrep -i 'xorg|wayland' | awk '{print $NF}'" );
    // log("chkDisplay==="+chkDisplay);
    if (await run("ps -A | egrep -i 'xorg|wayland' | awk '{print $NF}'") == null) {
        isOsDisplayYn = "N";        // server
    } else {
        isOsDisplayYn = "Y";        //  desktop
    }

    log(`isOsDisplay==${isOsDisplayYn}`)
    return isOsDisplayYn;
} // ======================================================================================================//

//get os platform   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// 
var package_manager = null;
exports.getOsPlatform = async function () {
    switch (os.platform()) {
        case "linux":
            switch (null) {
                case run("/usr/bin/which apt") != "": package_manager = "apt install"; break;
                case run("/usr/bin/which pacman") !== "": package_manager = "pacman -S"; break;
                case run("/usr/bin/which emerge") !== "": package_manager = "emerge"; break;
                case run("/usr/bin/which yum") !== "": package_manager = "yum install"; break;
                case run("/usr/bin/which apk") !== "": package_manager = "apk add"; break;
            }
            break;
        case "win32": break;
    }

    if (await run('/usr/bin/which apt') !== "") {
        package_manager = "apt";
        // } else if (await run('/usr/bin/which pacman') !== "") {
        //     package_manager = "pacman -S";
        // } else if (await run('/usr/bin/which emerge') !== "") {
        //     package_manager = "emerge";
    } else if (await run('/usr/bin/which yum') !== "") {
        package_manager = "yum";
        // } else if (await run('/usr/bin/which apk') !== "") {
        //     package_manager = "apk add";
    }

    return package_manager;
} // ======================================================================================================//


// Rest Api Url Settings   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ----------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------------------------------
let baseurl = "";
exports.setbaseurl = function (val) {
    baseurl = val;
};



// Hamonize Install Title   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.installTitle = function () {
    const figlet = require('figlet')
    const gradient = require('gradient-string')
    const msg = `- Hamonize - Install`
    figlet(msg, (err, data) => {
        console.log(gradient.pastel.multiline(data));
        log(data)
    })
}

// Rest Api Call   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ----------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.apiRequest = function (jsonData, resUrl, method) {
    const authChk = async () => {
        let respo;
        if (method == 'get') {
            respo = await unirest.get(baseurl + restApiUrl.get(resUrl)).header('content-type', 'application/json').send({ events: jsonData })
        } else if (method == 'unauth') {
            const request = require('request');
            respo = request.post(baseurl + '/hmsvc/unauth', {
                json: jsonData
            }, (error, res, body) => {
                if (error) {
                    console.error(error);
                    //return
                }
                // console.log(`statusCode: ${res.statusCode}`);
                // console.log(body);
            })
        } else {
            respo = await unirest.post(baseurl + restApiUrl.get(resUrl)).header('content-type', 'application/json').send({ events: jsonData })
        }

        return respo.body
    }
    return authChk();
}


// Error Msg Print    -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ----------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.logErrorMsg = function (code, msg) {
    if (code == '') {
        log(chalk.green('Hamonize Install Error : ') + chalk.blue.bgRed.bold(msg));
    } else {
        log(chalk.green('Hamonize Install Error : ') + chalk.blue.bgRed.bold(msg) + ' Error Code["' + code + '"]');
    }

}


// Loading Command    -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.loading_start = function () {
    const loading = require('loading-cli');
    const load = loading("loading text!!").start()

    setTimeout(function () {
        load.color = 'yellow';
        load.text = ' Loading rainbows';
    }, 2000)
}
exports.loading_stop = function () {
    // stop
    setTimeout(function () {
        load.stop()
    }, 3000)
}

// Cmd Print Help  -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.printHelp = function (name, version) {
    const filepath = path.resolve(__dirname, 'docs', name + '.txt')
    const usage = helpFormatter(fs.readFileSync(filepath), version)
    log(usage)
}


// Tail     -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
const tailLogFIle = function (filenm) {
    const Tail = require('tail').Tail;
    const tail = new Tail(filenm);

    tail.on("line", function (data) {
        log(data);
    });

    tail.on("error", function (error) {
        log('ERROR: ', error);
    });

}

//  Command Install Msg     -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ---------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.hamonize_CmdList = {
    getAuth: (_msg) => {
        return [
            { type: 'input', name: 'inputAuth', message: chalk.blue(_msg), default: 'Hamonize AuthKey.' }
            // { type: 'reinput', name: 'inputAuth', message: '잘못된  인증번호입니다. 다시  입력해주세요.:', default: 'Hamonize AuthKey.' }
        ];
    }
    , getOrgInfo: (_data) => {
        return [
            { type: 'list', name: 'listExample', message: chalk.blue('컴퓨터를 등록할 조직을 선택해주세요'), default: 'Choice List ', choices: _data },
        ];
    }

    // , authAnswers: (answers) => {
    //     console.log("1===", answers.inputAuth)
    //     // console.log(`How tedious was all this? You said ${answers.inputAuth}`.blue);
    // }
};

// #### Add Pc Info -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.addPcInfo = async function (groupname, sabun, username, domain) {

    const pcHostname = await execShellCommand('hostname');
    // let pcHostNameVal = pcHostname;
    const cpu = await si.cpu(); // CPU Info
    let cpuinfo = ` ${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz`;
    cpuinfo += ` ${cpu.cores} (${cpu.physicalCores} Physical)`;

    let cpuinfoMd5 = ` ${cpu.manufacturer} ${cpu.brand}`;
    cpuinfoMd5 += ` ${cpu.cores} (${cpu.physicalCores} Physical)`;

    const disk = (await si.diskLayout())[0]; // Disk Info
    const size = Math.round(disk.size / 1024 / 1024 / 1024);
    let diskInfo = ` ${disk.vendor} ${disk.name} ${size}GB ${disk.type} (${disk.interfaceType})`;
    let diskSerialNum = disk.serialNum;

    const os = await si.osInfo(); //OS Info
    let osinfo = ` ${os.distro} ${os.release} ${os.codename} (${os.platform})`;

    let osinfoKernel = ` ${os.kernel} ${os.arch}`;

    const ram = await si.mem(); // RAM Info
    const totalRam = Math.round(ram.total / 1024 / 1024 / 1024);
    let raminfo = ` ${totalRam}GB`;

    const ipinfo = require("ip"); //	get os ip address
    const pcuuid = (await si.uuid()); //	 get os mac address 

    const macs = pcuuid.macs;


    const machineIdSync = require('node-machine-id').machineIdSync;
    let machindid = machineIdSync({
        original: true
    });

    const {
        networkInterfaces
    } = require('os');

    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (!net.internal) {
                // if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }

        }
    }

    let vpnipaddr = '';
    if (typeof results['tun0'] != 'undefined') {
        // console.log(results['tun0']); // result ::: [ '10.8.0.2', 'fe80::87f5:686f:a23:1002' ]
        vpnipaddr = results['tun0'][0];
    }
    // console.log("=============vpnipaddr================" + vpnipaddr);
    var md5 = require('md5');
    let hwinfoMD5 = pcHostname + ipinfo.address() + cpuinfoMd5 + diskInfo + diskSerialNum + osinfoKernel + raminfo + machindid;
    let hwData = md5(hwinfoMD5);

    let fileDir = "/etc/hamonize/hwinfo/hwinfo.hm";
    fs.writeFile(fileDir, hwData, (err) => {
        if (err) {
            // log("//== sysInfo hw check create file error  "+ err.message)
        }
    });

    var vpnip = await vpnCreateTest();
    log("#######vpnip===", vpnip);

    var JsonData = new Object();
    var arrJsonData = new Array();
    JsonData.uuid = machindid;
    JsonData.cpuid = cpuinfo.trim();
    JsonData.hddid = diskSerialNum.trim();
    JsonData.hddinfo = diskInfo.trim();
    JsonData.macaddr = macs[0];
    JsonData.ipaddr = ipinfo.address().trim();
    JsonData.vpnipaddr = vpnipaddr.trim();
    JsonData.hostname = pcHostname.trim();
    JsonData.pcos = osinfo.trim();
    JsonData.memory = raminfo.trim();
    JsonData.deptname = groupname.trim();
    JsonData.sabun = sabun.trim();
    JsonData.username = username.trim();
    JsonData.domain = domain.trim();

    arrJsonData.push(JsonData);
    return arrJsonData;

}

// Vpn Connection -----------------------------------------------------------------------------------------------------------------------------------------------------------------// --------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
function vpnCreateTest () {
    return new Promise(function (resolve, reject) {

        tailLogFIle("/var/log/hamonize/vpnlog/vpnlog.hm");

        const { exec } = require('child_process')
        exec("/bin/bash /tmp/hamonize/vpnInstall.sh", (err, output) => {
            if (err) {
                return resolve("N");
            }
            if (output.trim() == 'N') {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })
    });
}


exports.vpnCreate = function (winFolderDir) {
    return new Promise(function (resolve, reject) {

        tailLogFIle("/var/log/hamonize/vpnlog/vpnlog.hm");

        const { exec } = require('child_process')
        exec("/bin/bash /tmp/hamonize/vpnInstall.sh", (err, output) => {
            if (err) {
                return resolve("N");
            }
            if (output.trim() == 'N') {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })
    });
}


// Vpn Connection Check -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.vpnCreateChk = async function (winFolderDir) {
    return new Promise(function (resolve, reject) {
        // let chkVpnConnection = run_shell_command("ifconfig | awk '/inet .*destination/' | awk '{print $2}' | grep 20 | wc -l");
        // let chkVpnConnection = run("ifconfig | awk '/inet .*destination/' | awk '{print $2}' | grep 20 | wc -l");
        // log(`vpnCreateChk chkVpnConnection : ${chkVpnConnection}`);

        // if (chkVpnConnection == 0) {
        //     return resolve('N');
        // } else {
        //     return resolve('Y');
        // }
        const { exec } = require('child_process')
        exec("ifconfig | awk '/inet .*destination/' | awk '{print $2}' | grep 20 ", (err, output) => {
            if (err) {
                return resolve("N");
            }
            log(`vpnCreateChk output : ${output}`)
            if (output.trim() == '0') {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })

    });
}

// Get Os User Id  -----------------------------------------------------------------------------------------------------------------------------------------------------------------// ---------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.getOsAccountId = async function () {
    let userId = await execShellCommand("cat /etc/passwd | grep 1000 | awk -F':' '{print $1}' ");
    // let userId = await execShellCommand("who | awk '{print $1}' ");
    return userId;
}

// Install  Hamonize   -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------

exports.hamonizeProgramInstallProc = async function (domain, userId, osPlaform) {
    return new Promise(function (resolve, reject) {


        //  os platform & display Mode Check 
        const { exec } = require('child_process')
        tailLogFIle("/var/log/hamonize/propertiesJob/propertiesJob.log")

        // const displayMode = getOsRunlevel();
        let cmd = '';
        if (osPlaform == 'apt') {
            cmd = "/bin/bash /tmp/hamonize/hamonizeProgramInstall.sh " + domain + " " + userId;
        } else {
            cmd = "/bin/bash /tmp/hamonize/hamonizeProgramInstall_Rpm.sh"
        }
        // log(`---------------------------------> cmd: ${cmd}, ${osPlaform}`)

        exec(cmd, (err, output) => {
            if (err) {
                log(`err: ${err}`)
                return resolve("N");
            }
            log(`output: ${output}`)

            let tmpReturn = output.replace(/(\s*)/g, "");
            if (tmpReturn.search('1942-LDAP') > -1) {
                return resolve('LDAP');
            } else if (tmpReturn.search('1942USB') > -1) {
                return resolve('USB');
            } else if (tmpReturn.search('1942-AGENT') > -1) {
                return resolve('AGENT');
            } else if (tmpReturn.search('1942-OSLOGINOUT') > -1) {
                return resolve('OS-LOGINOUT');
            } else if (tmpReturn.search('1942-TIMESHIFT') > -1) {
                return resolve('OS-TIMESHIFT');
            } else if (tmpReturn.search('1942-HAMONIZE_ADMIN-TOOL') > -1) {
                return resolve('HAMONIZE_ADMIN');
            } else if (tmpReturn.search('1942-HAMONIZE_ADMIN-KEYS') > -1) {
                return resolve('HAMONIZE_ADMIN');
            } else if (tmpReturn.search('1942-HAMONIZE_ADMIN-ETC') > -1) {
                return resolve('HAMONIZE_ADMIN');
            } else if (tmpReturn.search('1942-HAMONIZE_HELP') > -1) {
                return resolve('HAMONIZE_HELP');
            } else if (tmpReturn.search('1942-TELEGRAF') > -1) {
                return resolve('TELEGRAF');
            } else if (output.trim() == 'N') {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })

    });
}

// uninstall async return promise  Hamonize Program -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------
exports.hamonizeProgramUninstallProc = async function (domain, userId) {
    return new Promise(function (resolve, reject) {
    })
}




// Hamonize & OS Backup -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------
exports.osBackupProc = async function (userId) {
    return new Promise(function (resolve, reject) {

        // return resolve("Y");
        log("userId=====================> " + userId)

        // var backupCmd = "/bin/bash " + __dirname + "/shell/hamonizeBackup.sh " + userId;
        var backupCmd = "/bin/bash  /tmp/hamonize/hamonizeBackup.sh " + userId;
        log(backupCmd)
        // sudo.exec(backupCmd, options,
        //     function (error, stdout, stderr) {
        //         if (error) {
        //             console.log("hamonizeSystemBackupProc error is " + error);
        //             return resolve("N");
        //         } else {
        //             // console.log('stdout: ' + stdout);
        //             // console.log('stderr: ' + stderr);
        //             resolve("Y");
        //         }
        //     }
        // );

        const { exec } = require('child_process')
        exec(backupCmd, (err, output) => {
            if (err) {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })

        // tailLogFIle("/var/log/hamonize/adcon/backuplog.log");
        tailLogFIle("/tmp/backup.log");
    })
}




exports.setServerInfoConfigProc = async function () {
    return new Promise(function (resolve, reject) {
        const { exec } = require('child_process')
        exec("/bin/bash /tmp/hamonize/setServerInfo.sh " + baseurl, (err, output) => {
            if (err) {
                return resolve("N");
            } else {
                return resolve("Y");
            }
        })

    });
}




//   | Hamonize Agent |  -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------


// 테넌트 고유값
function getTenant() {
    var text = fs.readFileSync('/etc/hamonize/hamonize_tanent', 'utf8');
    return text;
}
// hw 변경로그 체크 파일
function getHwpInfo(filename) {
    var text = fs.readFileSync('/etc/hamonize/hwinfo/' + filename, 'utf8');
    return text;
}

// 컴퓨터 UUID
function getUUID() {
    var text = fs.readFileSync('/etc/hamonize/uuid', 'utf8');
    return text;
}

function fn_setDeviceJsonReturnData(deviceInsData, statusyn) {
    var os = require("os");
    var hostname = os.hostname();
    var arrSetData = new Array();
    var arrDeviceInsData = deviceInsData.split(",");
    for (var a in arrDeviceInsData) {
        if (arrDeviceInsData[a] != '') {
            var product = arrDeviceInsData[a].split(",")[0].split("-")[0];
            var vendorCode = arrDeviceInsData[a].split(",")[0].split("-")[1].split(":")[0];
            var prodcutCode = arrDeviceInsData[a].split(",")[0].split("-")[1].split(":")[1];
            var setData = new Object();

            setData.hostname = hostname;
            setData.uuidVal = getUUID().trim();
            setData.product = product;
            setData.productCode = prodcutCode;
            setData.vendorCode = vendorCode;
            setData.statusyn = statusyn;
            setData.domain = getTenant().trim();
            arrSetData.push(setData);
        }
    }

    return arrSetData;
}

// 비인가 디바이스 정책 배포 결과 전송 
exports.fnDeviceJob_result = async function (deviceData, statusyn) {
    var deviceInsData = "";
    var returnDataIns = "";
    var returnDataDel = "";
    var setDeviceJsonReturnData = "";

    var deviceDataObj = JSON.parse(deviceData);

    for (var a in deviceDataObj) {
        if (typeof deviceDataObj.INS != 'undefined') {
            returnDataIns = fn_setDeviceJsonReturnData(deviceDataObj.INS, 'Y');
        }
        if (typeof deviceDataObj.DEL != 'undefined') {
            returnDataDel = fn_setDeviceJsonReturnData(deviceDataObj.DEL, 'N');
        }
    }
    if (returnDataIns.length == 0 && returnDataDel.length != 0) {
        setDeviceJsonReturnData = returnDataDel;
    } else if (returnDataIns.length != 0 && returnDataDel.length == 0) {
        setDeviceJsonReturnData = returnDataIns;
    } else if (returnDataIns.length != 0 && returnDataDel.length != 0) {
        setDeviceJsonReturnData = returnDataIns.concat(returnDataDel);
    }


    await unirest.post(baseurl + "/act/deviceAct").header('content-type', 'application/json').send({ events: setDeviceJsonReturnData }).end(function (response) {
        if (response.error) {
            // console.log("fnDeviceJob_result error is " + response.error);
        } else {
            // console.log("fnDeviceJob_result success is " + response.body);
        }
    });

}

// H/W 변경 체크 -------------------------------------------------------------------------------------------------------------------------------------------------------------

exports.sysinfoEqchk = async function () {

    const si = require('systeminformation');

    const cpu = await si.cpu(); // CPU Info

    let cpuinfo = ` ${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz`;
    cpuinfo += ` ${cpu.cores} (${cpu.physicalCores} Physical)`;

    let cpuinfoMd5 = ` ${cpu.manufacturer} ${cpu.brand}`;
    cpuinfoMd5 += ` ${cpu.cores} (${cpu.physicalCores} Physical)`;

    const disk = (await si.diskLayout())[0]; // Disk Info
    const size = Math.round(disk.size / 1024 / 1024 / 1024);
    let diskInfo = ` ${disk.vendor} ${disk.name} ${size}GB ${disk.type} (${disk.interfaceType})`;
    let diskSerialNum = disk.serialNum;
    const os = await si.osInfo(); //OS Info
    let osinfo = ` ${os.distro} ${os.release} ${os.codename} (${os.platform})`;
    let osinfoKernel = ` ${os.kernel} ${os.arch}`;
    const ram = await si.mem(); // RAM Info
    const totalRam = Math.round(ram.total / 1024 / 1024 / 1024);
    let raminfo = ` ${totalRam}GB`;
    const ipinfo = require("ip"); //	get os ip address
    const pcuuid = (await si.uuid()); //	 get os mac address 
    const machineIdSync = require('node-machine-id').machineIdSync;
    let machindid = machineIdSync({
        original: true
    });
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (!net.internal) {
                // if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }

        }
    }

    let vpnInfo = '';
    if (typeof results['tun0'] != 'undefined') {
        vpnInfo = results['tun0'][0];
    }

    const pcHostname = await execShellCommand('hostname');
    // const cpuid = await execShellCommand('dmidecode -t 4|grep ID');
    const usernm = await execShellCommand('users');

    let md5 = require('md5');
    let hwinfoMD5 = pcHostname + ipinfo.address() + cpuinfoMd5 + diskInfo + diskSerialNum + osinfoKernel + raminfo + machindid;
    let hwData = md5(hwinfoMD5);


    const base_hwinfo = getHwpInfo("hwinfo.hm");

    log("hwData.trim().... " + hwData.trim());
    log("base_hwinfo.trim().... " + base_hwinfo.trim());
    let isSendYn = false;
    if (hwData.trim() == base_hwinfo.trim()) {
        isSendYn = false;
    } else {
        isSendYn = true;
        let fileDir = "/etc/hamonize/hwinfo/hwinfo.hm";
        fs.writeFile(fileDir, hwData, (err) => {
            if (err) {
                log("//== sysInfo hw check() error  " + err.message)
            }
        });
    }

    if (!isSendYn) {
        var JsonData = new Object();
        var arrJsonData = new Array();

        JsonData.hostname = pcHostname;
        JsonData.memory = raminfo;
        JsonData.cpuid = cpuinfo.trim();
        JsonData.hddinfo = diskInfo;
        JsonData.hddid = diskSerialNum;
        JsonData.ipaddr = ipinfo.address();
        JsonData.uuid = machindid;
        JsonData.user = usernm;
        JsonData.macaddr = pcuuid.macs[0];
        JsonData.cpuinfo = cpuinfo;
        JsonData.vpnip = vpnInfo;
        JsonData.domain = getTenant().trim();

        JsonData.datetime = 'datetime';

        log(JsonData)
        arrJsonData.push(JsonData);
        return arrJsonData;
    } else {
        return isSendYn;
    }

}

exports.updatePcInfo = async function (domain) {
    let vpnipaddr = '';
    let vpnInfoData = '';
    let pcHostname = await execShellCommand('hostname');

    const {
        networkInterfaces
    } = require('os');

    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (!net.internal) {
                // if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }

        }
    }
    log("results['tun0']===========" + JSON.stringify(results));
    if (typeof results['tun0'] != 'undefined') {
        vpnInfoData = results['tun0'][0];
    }

    if (vpnInfoData.length == 0) {
        vpnipaddr = 'no vpn';
    } else {
        vpnipaddr = vpnInfoData.trim();
    }
    const machineIdSync = require('node-machine-id').machineIdSync;
    let machindid = machineIdSync({
        original: true
    });

    const ipinfo = require("ip"); //	get os ip address
    var JsonData = new Object();
    var arrJsonData = new Array();

    JsonData.domain = domain.trim();
    JsonData.uuid = machindid.trim();
    JsonData.vpnipaddr = vpnipaddr;
    JsonData.hostname = pcHostname.trim();
    arrJsonData.push(JsonData);

    return arrJsonData;

}