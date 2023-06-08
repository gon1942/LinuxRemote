// const moment = require('moment');
const {
	ipcRenderer
} = require('electron');
const {
	BrowserWindow
} = require('electron')
const path = require('path');
const unirest = require('unirest');

const Dialogs = require('dialogs');
const dialogs = Dialogs()

const remote = require('electron').remote;

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (event) => {
	if (document.readyState == "complete") {
		handleWindowControls();

		// document.getElementById('electron-ver').innerHTML = `${process.versions.electron}`
	}
};

window.onbeforeunload = (event) => {
	win.removeAllListeners();
}

function handleWindowControls() {
	// Make minimise/maximise/restore/close buttons work when they are clicked
	document.getElementById('min-button').addEventListener("click", event => {
		win.minimize();
	});

	document.getElementById('max-button').addEventListener("click", event => {
		win.maximize();
		document.body.classList.add('maximized');
	});

	document.getElementById('restore-button').addEventListener("click", event => {
		win.unmaximize();
		document.body.classList.remove('maximized');
	});

	document.getElementById('close-button').addEventListener("click", event => {

		if ($("#sub_title").text().indexOf("Auth") < 0) {
			if (confirm('프로그램 실행 중 창을 닫으시면 오류가 발생할 수 있습니다.')) {
				win.close();
			}
		} else {
			win.close();
		}

	});

}

// $modal = $(".modal");
// hamonizeSystemBackup();
// fn_hamonizeProgramInstall();
// # step 1. install file version check  ====================================
install_program_version_chkeck();


function install_program_version_chkeck() {
	ipcRenderer.send('install_program_version_chkeck');
}
ipcRenderer.on('install_program_version_chkeckResult', (event, isChkVal) => {
	if (isChkVal == 'Y') {
		// 초기 폴더 생성후 관리 프로그램 설치에 필요한 툴 설치 완료.
		console.log("초기 폴더 생성후 관리 프로그램 설치에 필요한 툴 설치 완료.");
		$("#loadingInfoText").text("");
	} else {
		fn_alert("프로그램 서버 정보 셋팅 오류. 관리자에게 문의 바랍니다. \n Error Code :: [N001]");
		return false;
	}
});


// # step 2. autheky chekc ===================================
// 인증 완료 후 조직 정보 가져오기
var doubleSubmitFlag = false;
const pcChkAuthBtn = document.getElementById('pcChkAuthBtn');
pcChkAuthBtn.addEventListener('click', function (event) {

	if (!doubleSubmitFlag) {
		let authkey_val = $("#authkey").val();
		if (authkey_val.length == 0) {
			doubleSubmitFlag = false;
			return false
		}
		ipcRenderer.send('getOrgAuth', authkey_val);
	} else {
		doubleSubmitFlag = true;
		return false;
	}
});
// # step 2. autheky chekc Result ===================================
ipcRenderer.on('getAuthResult', (event, authResult) => {
	// 조직정보
	if (authResult == 'N') {
		fn_alert("Hamonize 인증키 오류입니다. 다시 확인하신후 입력해 주시기바랍니다.");
	} else {
		// 인증코드 검증후 리턴받는값 -> 도메인
		$("#domain").val(authResult);
		// 인증코드 검증 후 사용 갯수체크 
		ipcRenderer.send('chkHamonizeAppUses', authResult);
	}
});


// # Step 3. Hamonize Used Count Check ====================================
ipcRenderer.on('chkHamonizeAppUsesResult', (event, ret) => {
	console.log("chkHamonizeAppUsesResult : " + ret);
	// 사용갯수에 이상이 없다면..
	if (ret == 'Y') {
		$(".layerpop__container").text("인증이 완료되었습니다. 조직정보를 불러오는 중입니다.  잠시만 기다려주세요.!!");
		ipcRenderer.send('getOrgData', $("#domain").val());
	} else  if (ret == 'O') { 
		$("#authkeyLayer").hide();
		$("#orgLayer").hide();
		$("#hmFreeDoneBody").show();
		$("#hmFreeDoneBodyTextMsg").html("𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮 사용기관이 종료되었습니다. .<br>시스템 관리자에게 문의바랍니다.");
		return false;
	} else {
		$("#authkeyLayer").hide();
		$("#orgLayer").hide();
		$("#hmFreeDoneBody").show();
		$("#hmFreeDoneBodyTextMsg").html("𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮 설치 수량이 초과하였습니다.<br>시스템 관리자에게 문의바랍니다.");
		return false;
	}
});

// # Step 4. Get Org Data ====================================
ipcRenderer.on('getOrgDataResult', (event, orgData) => {

	console.log("Step 4. Get Org Data")
	// if ($("#tmpFreeDateDone").val().trim() == 'FREEDONE') {
	// 	extensionContract();
	// } else {
	var option = "";
	$("#orgLayer").show();
	$("#authkeyLayer").hide();
	$('#groupName').empty();
	var chkCnt = 0;
	$.each(orgData, function (key, value) {
		option += "<option>" + value.orgnm + "</option>";
		chkCnt++;
	});
	if (chkCnt == 0) {
		$("#orgLayer").hide();
		$("#authkeyLayer").hide();
		// fn_alert("등록된 조직정보가 없습니다. 조직을 등록후 사용해주세요.");
		$("#hmFreeDoneBody").show();
		$("#hmFreeDoneBodyTextMsg").html("조직정보가 없어 컴퓨터의 정보를 등록할 수 없습니다.<br>시스템 관리자에게 문의바랍니다.");
	} else {
		$('#groupName').append(option);
	}
	// }
});

// # step 5. Select Org ====================================
const pcChkBtn = document.getElementById('pcChkBtn');
pcChkBtn.addEventListener('click', function (event) {
	if (!doubleSubmitFlag) {
		$("#selectOrg").val($("#groupName option:selected").val());
		// nextStap();
		fn_hamonizeProgramInstall();
		doubleSubmitFlag = true;
	} else {
		doubleSubmitFlag = true;
		return false;
	}
});

// --------------------------------------------------------------------
// #### Hamonize Program Install ####
// --------------------------------------------------------------------
function nextStap() {

	$("#loadingInfoText").text("");
	$("#initLayer").removeClass("active");
	$("#initLayerBody").removeClass("active");
	$("#procLayer").addClass("active");
	$("#procLayerBody").hide();
	$("#procLayerBody").show();
	$("#stepA").removeClass("br animate");
	$("#stepB").addClass("br animate");
	$("#infoStepA").text("완료");

	fn_hamonizeProgramInstall();
};


// ======== step 6. PC 관리 프로그램 설치... =========================================/
function fn_hamonizeProgramInstall() {

	$("#authkeyLayer").hide();
	$("#orgLayer").hide();
	$("#hmFreeDoneBody").hide();
	$("#installLayer").show();

	var video = $('#divVideo video')[0];
	video.src = "https://hamonize.com/uploads/video/hamonize-amt.mp4";
	video.load();
	video.play();

	$("#sub_title").html("Program Install List");
	$(".loading-container").css('visibility', 'visible');
	$("#loading-text").text("Install")

	// Start Hamonize Install 
	ipcRenderer.send('hamonizeProgramInstall', $("#domain").val());

}

ipcRenderer.on('hamonizeProgramInstall_Result', (event, programResult) => {
	if (programResult == 'Y') {
		console.log("pc 관리 프로그램 설치 및 셋팅 완료");
		$("#stepB").removeClass("br animate");
		$("#stepC").addClass("br animate");
		$("#infoStepB").text("완료");

		// pc 정보 등록
		let groupname = $("#selectOrg").val();
		if (typeof groupname == "undefined") {
			doubleSubmitFlag = false;
			return false;
		}

		// 프로그램 설치 완료 후 관리 센터에 pc 정보 등록
		let sabun = "sabun";
		let username = "username";
		ipcRenderer.send('pcInfoChk', groupname, sabun, username, $("#domain").val());

	} else {
		$("#initLayerBody").hide();
		$("#procLayerBody").hide();
		$("#errorText").html("<p>프로그램 설치 중 오류가 발생했습니다.</p> <br>  관리자에게 문의바랍니다. Error Code :: [N005-" + programResult + "]")
		$("#ErrorBody").show();
		return false;
	}
});


// 프로그램 설치 완료 후 관리 센터에 pc 정보 등록이 정상 처리 되었다면 백업 진행 
ipcRenderer.on('pcInfoChkProc', (event, isChkBool) => {
	if (isChkBool == true) {
		$(".loading-container").css('visibility', 'hidden');
		hamonizeSystemBackup();
	} else if (isChkBool == "exist") {
		doubleSubmitFlag = false;
		fn_alert("이미 등록된 컴퓨터입니다. 재 설치를 하실경우 관리자에게 문의바랍니다.");
	} else {
		doubleSubmitFlag = false;
		fn_alert("유효하지 않는 정보입니다..\n 지속적으로 문제가 발생할경우 관리자에게 문의바랍니다.");
	}

});



// ======== step 7. PC Backup... =========================================/
function hamonizeSystemBackup() {

	$("#authkeyLayer").hide();
	$("#orgLayer").hide();
	$("#hmFreeDoneBody").hide();
	$("#installLayer").hide();
	$("#backupLayer").show();

	var video = $('#divVideo video')[0];
	video.src = "https://hamonize.com/uploads/video/hamonize-admin.mp4";
	video.load();
	video.play();

	$("#sub_title").html("Os Backup");
	ipcRenderer.send('getDiskSize');

}

// 디스크 용량 체크 
ipcRenderer.on('getDiskSizeResult', (event, diskSize) => {
	$("#osDisk").text("- 디스크 용량 : " + diskSize);
});


// 사용자가 백업 버튼을 클릭시..
document.getElementById('backupBtn').addEventListener('click', function (event) {

	if ($("#backUpSelect").val() == "1") {
		$("#backupBtn").hide();
		$("#backupInfoMsg").show();
		$("#loading-text").text("Backup...")
		$(".loading-container").css('visibility', 'visible');
		$("#backUpSelect").hide();
		$("#backupInfo2").hide();
		ipcRenderer.send('hamonizeSystemBackup');
		setTimeout(() => { ipcRenderer.send('backupFiles-tail'); }, 2000);
	} else if ($("#backUpSelect").val() == "0") {
		fn_alert("백업 진행을 선택해 주세요..");
		return false;
	} else if ($("#backUpSelect").val() == "2") {
		$(".loading-container").css('visibility', 'hidden');
		$("#authkeyLayer").hide();
		$("#orgLayer").hide();
		$("#hmFreeDoneBody").hide();
		$("#installLayer").hide();
		$("#backupLayer").hide();
		$("#EndLayer").show();

		$("#sub_title").html("𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮 설치 완료되었습니다..");
		$("#EndMsg").html("설치 프로그램을 종료해주세요.");
	}



});

// 백업 진행률
ipcRenderer.on('backupFiles-tail-val', (event, ret) => {
	console.log("ret=="+ ret);
	var retViewDataSplit = '';
	var chkFirstChar = ret.charAt(0);
	console.log("chkFirstChar==="+chkFirstChar);
	if (chkFirstChar == ')') {
		retViewDataSplit = ret.slice(1);
	} else {
		retViewDataSplit = ret;
	}
	console.log("retViewDataSplit==="+retViewDataSplit)
	$("#backupInfoMsg").text(retViewDataSplit);
});

// 백업 완료 
ipcRenderer.on('hamonizeSystemBackup_Result', (event, backupResult) => {
	console.log("hamonizeSystemBackup_Result===" + backupResult);
	$(".loading-container").css('visibility', 'hidden');
	$("#authkeyLayer").hide();
	$("#orgLayer").hide();
	$("#hmFreeDoneBody").hide();
	$("#installLayer").hide();
	$("#backupLayer").hide();
	$("#EndLayer").show();

	if (backupResult == 'Y') {
		$("#sub_title").html("𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮 설치 완료되었습니다..");
		$("#EndMsg").html("설치 프로그램을 종료해주세요.");
		// $("#stepC").removeClass("br animate");
		// $("#initLayerBody").hide();
		// $("#procLayerBody").hide();
		// $("#infoStepC").text("완료");
		// $("#EndBody").show();

		//====================================================테스트용 주석 실 배포시 주석 해제
		// setTimeout(() => {
		// 	ipcRenderer.send('rebootProc');
		// }, 5 * 1000);

	} else {
		$("#sub_title").html("Os Backup Error");
		$("#EndMsg").html("백업중 오류가 발생했습니다. 관리자에게 문의 바랍니다.");
	}

});










// # step 4. apt repository check ==========사용안함===========================/
//
function aptRepositoryChk() {
	$("#stepA").removeClass("br animate");
	$("#stepB").addClass("br animate");
	ipcRenderer.send('aptRepositoryChk');
}
ipcRenderer.on('aptRepositoryChkProcResult', (event, mkfolderResult) => {
	console.log("aptRepositoryChkProcResult===" + mkfolderResult);

	if (mkfolderResult == 'Y') {
		console.log("true");
		// hamonizeProgramInstall();
	} else {
		console.log("false");
		fn_alert("프로그램 설치 환경 셋팅에 실패했습니다. \n 재실행 후 지속적으로 문제가 발생할경우 관리자에게 문의바랍니다.");
	}

}); // # step 4. apt repository check ==========사용안함===========================/


// # step 8. backup

// # setp 9. hamonikr  rescue backup

// 로그파일 첨부 버튼 클릭
// const aaaBtn = document.getElementById('aaa');
// aaaBtn.addEventListener('click',function(event){
// 	ipcRenderer.send('aaa');
// });  


// 프로그램 업데이트 완료시....
ipcRenderer.on('install_program_upgradeProcResult', (event, isChkVal) => {
	console.log("install_program_upgradeProcResult===" + isChkVal);
});

//	alert 
function fn_alert(arg) {

	dialogs.alert(arg, () => {
		$(".banner-text").css({
			"z-index": "1000000000"
		});
	});
}








// 기간 만료 후 재인증하는 경우....----------------------------------------#
// UI 재인증 셋팅 -1
const hamonizeAuthChkBtn = document.getElementById('hamonizeAuthChkBtn');
hamonizeAuthChkBtn.addEventListener('click', function (event) {
	document.title = "𝓗𝓪𝓶𝓸𝓷𝓲𝔃𝓮";
	// $modal.hide();
	$("#loadingInfoText").text("");

	$("#hmInstallIng").show();
	$("#hmInstallIngBody").show();

	$("#hmInstalled").hide();
	$("#hmFreeDoneBody").hide();


	$("#tmpFreeDateDone").val("FREEDONE");
});


// UI 재인증 셋팅-2
function extensionContract() {
	// $modal.hide();
	$("#loadingInfoText").text("");
	$("#initLayer").removeClass("active");
	$("#initLayerBody").removeClass("active");
	$("#procLayer").addClass("active");
	$("#procLayerBody").hide();
	$("#procLayerBody").show();

	initLayer

	$("#infoStepA").text("체크전");
	$("#infoStepB").text("체크전");
	$("#infoStepC").text("체크전");
}
// ========== UI 재인증 셋팅 완료 ----------------------------#

// 프로그램 체크 시작.
// 1. vpn 체크.
// 2. Ldap
// 3. Usb protect
// 4. Hamonie-Agent
// 5. user loginout
// 6. timeshift
// 7. telegraf 
// 8. Hamonize-admin
// 9. Hamonize-help



// ipcRenderer.on('pcInfoChkProc', (event, isChkBool) => {
// 	if (isChkBool == true) {
// 		$("#stepA").removeClass("br animate");
// 		$("#stepB").addClass("br animate");
// 		$("#infoStepA").text("완료");
// 		hamonizeProgramInstall();
// 	} else {
// 		doubleSubmitFlag = false;
// 		fn_alert("유효하지 않는 정보입니다. 확인 후 등록해 주시기바랍니다.\n 지속적으로 문제가 발생할경우 관리자에게 문의바랍니다.");
// 	}

// });




const nowRebootBtn = document.getElementById('nowReboot');
nowRebootBtn.addEventListener('click', function (event) {
	ipcRenderer.send('rebootProc');
});
