const electron = require('electron');
const {
	shell
} = require('electron');
const {
	app,
	BrowserWindow,
	globalShortcut
} = require("electron");
const {
	ipcMain
} = require('electron')
const timestamp = require('time-stamp');
const path = require('path');
const lineReader = require('line-reader');
const fs = require('fs');
const windowStateKeeper = require('electron-window-state');
const request = require('request');
const open = require('open');
const unirest = require('unirest');

const si = require('systeminformation');
const osModule = require("os");
const sudo = require('sudo-prompt');
const options = {
	name: 'Hamonikr'
};

// require('events').EventEmitter.prototype._maxListeners = 100;
const electronLocalshortcut = require('electron-localshortcut');

const packageJson = require('./package.json');
const baseurl = packageJson.url;
const osType = require('os');

let mainWindow, settingWindow;



function createWindow() {

	mainWindow = new BrowserWindow({

		backgroundColor: '#ffffff',
		width: 620,
		height: 360,
		minWidth: 600,
		minHeight: 371,
		titleBarStyle: 'hidden-inset',
		frame: true,
		show: false

		// icon: 'icons/png/emb2.png',
		// skipTaskbar: false,
		// 'width': 620,
		// 'height': 360,
		// frame: true,
		// alwaysOnTop: true,
		// resizable: true,
		// transparent: true,
		// show: true,
		, webPreferences: {
			defaultEncoding: 'utf8',
			defaultFontFamily: 'cursive',
			focusable: true,
			webviewTag: true,
			contextIsolation: false,
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			nodeIntegrationInSubFrames: true
		}
	});

	mainWindow.loadURL('file://' + __dirname + '/public/index.html');
	mainWindow.setMenu(null);
	mainWindow.setMenuBarVisibility(false);

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.show();
	});
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})


	electronLocalshortcut.register(mainWindow, 'F12', () => {
		// log.info('F12 is pressed')
		mainWindow.webContents.toggleDevTools()
	});

}

app.on('ready', () => {
	// if (process.env.USER !== 'root') {
	// 	console.log("root 권한이 필요합니다.");
	// 	const { exec } = require('child_process')
	// 	exec('pkexec env DISPLAY=$DISPLAY XAUTHORITY=$XAUTHORITY ' + process.argv[0] + ' ' + process.argv[1] +" --no-sandbox", (err, stdout, stderr) => {
	// 		if (err) {
	// 			console.error(err)
	// 			return
	// 		}
	// 		console.log(stdout)
	// 	})

	// 	return;
	// }
	setTimeout(createWindow, 500);
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});


ipcMain.on('shutdown', (event, path) => {
	console.log("main....shutdown");
	exec("gnome-session-quit --no-prompt", (error, stdout, stderr) => {
		if (error) {
			return;
		}
	});

});


//========================================================================
// # STEP 1. Init Hamonize 
//========================================================================
const hamonizeAppUUID_FILE = "/etc/hamonize/hamonize.appinfo";
ipcMain.on('install_program_version_chkeck', (event) => {
	console.log(`STEP 1. install_program_version_chkeck`);
	(async () => {
		try {

			// #step 1. 기본 폴더 및 파일 생성 및 기본 프로그램 설치
			let initJobResult = await initHamonizeJob();
			console.log("STEP 1. install_program_version_chkeck Result :: " + initJobResult);

			if (initJobResult == 'Y') {

			// 	let setServerInfoResult = await setServerInfo();
			// 	console.log("setServerInfoResult============" + setServerInfoResult);

			// 	if (setServerInfoResult == 'Y') {
			// 		// apt repository chk & add ....
			// 		let aptRepositoryChkResult = await aptRepositoryChkProc();
			// 		console.log("aptRepositoryChkResult=============================>" + aptRepositoryChkResult);

			// 		// #step 2. 설치 프로그램 버전 체크
			// 		let installProgramVersionResult = await install_program_version_chkeckProc();
			// 		console.log("설치 프로그램 버전 체크 Result===============>>>>>>>>>>>>>>>>>" + installProgramVersionResult);

			// 		if (installProgramVersionResult > 0) { // 설치 프로그램 업데이트 필요..
			// 			event.sender.send('install_program_version_chkeckResult', 'U999');

			// 		} else { // 설치 프로그램 최신버전
						event.sender.send('install_program_version_chkeckResult', 'Y');
			// 		}
			// 	} else {
			// 		// fail get Agent Server Info 
					// event.sender.send('install_program_ReadyProcResult', 'N004');
			// 	}
			} else {
			// 	// fail create folder 
				event.sender.send('install_program_version_chkeckResult', 'N001');
			}

		} catch (err) {
			console.log("install_program_version_chkeckProc---" + err);
			return Object.assign(err);
		}
	})();
});




//========================================================================
// # STEP 2. hamonize vpn install
//========================================================================
ipcMain.on('hamonizeVpnInstall', (event, domain) => {
	mainWindow.setSize(620, 447);
	var vpn_used;


	unirest.get(baseurl + '/hmsvc/isVpnUsed')
		.header('content-type', 'application/json')
		.send({
			events: [{
				domain: domain.trim()
			}]
		})
		.end(function (response) {
			var json = response.body;
			vpn_used = response.body[0]["vpn_used"];
			if (vpn_used == 'Y') {
				hamonizeVpnInstall_Action(event, domain);
			} else if (vpn_used == 0) {
				event.sender.send('hamonizeVpnInstall_Result', 'Y');
			}
		});
});
const hamonizeVpnInstall_Action = async (event, domain) => {
	try {
		// vpn install 
		await vpnCreate();
		// vpn install check 
		let vpnCreateResult = await vpnCreateChk();
		if (vpnCreateResult == 'Y') {
			// vpn 연결후 pc 정보 업데이트
			// pcInfoUpdate(domain);
			event.sender.send('hamonizeVpnInstall_Result', 'Y');
		} else {
			event.sender.send('hamonizeVpnInstall_Result', 'N002');
		}
	} catch (err) {
		console.log("hamonizeVpnInstall_Action Error---" + err);
		return Object.assign(err);
	}
} // hamonize vpn install END -----------------------------------------------#



//========================================================================
// # STEP 3. program install
//========================================================================

ipcMain.on('hamonizeProgramInstall', async (event, domain) => {
	console.log("sta1111111111111111111111111111111111111111111111111")
	hamonizeProgramInstall_Action(event, domain);
});
const hamonizeProgramInstall_Action = async (event, domain) => {
	try {
		let userId = await execShellCommand("cat /etc/passwd | grep 1000 | awk -F':' '{print $1}' ");
		console.log("####################userId#########333" + userId);

		let hamonizeProgramInstallProcResult = await hamonizeProgramInstallProc(domain, userId);
		console.log("hamonizeProgramInstall_Result:::::::::::::::::::::::::::::" + hamonizeProgramInstallProcResult);


		if (hamonizeProgramInstallProcResult == 'Y') {
			event.sender.send('hamonizeProgramInstall_Result', hamonizeProgramInstallProcResult);
		} else {

			const machineIdSync = require('node-machine-id').machineIdSync;
			let machindid = machineIdSync({
				original: true
			});

			unirest.post(baseurl + '/hmsvc/pcInfoReset')
				.header('content-type', 'application/json')
				.send({
					events: [{
						uuid: machindid,
						errortype: hamonizeProgramInstallProcResult.trim(),
						domain: domain.trim()

					}]
				})
				.end(function (response) {
					console.log("response.body===========++" + JSON.stringify(response.body));
					event.sender.send('hamonizeProgramInstall_Result', hamonizeProgramInstallProcResult);
				});

		}

	} catch (err) {
		console.log("hamonizeProgramInstall_Action Error---" + err);
		return Object.assign(err);
	}
}

function hamonizeProgramInstallProc(domain, userId) {
	return new Promise(function (resolve, reject) {
		console.log("#############33 program proc action###################")
		var aptRepositoryChkJobShell = "/bin/bash " + __dirname + "/shell/hamonizeProgramInstall.sh " + baseurl + " " + domain + " " + userId;
		sudo.exec(aptRepositoryChkJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("hamonizeProgramInstallProc Error is " + error);
					return resolve("N");
				} else {
					let tmpReturn = stderr.replace(/(\s*)/g, "");
					console.log('stderr---->: ' + tmpReturn + "==================");

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
					} else {
						return resolve("Y");
					}



				}
			}
		);
	});
} //program install END -----------------------------------------------------#

//========================================================================
// # STEP 4. Backup
//========================================================================

ipcMain.on('hamonizeSystemBackup', (event) => {
	hamonizeSystemBackup_Action(event);
});


const hamonizeSystemBackup_Action = async (event) => {
	try {
		console.log("hamonizeSystemBackup============START");
		let userId = await execShellCommand("cat /etc/passwd | grep 1000 | awk -F':' '{print $1}' ");
		let hamonizeSystemBackupProcResult = await hamonizeSystemBackupProc(userId);
		console.log("hamonizeSystemBackup_Proc==" + hamonizeSystemBackupProcResult);


		// START] application Uuid create -----------------//
		let uniqid = require('uniqid');
		let appUUID = uniqid() + (new Date()).getTime().toString(36);
		// const pcUuid = (await si.uuid());
		const machineIdSync = require('node-machine-id').machineIdSync;
		let machindid = machineIdSync({
			original: true
		});
		console.log("License Add STEP 1-3 ] - MachineId Value is ::: " + machindid + ",  App UUID Value is ::: " + appUUID);
		fs.writeFileSync(hamonizeAppUUID_FILE, machindid + "=" + appUUID);
		// END] application Uuid create -----------------//

		event.sender.send('hamonizeSystemBackup_Result', hamonizeSystemBackupProcResult);
	} catch (err) {
		console.log("hamonizeSystemBackup_Action Error---" + err);
		return Object.assign(err);
	}
}

function hamonizeSystemBackupProc(userId) {
	return new Promise(function (resolve, reject) {

		console.log("====__dirname===" + __dirname);
		//==========================================================사용자 정보 ==============
		var aptRepositoryChkJobShell = "/bin/bash " + __dirname + "/shell/hamonizeBackup.sh " + userId;

		sudo.exec(aptRepositoryChkJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("hamonizeSystemBackupProc error is " + error);
					return resolve("N");
				} else {
					// console.log('stdout: ' + stdout);
					// console.log('stderr: ' + stderr);
					resolve("Y");
				}
			}
		);
	});
} // Backup END ---------------------------------------------------------------#




//== get Agent Server Info   ===========================================
function setServerInfo() {
	return new Promise(function (resolve, reject) {

		console.log("====get Agent Server Info");
		var getAgentInfo = "/bin/bash " + __dirname + "/shell/setServerInfo.sh " + baseurl;

		sudo.exec(getAgentInfo, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					console.log('setServerInfo   tdout: ' + stdout);
					console.log('setServerInfo   stderr: ' + stderr);

					if (stdout.indexOf('skir')) {
						resolve('Y');
					} else {
						resolve('N');
					}

				}
			}
		);
	});
}


//== init Shell Job  ===========================================
// 기본 폴더 및 프로그램 설치
function initHamonizeJob() {
	return new Promise(function (resolve, reject) {
		// var initJobShell = "/bin/bash " + __dirname + "/shell/initHamonizeInstall.sh";
		var initJobShell = "node /home/gon/LinuxRemote/src/hamonizeCtl/main.js  --settings"
		console.log("initJobShell==========================================================")
		sudo.exec(initJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					return resolve("N");
				} else {
					resolve('Y');
				}
			}
		);
	});
}



//== install_program_version_upgrade  ===========================================
function install_program_version_chkeckProc() {
	return new Promise(function (resolve, reject) {

		var versionChk = "/bin/bash " + __dirname + "/shell/initVersionChk.sh";
		sudo.exec(versionChk, options,
			function (error, stdout, stderr) {
				if (error) {
					return reject("N");
				} else {
					console.log('install_program_version_chkeckProc---stdout: ' + stdout);
					console.log('install_program_version_chkeckProc---stderr: ' + stderr);
					resolve(stdout);
				}
			}
		);
	});
}



//== vpn create  Shell Job  ===========================================
function vpnCreate() {
	return new Promise(function (resolve, reject) {
		var initJobShell = "/bin/bash " + __dirname + "/shell/vpnInstall.sh";
		sudo.exec(initJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					resolve('Y');
				}
			}
		);
	});
}

//== vpn create  Shell Job  ===========================================
function vpnCreateChk() {
	return new Promise(function (resolve, reject) {
		var initJobShell = "/bin/bash " + __dirname + "/shell/vpnInstallChk.sh";
		sudo.exec(initJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					console.log('stderr vpn, chk,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,: ' + stderr);
					console.log('stdout vpn, chk,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,: ' + stdout + "--" + stdout.indexOf('SUCCESS'));

					resolve('Y');
				}
			}
		);
	});
}

//== install program update   ===========================================
ipcMain.on('install_program_update', (event) => {
	install_program_updateAsync(event);
});


const install_program_updateAsync = async (event) => {
	try {
		let install_program_updateProcResult = await install_program_lastversion_installProc();

		if (install_program_updateProcResult == 'Y') {
			event.sender.send('install_program_version_chkeckResult', 'U001');
		} else {
			event.sender.send('install_program_version_chkeckResult', 'U002');
		}
	} catch (err) {
		console.log("install_program_updateAsync---" + err);
		return Object.assign(err);
	}
}


function install_program_lastversion_installProc() {
	return new Promise(function (resolve, reject) {
		var installJobShell = " sudo apt-get --only-upgrade install hamonize-connect-server -y ";
		sudo.exec(installJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					resolve('Y');
				}
			}
		);
	});

}





//== install_program_version_upgrade  ===========================================

ipcMain.on('install_program_upgrade', (event) => {
	install_program_upgradeAsync(event);
});

const install_program_upgradeAsync = async (event) => {
	try {
		let chkVal = await install_program_upgradeProc();
		console.log("install_program_upgradeProc==" + chkVal);
		event.sender.send('install_program_upgradeProcResult', chkVal);

	} catch (err) {
		console.log("install_program_upgradeProc---" + err);
		return Object.assign(err);
	}
}

function install_program_upgradeProc() {
	return new Promise(function (resolve, reject) {

		var upgradeInstallProgram = "sudo apt-get --only-upgrade install hamonize-connect -y";

		sudo.exec(upgradeInstallProgram, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					resolve(stdout);
				}
			}
		);
	});
}


//================= pc info ==================================

// == pc 정보 체크===
ipcMain.on('pcInfoChk', (event, groupname, sabun, username, domain) => {
	sysInfo(event, groupname, sabun, username, domain);

});



function execShellCommand(cmd) {
	const exec = require('child_process').exec;
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
			}
			resolve(stdout ? stdout : stderr);
		});
	});
}

function execSetHostname(svrpcnum) {
	return new Promise((resolve, reject) => {
		sudo.exec("hostnamectl set-hostname " + svrpcnum, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("hostnamectl set-hostname error is " + error);
				} else {
					console.log('hostnamectl set-hostname stdout: ' + stdout);
					console.log('hostnamectl set-hostname stderr: ' + stderr);
					resolve(stdout);
				}
			}
		);
	});
}

function getPublicIp() {
	return new Promise((resolve, reject) => {
		sudo.exec("curl -4 icanhazip.com ", options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("getPublicIp error is " + error);
				} else {
					console.log('getPublicIp stdout: ' + stdout);
					console.log('getPublicIp stderr: ' + stderr);
					resolve(stdout);
				}
			}
		);
	});
}

let pcHostNameVal = "";
const sysInfo = async (event, groupname, sabun, username, domain) => {
	const pcHostname = await execShellCommand('hostname');
	pcHostNameVal = pcHostname;
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

	//
	// let vpnipaddr = 'no vpn';

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
		console.log(results['tun0']); // result ::: [ '10.8.0.2', 'fe80::87f5:686f:a23:1002' ]
		vpnipaddr = results['tun0'][0];
	}
	console.log("=============vpnipaddr================" + vpnipaddr);
	var md5 = require('md5');
	let hwinfoMD5 = pcHostname + ipinfo.address() + cpuinfoMd5 + diskInfo + diskSerialNum + osinfoKernel + raminfo + machindid;
	let hwData = md5(hwinfoMD5);

	let fileDir = "/etc/hamonize/hwinfo/hwinfo.hm";
	fs.writeFile(fileDir, hwData, (err) => {
		if (err) {
			// log.info("//== sysInfo hw check create file error  "+ err.message)
		}
	});

	console.log("등록 버튼 클릭시 center url >> " + baseurl + '/hmsvc/setPcInfo');
	unirest.post(baseurl + '/hmsvc/setPcInfo')
		.header('content-type', 'application/json')
		.send({
			events: [{
				uuid: machindid,
				cpuid: cpuinfo.trim(),
				hddid: diskSerialNum.trim(),
				hddinfo: diskInfo.trim(),
				macaddr: macs[0],
				ipaddr: ipinfo.address().trim(),
				vpnipaddr: vpnipaddr.trim(),
				hostname: pcHostname.trim(),
				pcos: osinfo.trim(),
				memory: raminfo.trim(),
				deptname: groupname.trim(),
				sabun: sabun.trim(),
				username: username.trim(),
				domain: domain.trim()

			}]
		})
		.end(function (response) {
			console.log("sysinfo() = add  pc info ===========++" + response.body);
			event.sender.send('pcInfoChkProc', response.body);
		});

}

// vpn 연결후 pc 정보 업데이트
function pcInfoUpdate(domain) {
	let vpnipaddr = '';
	let vpnInfoData = vpnchk();
	console.log("vpnInfoData====" + vpnInfoData);
	if (vpnInfoData.length == 0) {
		vpnipaddr = 'no vpn';
	} else {
		vpnipaddr = vpnInfoData;
	}

	const machineIdSync = require('node-machine-id').machineIdSync;
	let machindid = machineIdSync({
		original: true
	});

	unirest.post(baseurl + '/hmsvc/setVpnUpdate')
		.header('content-type', 'application/json')
		.send({
			events: [{
				domain: domain,
				uuid: machindid,
				vpnipaddr: vpnipaddr,
				hostname: pcHostNameVal
			}]
		})
		.end(function (response) {
			console.log("response.body===" + response.body);
		});
}


// ====================================== 기능 점검 대상 ======================================================================#
function vpnchk() {
	var os = require('os');
	var ifaces = os.networkInterfaces();
	var retVal = '';

	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;
		var tmpIfname = "";
		ifaces[ifname].forEach(function (iface) {
			if (iface.internal !== false) {
				console.log('not conn');
				tmpIfname = 'ERROR-1944';
			}
			if (alias >= 1) {
				console.log("alias >= 1  : " + ifname + ':' + alias, iface.address);
			} else {
				console.log("this interface has only one ipv4 adress is :" + ifname, iface.address);
				if (ifname == 'tun0') {
					retVal = iface.address;
					console.log("tmpIfname : " + retVal);
				}
			}
			++alias;
		});
	});
	return retVal;

} // =======================================================================================================================#


//========================================================================#
// # aptRepositoryChk 
//========================================================================#
//(사용안함)
ipcMain.on('aptRepositoryChk', (event) => {
	aptRepositoryChkAsync(event);
});

//(사용안함)
const aptRepositoryChkAsync = async (event) => {
	try {
		let aptResult = await aptRepositoryChkProc();
		console.log("aptRepositoryChkProc==" + aptResult);
		event.sender.send('aptRepositoryChkProcResult', aptResult);
	} catch (err) {
		console.log("aptRepositoryChkAsync---" + err);
		return Object.assign(err);
	}
}

// install_program_version_chkeckAsync 에서 호출
function aptRepositoryChkProc() {
	return new Promise(function (resolve, reject) {

		console.log("====__dirname===" + __dirname);
		var aptRepositoryChkJobShell = "/bin/bash " + __dirname + "/shell/aptCheck.sh";

		sudo.exec(aptRepositoryChkJobShell, options,
			function (error, stdout, stderr) {
				if (error) {
					console.log("error is " + error);
					return resolve("N");
				} else {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					resolve("Y");
				}
			}
		);
	});
} // aptRepositoryChk==============================================#


// 조직정보 
ipcMain.on('getOrgData', (event, domain) => {
	unirest.get(baseurl + '/hmsvc/getOrgData')
		.header('content-type', 'application/json')
		.send({
			events: [{
				domain: domain
			}]
		})
		.end(function (response) {
			event.sender.send('getOrgDataResult', response.body);
		});
});

// 인증
ipcMain.on('getOrgAuth', (event, authkeyVal) => {

	unirest.get(baseurl + '/hmsvc/getOrgAuth')
		.header('content-type', 'application/json')
		.send({
			events: [{
				authkey: authkeyVal
			}]
		})
		.end(function (response) {


			if (response.statusCode == 200) {
				//	// file write 
				let fileDir = "/etc/hamonize/hamonize_tanent";
				fs.writeFile(fileDir, response.body, (err) => {
					if (err) {
						console.log("//== sysInfo hw check create file error  " + err.message)
						event.sender.send('getAuthResult', 'N');

					}
				});
				event.sender.send('getAuthResult', response.body);
			} else {
				event.sender.send('getAuthResult', 'N');
			}
		});

});

// Check Hamonize Uses 
ipcMain.on('chkHamonizeAppUses', (event, domain) => {
	console.log("domain=====+" + domain);

	unirest.get(baseurl + '/hmsvc/isitpossible')
		.header('content-type', 'application/json')
		.send({
			events: [{
				domain: domain
			}]
		})
		.end(function (response) {
			console.log("=========response.body=======+" + response.body);
			event.sender.send('chkHamonizeAppUsesResult', response.body);
		});
});




ipcMain.on('rebootProc', (event) => {
	sudo.exec('reboot', options,
		function (error, stdout, stderr) {
			if (error) throw error;
			console.log('stdout: ' + stdout);
		}
	);
});

var fileToTail = "/tmp/backup.log";
ipcMain.on('files-tail', (event, domain) => {
	const Tail = require('tail-file');
	const mytail = new Tail(fileToTail, line => {
		console.log(line);
		event.sender.send('files-tail-val', line);
	});
});

