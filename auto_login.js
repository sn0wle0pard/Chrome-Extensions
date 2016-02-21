(function(){

	chrome.runtime.sendMessage({
		'serv' : 'auto_login',
		'cmd'  : 'load'
	}, function(response){
	
		var login_form = document.forms['login'];

		if(response.states == 'true' && login_form != null){

			login_form.user_id.value                       = response.userid;
			login_form.password.value                 = response.userpw;
			login_form.encoded_pw.value = window.btoa(response.userpw);
						
			// login url
			login_form.action = 'http://bb.unist.ac.kr/webapps/login/';
			login_form.submit();	
		}

	});


})();

