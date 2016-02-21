(function(){

	// 우선 로그인 정보를 받아와서 채워넣는다.
	chrome.tabs.executeScript(null,{code: "document.getElementsByClassName('clearfixread').innerHTML='<input type='checkbox'/>';"});
	chrome.runtime.sendMessage({
		'serv' : 'auto_login',
		'cmd'  : 'load'
	}, function(response){
	
		var auto_chk = document.querySelector('#auto_chk');
		var auto_id  = document.querySelector('#auto_id');
		var auto_pw  = document.querySelector('#auto_pw');

		if(response.states == 'true'){
			auto_chk.checked = true;
		}else{
			auto_chk.checked = false;
		}
		auto_id.value = response.userid;
		auto_pw.value = response.userpw;

		document.querySelector('#auto_btn').addEventListener('click', function(){
			// 저장버튼을 눌렀을시
			chrome.runtime.sendMessage({
				'serv' : 'auto_login',
				'cmd'  : 'save',
				'userid' : auto_id.value,
				'userpw' : auto_pw.value,
				'states'  : auto_chk.checked
			}, function(response){
				var msg = document.querySelector('#auto_msg');
				msg.innerHTML = '저장되었습니다...';
				setTimeout(function(){
					msg.innerHTML = '';
				}, 1000);
			});
		}, false);
	});
})();