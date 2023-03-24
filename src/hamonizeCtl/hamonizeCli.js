//#!/usr/bin/env node
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const path = require('path');
const process = require("process");
const fse = require('fs-extra');

const hamonizeFuns = require('./hamonize_functions');
let depSpin;  // Spinner
const log = console.log;

// Gui -> Config Settings !!
// ##============================================================##// ##============================================================##// ##============================================================##
exports.settings = async function (_var) {
  //  #4. Hamonize Connector Shell FIle Copy -> /tmp/hamonize Folder 
  await copyHamonizeShellFile();
  //  #4. Hamonize Agent Shell FIle Copy -> /etc/hamonize/agentJobs/ Folder 
  await copyHamonizeAgentFile();

  // Hamonize Server Info Config
  await hamonizeFuns.setServerInfoConfigProc();
}


exports.recover = async function () {
  const exec = require('child_process').exec;
  let cmd = '';
  if (process.pkg) {
    cmd = "sudo /bin/bash /etc/hamonize/agentJobs/backupJob_recovery.sh";
  }else{
    cmd = "sudo /bin/bash ./shell/backupJob_recovery.sh";
  }
  exec(cmd, function (err, stdout, stderr) {
    log('recover 정책 ::  stdout: ' + stdout);
    log('recover 정책 :: stderr: ' + stderr);

    if (err !== null) {
      log(' recover 정책 ::  error: ' + err);
    }
  });
}

exports.remove = async function () {
  const exec = require('child_process').exec;
  let cmd = '';
  if (process.pkg) {
    cmd = "sudo /bin/bash /etc/hamonize/agentJobs/remove.sh";
  }else{
    cmd = "sudo /bin/bash ./shell/remove.sh";
  }
  exec(cmd, function (err, stdout, stderr) {
    log('remove 정책 ::  stdout: ' + stdout);
    log('remove 정책 :: stderr: ' + stderr);

    if (err !== null) {
      log(' remove 정책 ::  error: ' + err);
    }
  });
}


// Gui -> programInstall !!
// ##============================================================##// ##============================================================##// ##============================================================##
exports.programInstall = async function () {
  var retTanentNm = fs.readFileSync('/etc/hamonize/hamonize_tanent', 'utf8');
  log("retTanentNm============" + retTanentNm)
  // #. 하모나이즈 vpn Install
  let isVpnUsed = await getVpnUsed(retTanentNm);

  // #. Hamonize Program Install
  let add = await installHamonizeProgram(retTanentNm);
  log("add------------------" + add)

  process.exit(1)
}


exports.back = async function () {
  let osBackupProcResult = await hamonizeSystemBackup();

  // Hamonize Install End
  log(chalk.green('Hamonize 설치가 완료되었습니다. '));
  process.exit(1)
}



exports.hamonize_init = async function (_var) {
  console.log(
    chalk.green(
      figlet.textSync('- Hamonize - Install', {
        horizontalLayout: 'full',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        whitespaceBreak: true,
        // font: 'ANSI Shadow',
        // font: 'Ghost',
        // horizontalLayout: 'default',
        // verticalLayout: 'default',
        // width: 80,
        // whitespaceBreak: true
      }),
    ),
  );


  if (!hamonizeFuns.isCurrentUserRoot()) {
    hamonizeFuns.logErrorMsg('', ' 루트 계정으로 실행해주세요.')
    process.exit(1)
  }


  // #1.  인증번호 체크
  let retTanentNm = await init_authChk()
  // console.log("answers====+" + retTanentNm)



  // #2.  조직정보 목록
  let retOrgInfo = await getOrgDataRequest(retTanentNm); // Return : Select Org Nm
  // // console.log(`choice org info is ${retOrgInfo}`)

  //  #3. 컴퓨터 정보 등록
  //  To-Do 컴퓨터 등록 실패시...초기화 처리
  log("1=====++" + retOrgInfo)
  log("2=====++" + retTanentNm)
  // let isAddPcInfo = await setPcInfo(retOrgInfo, '', '', retTanentNm);

  // return ;

  //  #4. Hamonize Connector Shell FIle Copy -> /tmp/hamonize Folder 
  await copyHamonizeShellFile();
  //  #4. Hamonize Agent Shell FIle Copy -> /etc/hamonize/agentJobs/ Folder 
  await copyHamonizeAgentFile();


  // #5. 하모나이즈 vpn Install
  log("하모나이즈 vpn Install-----------------");
  let isVpnUsed = await getVpnUsed(retTanentNm);

  // #6. Hamonize Program Install
  await installHamonizeProgram(retTanentNm);



  await sleep(5000)
  // await pcInfoUpdate(retTanentNm)
  let isAddPcInfo = await setPcInfo(retOrgInfo, '', '', retTanentNm);

  // // To-Do ::::   Hamonize Program Uninstall
  // // let hamonizeProgramUninstallProcResult = hamonizeProgramUninstallProc();

  // // OS Backup
  let osBackupProcResult = await hamonizeSystemBackup();

  // Hamonize Install End
  log(chalk.green('Hamonize 설치가 완료되었습니다. '));
  process.exit(1)
}


// End !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ##============================================================##// ##============================================================##// ##============================================================##
function JobsMkdir(dirPath) {
  const isExists = fs.existsSync(dirPath);
  if (!isExists) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileSyncWithPermissions(file, fileContents, permissions) {
  fs.writeFileSync(file, fileContents);
  exec(`sudo chmod ${permissions} ${file}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`Stderr: ${stderr}`);
      return;
    }
    console.log(`File permissions set for ${file}`);
  });
}

const filePermissions = 'u+x';


async function copyHamonizeShellFile() {

  try {

    JobsMkdir('/tmp/hamonize/usb-lockdown/');


    // const fileContents = fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/30-usb-lockdown.rules'));
    // writeFileSyncWithPermissions('/tmp/hamonize/usb-lockdown/30-usb-lockdown.rules', fileContents, filePermissions);


    // Usb Control
    fs.writeFileSync('/tmp/hamonize/usb-lockdown/30-usb-lockdown.rules', fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/30-usb-lockdown.rules')));
    fs.writeFileSync('/tmp/hamonize/usb-lockdown/center-lockdown', fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/center-lockdown')));
    fs.writeFileSync('/tmp/hamonize/usb-lockdown/Makefile', fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/Makefile')));
    fs.writeFileSync('/tmp/hamonize/usb-lockdown/usb-lockdown', fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/usb-lockdown')));
    fs.writeFileSync('/tmp/hamonize/usb-lockdown/usb-lockdown-work', fs.readFileSync(path.resolve(__dirname, './shell/usb-lockdown/usb-lockdown-work')));

    // Hamonize Program Install
    fs.writeFileSync('/tmp/hamonize/hamonizeProgramInstall.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeProgramInstall.sh')));
    // fs.writeFileSync('/tmp/hamonize/hamonizeProgramInstall_Rpm.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeProgramInstall_Rpm.sh')));
    //	Hamonize Login & Logout
    fs.writeFileSync('/tmp/hamonize/hamonize-login.service', fs.readFileSync(path.resolve(__dirname, './shell/hamonize-login.service')));
    fs.writeFileSync('/tmp/hamonize/hamonize-logout.service', fs.readFileSync(path.resolve(__dirname, './shell/hamonize-logout.service')));
    fs.writeFileSync('/tmp/hamonize/run-script-on-boot.sh', fs.readFileSync(path.resolve(__dirname, './shell/run-script-on-boot.sh')));
    // Hamonize TimeShift 
    fs.writeFileSync('/tmp/hamonize/hamonizeBackup.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeBackup.sh')));
    // Hamonize Stop & Remove
    fs.writeFileSync('/tmp/hamonize/hamonizeStop.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeStop.sh')));
    // Hamonize Init Job ( create Folder & Log File )
    fs.writeFileSync('/tmp/hamonize/initHamonizeInstall.sh', fs.readFileSync(path.resolve(__dirname, './shell/initHamonizeInstall.sh')));
    // Hamonize Server Info
    fs.writeFileSync('/tmp/hamonize/setServerInfo.sh', fs.readFileSync(path.resolve(__dirname, './shell/setServerInfo.sh')));
    // Hamonize VPN
    fs.writeFileSync('/tmp/hamonize/vpnInstall.sh', fs.readFileSync(path.resolve(__dirname, './shell/vpnInstall.sh')));
    // Hamonize Init Job 
    fs.writeFileSync('/tmp/hamonize/hamonizeInitJob.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeInitJob.sh')));



    // Hamonize Agent Job
    // fs.writeFileSync('/etc/hamonize/hamonizeInitJob.sh', fs.readFileSync(path.resolve(__dirname, './shell/hamonizeInitJob.sh')));


    const { exec } = require('child_process')
    exec("sudo chmod +x /tmp/hamonize/*", (error, stdout, stderr) => {
      if (error) {
        log(`command Run Error :: ${error.message}`);
      }
    });
    exec(" sudo chmod +x /tmp/hamonize/usb-lockdown/*", (error, stdout, stderr) => {
      if (error) {
        log(`command Run Error :: ${error.message}`);
      }
    });

  } catch (err) {
    console.error(err);
  }
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------

// os Backup Function
async function hamonizeSystemBackup() {

  depSpin = new Spinner(' Hamonize Program & OS Backup..... %s');
  depSpin.setSpinnerString(18);
  depSpin.start();

  let accountId = await hamonizeFuns.getOsAccountId();
  log("accountId======>>>>>>>>>>>>>>>>>>>>>>>>>>>------------" + accountId);
  log("Hamonize 프로그램 실치 완료 후 백업 준비중....");
  let osBackupProcResult = await hamonizeFuns.osBackupProc(accountId);
  log("osBackupProcResult======+" + osBackupProcResult);
  // 백업 실패인 경우 .
  if (osBackupProcResult == 'N') {
    hamonizeFuns.logErrorMsg('', 'Hamonize Program & OS Backup Fail')
    hamonizeFuns.printHelp('hamonize_error', '1.0')
    process.exit(1)
  }

  depSpin.stop();
  depSpin.clearLine();

  return osBackupProcResult;

}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------


// hamonize program uninstall Function
// function uninstallHamonizeProgram() {
//   let hamonizeProgramUninstallProcResult = hamonizeFuns.hamonizeProgramUninstallProc();
//   log('hamonizeProgramUninstallProcResult============ ', hamonizeProgramUninstallProcResult)
// }

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------


async function installHamonizeProgram(retTanentNm) {
  let accountId = await hamonizeFuns.getOsAccountId();

  depSpin = new Spinner('Installing Hamonize Program.. %s');
  depSpin.setSpinnerString(18);
  depSpin.start();


  //  Hamonize Server Config
  log('The installation is being configured. please wait for a moment  :)  ')
  let retYn = await hamonizeFuns.setServerInfoConfigProc();

  if (retYn == 'Y') {
    let osPlatForm = await hamonizeFuns.getOsPlatform();
    retYn = await hamonizeFuns.hamonizeProgramInstallProc(retTanentNm.trim(), accountId.trim(), osPlatForm.trim());
    log("retYn================== ", retYn)
  }

  // 프로그램 실패인 경우 .
  if (retYn != 'Y') {
    hamonizeFuns.logErrorMsg('', 'Hamonize Program Install Fail -- ' + retYn.trim())
    hamonizeFuns.printHelp('hamonize_error', '1.0')
    process.exit(0)
  }




  // await sleep(5000)
  // // #. pc info update
  // await pcInfoUpdate(retTanentNm)


  depSpin.stop();
  depSpin.clearLine();


  return retYn;


}
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------



async function init_authChk(_var) {

  var msg = 'Hamonize 인증 번호를 입력해주세요.'
  if (_var == 'N') {
    msg = "인증버호 오류 입니다. 다시 입력해 주세요."
  }

  const questions = hamonizeFuns.hamonize_CmdList.getAuth(msg);
  const answers = await inquirer.prompt(questions);
  let inputAuth = answers.inputAuth
  var JsonData = new Object();
  var arrJsonData = new Array();
  JsonData.authkey = inputAuth;
  arrJsonData.push(JsonData);

  let authChkResult = await hamonizeFuns.apiRequest(arrJsonData, 'authchk', 'get');
  if (authChkResult == 'N') {
    return init_authChk('N')
  } else {
    return authChkResult
  }
}



// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------



// async function setServerInfo() {
//   log("abbbbbbbbbbbbbb");
//   const retYn = await hamonizeFuns.setServerInfoConfigProc();
//   log(`set Server Config Info File RetYn = ${retYn}`);
// }


// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------


async function getOrgDataRequest(tanent) {

  var JsonData = new Object();
  var arrJsonData = new Array();
  JsonData.domain = tanent;
  arrJsonData.push(JsonData);

  let orgdataResult = await hamonizeFuns.apiRequest(arrJsonData, 'orgdata', 'get');

  var aa = [];
  var json_data = {}
  orgdataResult.forEach(function (table) {
    json_data[table.orgnm] = ''
    aa.push(table.orgnm)
  });

  const questions = hamonizeFuns.hamonize_CmdList.getOrgInfo(aa);
  const answers = await inquirer.prompt(questions);

  return answers.listExample
}


// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------



// Steo 3,  is Vpn Used -----------------------------------------------------------#

async function getVpnUsed(tanent) {
  let vpnCreateResult = '';
  var JsonData = new Object();
  var arrJsonData = new Array();
  JsonData.domain = tanent;
  arrJsonData.push(JsonData);


  try {

    depSpin = new Spinner('Installing Hamonize Program.. %s');
    depSpin.setSpinnerString(18);
    depSpin.start();
    // Check Vpn   Used    by tenant 
    let getVpnUsedInfo = await hamonizeFuns.apiRequest(arrJsonData, 'vpnused', 'get');
    log(getVpnUsedInfo[0]["vpn_used"]);

    if (getVpnUsedInfo[0]["vpn_used"] == 'Y') {   // vpn 사용인경우

      // vpn install 
      let vpnConnecitonYn = await hamonizeFuns.vpnCreate();
      log("vpnConnecitonYn===", vpnConnecitonYn)
      if (vpnConnecitonYn.trim() != 'Y') {
        const err = new Error("Hamonize Vpn Install Fail ")
        err.statusCode = 'N002'
        throw err;
      }

      // vpn installed Chk
      // vpnCreateResult = await hamonizeFuns.vpnCreateChk();
      // if (vpnCreateResult != 'Y') {
      //   const err = new Error("Hamonize Vpn Connection Fail ")
      //   err.statusCode = 'N002-1'
      //   throw err;
      // }

      // pcinfo update
      // await sleep(5000)
      // await pcInfoUpdate(tanent)

    } else {  // vpn 미사용인경우
      log("####Do Not Vpn Used####")
    }

  } catch (e) {
    // log(e.name, '---#########################name')
    // log(e.message, '--#########################---msg')
    // log(e.statusCode, '----#########################code')
    depSpin.stop();
    depSpin.clearLine();

    hamonizeFuns.logErrorMsg(e.statusCode, 'Vpn Install Faill')
    process.exit(1)
  }

  return vpnCreateResult
}


// vpn 연결후 pc 정보 업데이트
async function pcInfoUpdate(domain) {
  log(' vpn 연결후 pc 정보 업데이트==============')
  let arrJsonData = await hamonizeFuns.updatePcInfo(domain);
  let authChkResult = await hamonizeFuns.apiRequest(arrJsonData, 'setVpnUpdate', 'post');
}

const sleep = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------


async function setPcInfo(orginfo, sabun, usernm, domain) {
  let arrJsonData = await hamonizeFuns.addPcInfo(orginfo, sabun, usernm, domain);
  log(arrJsonData)
  log("----------------------")
  let authChkResult = await hamonizeFuns.apiRequest(arrJsonData, 'setPcInfo', 'post');
  log(authChkResult)

  if (authChkResult == 'exist') {
    hamonizeFuns.logErrorMsg('N003', '이미 등록된 컴퓨터입니다. 재 설치를 하실경우 관리자에게 문의바랍니다.')
    process.exit(1)
  } else {

    hamonizeFuns.logErrorMsg('N004', '유효하지 않는 정보입니다..\n 지속적으로 문제가 발생할경우 관리자에게 문의바랍니다.')
    process.exit(1)
  }
  if (!authChkResult) {
    /* 
    To-Do
      컴퓨터 등록 실패 
      컴퓨터 등록전 행위 초기화
      vpn 사용을 한경우 vpn 삭제 
    */


  }
  return authChkResult;
}


// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------Agent Job ---------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------// -----------------------------------------------------------------------------------------------------------------------------------------------------------------

exports.hamonizeNeedsDir = async function () {
  var exec = require('child_process').exec;
  const paths = [
    "/etc/hamonize/hwinfo",
    "/etc/hamonize/progrm",
    "/etc/hamonize/siteblock",
    "/etc/hamonize/backup",
    "/etc/hamonize/updt",
    "/etc/hamonize/security",
    "/etc/hamonize/firewall",
    "/etc/hamonize/recovery"
  ];

  for (let path of paths) {
    try {
      // 주어진 경로가 파일인지 디렉토리인지 확인
      const stats = fs.lstatSync(path);
      if (stats.isDirectory()) {
        console.log(`Directory already exists: ${path}`);
      } else if (stats.isFile()) {
        console.log(`File already exists: ${path}`);
      }
    } catch (e) {
      // 파일 또는 디렉토리가 없으면 생성
      if (e.code == 'ENOENT') {
        console.log(`Creating directory: ${path}`);
        exec(`sudo mkdir ${path} && sudo touch ${path}/${path.split('/').pop()}.hm`,
          function (err, stdout, stderr) {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (err !== null) {
              console.log(`mkdir error: ${err}`);
            }
          });
      } else {
        console.log(`Error checking path: ${path}`);
      }
    }
  }

}


// Common] get File Data
function getFileData(_gubun) {
  var output = '';
  var stats = '';
  var filePath = '';

  if (_gubun == 'updt') {
    filePath = "/etc/hamonize/updt/updtInfo.hm";
  } else if (_gubun == 'programblock') {
    filePath = "/etc/hamonize/security/device.hm";
  } else if (_gubun == 'devicepolicy') {
    filePath = "/etc/hamonize/security/device.hm";
  } else if (_gubun == 'progrmblock') {
    filePath = "/etc/hamonize/progrm/progrm.hm";
  } else if (_gubun == 'ufw') {
    filePath = "/etc/hamonize/firewall/firewallInfo.hm";
  }

  stats = fs.statSync(filePath);
  if (stats.isFile()) {
    var text = fs.readFileSync(filePath, 'utf8');
    log("//== file data : " + text);
    output = text;
  }
  return output;
}

function getCenterInfo() {
  var retval = "";
  var array = fs.readFileSync('/etc/hamonize/propertiesJob/propertiesInfo.hm').toString().split("\n");
  for (var i in array) {
    if (array[i].indexOf("CENTERURL") != -1) {
      var centerData = array[i].split("=");
      retval = centerData[1];
    }
  }
  return retval;
}

// Agent]  hw equal check  ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#
exports.sysinfoEqchk = async function () {
  var centerUrl = getCenterInfo();
  let arrJsonData = await hamonizeFuns.sysinfoEqchk();
  if (arrJsonData != true) {
    let authChkResult = await hamonizeFuns.apiRequest(arrJsonData, 'eqhw', 'post');
  }
  return null;
}


// Agent] 비인가 디바이스 ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#



function os_func() {
  this.execCommand = function (cmd) {
    return new Promise((resolve, reject) => {
      var exec = require('child_process').exec;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout)
      });
    })
  }
}
exports.fnDeviceJob = async function () {
  var deviceDataObj = getFileData('devicepolicy');
  var os = new os_func();
  os.execCommand("sudo /usr/local/bin/center-lockdown").then(res => {
    hamonizeFuns.fnDeviceJob_result(deviceDataObj, 'Y');
  }).catch(err => {
    log("//==device 정책 :: centor-lockdown load --- > fail\n");
  })
}


exports.sendToCenter_unauth = async function () {

  const request = require('request');
  // var events_str = fs.readFileSync('/etc/hamonize/usblog/usb-unauth.hm', 'utf8');
  // events_str = events_str.replace(/'/g, '\"');
  // events_str = events_str.replace(/\n/g, ',').slice(0, -1);

  // var data = '{"events": [ ' + events_str + ' ]}';
  // console.log("data==== : " + data);
  // var events = JSON.parse(data);
  // let authChkResult = await hamonizeFuns.apiRequest(events, 'unauth', 'unauth');
  // log(authChkResult);

  if (fs.existsSync('/etc/hamonize/usblog/usb-unauth.hm')) {
    var events_str = fs.readFileSync('/etc/hamonize/usblog/usb-unauth.hm', 'utf8');

    events_str = events_str.replace(/'/g, '\"');
    events_str = events_str.replace(/\n/g, ',').slice(0, -1);

    var data = '{"events": [ ' + events_str + ' ]}';
    console.log("data==== : " + data);
    var events = JSON.parse(data);


    request.post('http://192.168.0.240:8083/hmsvc/unauth', {
      json: events
    }, (error, res, body) => {
      if (error) {
        console.error(error);
        //return
      }
      console.log(`statusCode: ${res.statusCode}`);
      console.log(body);
    })
    fs.unlinkSync('/etc/hamonize/usblog/usb-unauth.hm');
  }

}




//  Agent ] Program Install & Remove  ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#
exports.fnUpdtAgentAction = async function (_dtype) {

  const exec = require('child_process').exec;
  let cmd = ''
  if (_dtype == "apt") {
    cmd = "sudo /bin/bash /etc/hamonize/agentJobs/programInstall";
    // cmd = "sudo sh ./shell/agentJobs/programInstall";
  } else if (_dtype == "yum") {
    cmd = "sudo sh /etc/hamonize/agentJobs/rhel.sh";
  }

  exec(cmd, function (err, stdout, stderr) {
    log('updt 정책 ::  stdout: ' + stdout);
    log('updt 정책 :: stderr: ' + stderr);

    if (err !== null) {
      log(' updt 정책 ::  error: ' + err);
    }
  });

}


//  Agent ] ProgramBlock  ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#
exports.fnProgrmJob = async function (_dtype) {
  var progrmblockDataObj = getFileData('progrmblock');
  log("//==progrm 정책:: progrmblockDataObj Data is : " + progrmblockDataObj)
  // if (progrmblockDataObj != '') {
  //   var progrmDataObj = JSON.parse(progrmblockDataObj);
  //   log("//==progrm 정책:: progrmDataObj Data is : " + JSON.stringify(progrmDataObj));
  //   log("//==progrm 정책:: progrmDataObj.INS Data is : " + JSON.stringify(progrmDataObj.INS));
  //   log("//==progrm 정책:: progrmDataObj.DEL Data is : " + JSON.stringify(progrmDataObj.DEL));
  // }

  var exec = require('child_process').exec;

  // exec("sudo /bin/bash ./shell/agentJobs/progrmBlock", function (err, stdout, stderr) {
  exec("sudo /bin/bash /etc/hamonize/agentJobs/progrmBlock", function (err, stdout, stderr) {
    log('ProgramBlock 정책 ::  stdout: ' + stdout);
    log('ProgramBlock 정책 :: stderr: ' + stderr);

    if (err !== null) {
      log(' ProgramBlock 정책 ::  error: ' + err);
    }
  });

}


//  Agent ] fnFirewallJob  ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#
exports.fnFirewallJob = async function (_dtype) {
  var ufwDataObj = getFileData('ufw');
  var exec = require('child_process').exec;
  // exec("sudo /bin/bash ./shell/agentJobs/ufwjob", function (err, stdout, stderr) {
  exec("sudo /bin/bash /etc/hamonize/agentJobs/ufwjob", function (err, stdout, stderr) {
    log('ProgramBlock 정책 ::  stdout: ' + stdout);
    log('ProgramBlock 정책 :: stderr: ' + stderr);

    if (err !== null) {
      log(' ProgramBlock 정책 ::  error: ' + err);
    }
  });

  // exec('sudo /bin/bash ./shell/agentJobs/ufwjob  ', function (err, stdout, stderr) {
  // exec('sudo sh /etc/hamonize/agentJobs/ufwjob  ', function (err, stdout, stderr) {
  //   if (err !== null) {
  //     log('//== fnFirewallJob error: ' + err);
  //   }
  // });
}



// Agent File Copy ---------------------------------#---------------------------------#---------------------------------#---------------------------------#---------------------------------#
const jobFiles = [
  { name: 'rhel.sh', path: './shell/agentJobs/rhel.sh' },
  { name: 'programInstall', path: './shell/agentJobs/programInstall' },
  { name: 'progrmBlock', path: './shell/agentJobs/progrmBlock' },
  { name: 'ufwjob', path: './shell/agentJobs/ufwjob' },
  { name: 'remove.sh', path: './shell/agentJobs/remove.sh' },
  { name: 'backupJob_recovery.sh', path: './shell/agentJobs/backupJob_recovery.sh' }
];



exports.hamonizeAgentFileChk = async function () {
  // 폴더가 존재하는지 확인하고, 없으면 생성합니다.
  if (!fs.existsSync('/etc/hamonize/agentJobs/')) {
    fs.mkdirSync('/etc/hamonize/agentJobs/');
  }
  const { exec } = require('child_process');
  // 파일이 존재하는지 확인하고, 없으면 생성합니다.
  for (const jobFile of jobFiles) {
    const filePath = path.resolve(__dirname, jobFile.path);
    const targetPath = path.join('/etc/hamonize/agentJobs/', jobFile.name);
    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, fs.readFileSync(filePath));
      log("targetPath=======+" + targetPath)
      exec(`sudo chmod +x ${targetPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`command Run Error :: ${error.message}`);
        }
      });
    }
  }
}

async function copyHamonizeAgentFile() {

  try {

    JobsMkdir('/etc/hamonize/agentJobs/');

    // Agent] program ----#
    // fs.writeFileSync('/etc/hamonize/agentJobs/updtjob.sh', fs.readFileSync(path.resolve(__dirname, './shell/agent/updtjob.sh')));
    fs.writeFileSync('/etc/hamonize/agentJobs/rhel.sh', fs.readFileSync(path.resolve(__dirname, './shell/agentJobs/rhel.sh')));
    fs.writeFileSync('/etc/hamonize/agentJobs/programInstall', fs.readFileSync(path.resolve(__dirname, './shell/agentJobs/programInstall')));
    fs.writeFileSync('/etc/hamonize/agentJobs/progrmBlock', fs.readFileSync(path.resolve(__dirname, './shell/agentJobs/progrmBlock')));
    fs.writeFileSync('/etc/hamonize/agentJobs/ufwjob', fs.readFileSync(path.resolve(__dirname, './shell/agentJobs/ufwjob')));

    const { exec } = require('child_process')
    exec("sudo chmod +x /etc/hamonize/agentJobs/*", (error, stdout, stderr) => {
      if (error) {
        log(`command Run Error :: ${error.message}`);
      }
    });


  } catch (err) {
    console.error(err);
  }
}
