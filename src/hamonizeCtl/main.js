#!/usr/bin/env node

// #----------------------------------------------------------------------------##----------------------------------------------------------------------------#
const hamonizeFuns = require('./hamonize_functions');
const hamonizeCli = require('./hamonizeCli');
const baseurl = "http://192.168.0.240:8083";
const { Command } = require('commander');
const program = new Command();
// #----------------------------------------------------------------------------##----------------------------------------------------------------------------#

const log = console.log;

if (process.pkg) {
	log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
	log('@@@@@@@@@@@@@@@@@@  Run as packaged @@@@@@@@@@@@@@@@@@@@@@@@@@');
	log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
} else {
	log('##############################################################################');
	log('########################## Run by Node.js  ##########################');
	log('##############################################################################');
}


program
	.option('--test')
	.option('--test3')

	.option('--help')

 	// Hamonize Connector	----------------
	.option('--settings')	//	 init file create 
	.option('--start') //	 cmd start 

	//	Hamonize Agent ---------------
	.option('--eqchk')	//	장비 체크
	.option('--devicepolicy')	//	비인가 디바이스 정책
	.option('--devicepolicySend')	//	비인가 디바이스 정책

	.option('--ufw')	//	방화벽 관리
	.option('--progrmblock')	//	프로그램 차단
	.option('--updt')	//	프로그램 설치및 삭제		runupdt.deb

	.parse();

//	Hamonize Connect Commnad ===========================
if (program.opts().help) {
	hamonizeFuns.logErrorMsg('', 'Hamonize Program Install Fail')
	hamonizeFuns.printHelp('hamonize', '1.0')
	process.exit(1)
}

if (program.opts().settings) {
	(async () => {
		console.clear();
		hamonizeCli.settings();
	})();
}

if (program.opts().start) {
	(async () => {
		console.clear();
		hamonizeFuns.setbaseurl(baseurl);
		hamonizeCli.hamonizeNeedsDir();
		hamonizeCli.hamonize_init()
	})();
}

//==================================================
//	Hamonize Agent Commnad =============================
if (program.opts().ufw) {	//	방화벽 관리
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		hamonizeCli.fnFirewallJob(osPlatForm);
	})();
}
if (program.opts().progrmblock) {	//	프로그램 차단
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		hamonizeCli.fnProgrmJob(osPlatForm);
	})();
}
if (program.opts().updt) {	//	프로그램 설치및 삭제
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		hamonizeCli.fnUpdtAgentAction(osPlatForm);
	})();
}
if (program.opts().devicepolicy) {	//	비인가 디바이스 정책
	hamonizeFuns.setbaseurl(baseurl);
	hamonizeCli.fnDeviceJob();
}
if (program.opts().devicepolicySend) {	//	비인가 디바이스 정책
	hamonizeFuns.setbaseurl(baseurl);
	hamonizeCli.sendToCenter_unauth();
}
if (program.opts().eqchk) {	//	장비 체크
	hamonizeFuns.setbaseurl(baseurl);
	hamonizeCli.hamonizeNeedsDir();
	hamonizeCli.sysinfoEqchk();
}

//==================================================



