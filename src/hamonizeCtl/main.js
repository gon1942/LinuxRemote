#!/usr/bin/env node

// #----------------------------------------------------------------------------##----------------------------------------------------------------------------#
const hamonizeFuns = require('./hamonize_functions');
const hamonizeCli = require('./hamonizeCli');

const packageJson = require('./package.json');
const baseurl = packageJson.url;
const { Command } = require('commander');
const program = new Command();

var log = require('./logger');

// #----------------------------------------------------------------------------##----------------------------------------------------------------------------#

// const log = console.log;

if (process.pkg) {
	log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
	log.info('@@@@@@@@@@@@@@@@@@  Run as packaged @@@@@@@@@@@@@@@@@@@@@@@@@@');
	log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
} else {
	log.info('##############################################################################');
	log.info('########################## Run by Node.js  ##########################');
	log.info('##############################################################################');
}


program
	.option('--test')
	.option('--test3')

	.option('--help')

	// Hamonize Connector	----------------
	.option('--settings')			//	 init file create 
	.option('--start') 					//	 cmd start 
	.option('--programInstall') // 프로그램 설치 

	//	Hamonize Agent ---------------
	.option('--eqchk')	//	장비 체크
	.option('--devicepolicy')	//	비인가 디바이스 정책
	.option('--devicepolicySend')	//	비인가 디바이스 정책

	.option('--ufw')	//	방화벽 관리
	.option('--progrmblock')	//	프로그램 차단
	.option('--updt')	//	프로그램 설치및 삭제		runupdt.deb

	.option('--remove')	//	프로그램 삭제
	.option('--recover')	//	프로그램 복구


	.option('--backup')	//	백업
	.option('--check')
	.parse();

if (program.opts().backup) {
	(async () => {
		hamonizeCli.back();
		// process.exit(1)
	})();
}


if (program.opts().check) {	//	방화벽 관리
	(async () => {
		hamonizeCli.hamonizeNeedsDir();
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
	})();
}


//	Hamonize Connect Commnad ===========================
if (program.opts().help) {
	hamonizeFuns.logErrorMsg('', 'Hamonize Program Install Fail')
	hamonizeFuns.printHelp('hamonize', '1.0')
	process.exit(1)
} // =================================================

// Gui Run ----
if (program.opts().settings) {
	(async () => {
		console.clear();
		hamonizeFuns.setbaseurl(baseurl);
		hamonizeCli.settings();		//	 shell job &  init file create
		hamonizeCli.hamonizeNeedsDir();
		// hamonizeCli.hamonizeNeedsDir();
	})();
}

if (program.opts().programInstall) {
	(async () => {
		console.clear();
		hamonizeFuns.setbaseurl(baseurl);
		log.info('baseurl====================', baseurl);
		hamonizeCli.programInstall();
	})();
}


// Cmd Run ------------
if (program.opts().start) {
	(async () => {
		console.clear();
		hamonizeFuns.setbaseurl(baseurl);
		// hamonizeCli.settings();		//	 shell job &  init file create
		hamonizeCli.hamonize_init()
	})();
}

//====================================================================//
//	------------------------------------------ Hamonize Agent Commnad ------------------------------------------ //
//====================================================================// 

if (program.opts().ufw) {	//	방화벽 관리
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		hamonizeCli.fnFirewallJob(osPlatForm);
		// process.exit(1)
	})();
}
if (program.opts().progrmblock) {	//	프로그램 차단
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		hamonizeCli.fnProgrmJob(osPlatForm);
		// process.exit(1)
	})();
}
if (program.opts().updt) {	//	프로그램 설치및 삭제
	(async () => {
		log.info("프로그램 설치및 삭제")
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeCli.hamonizeAgentFileChk();
		await hamonizeFuns.setServerInfoConfigProc();
		let osPlatForm = await hamonizeFuns.getOsPlatform();
		await hamonizeCli.fnUpdtAgentAction(osPlatForm);
	})();
}
if (program.opts().devicepolicy) {	//	비인가 디바이스 정책
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
		hamonizeCli.fnDeviceJob();
		// process.exit(1)
	})();
}
if (program.opts().devicepolicySend) {	//	비인가 디바이스 정책
	(async () => {
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
		hamonizeCli.sendToCenter_unauth();
		// process.exit(1)
	})();
}
if (program.opts().eqchk) {	//	장비 체크
	(async () => {
		log.info("baseurl========"+ baseurl)
		hamonizeCli.hamonizeAgentFileChk();
		hamonizeFuns.setbaseurl(baseurl);
		await hamonizeFuns.setServerInfoConfigProc();
		await hamonizeCli.sysinfoEqchk();
		// process.exit(1)
	})();
}


if (program.opts().remove) {
	hamonizeCli.remove()
	process.exit(1)
}


if (program.opts().recover) {
	hamonizeCli.recover()
	process.exit(1)
}

//==================================================



