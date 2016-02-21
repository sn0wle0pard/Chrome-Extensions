// js

(function(){

	// create db (sqlite) 512 MBytes
	var db = openDatabase('sl_plugin', '1.0', 'sl_plugin', 512 * 1024 * 1024);

	db.transaction(function(tx){
		tx.executeSql(
			'CREATE TABLE IF NOT EXISTS sl_hist' + 
			'(url TEXT ,' + 
			' sno INTEGER ,' + 
			' ts TEXT, ' +
			' content TEXT,' + 
			' PRIMARY KEY(url, sno));'
		);
		console.log('create table');
	}, function(err, commited, snapshot){
		console.log(err);
	});


	var fetched; // SQL SELECT 사용시 fetch 한 결과를 저장해 놓는다
	var fetch_on = false; // fetch 중인지 판단하는 flag 비동기실행하에서 순서보장
	// make services
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse){
			//console.log(sender);

			// 자동로그인 서비스
			if(request.serv == 'auto_login'){
				// 로드 명령
				if(request.cmd == 'load'){
					sendResponse({
						'userid': localStorage.getItem('sl_auto_login_userid'),
						'userpw': localStorage.getItem('sl_auto_login_userpw'),
						'states' : localStorage.getItem('sl_auto_login_state' )
					});
				}
				if(request.cmd == 'save'){
					localStorage.setItem('sl_auto_login_userid', request.userid),
					localStorage.setItem('sl_auto_login_userpw', request.userpw),
					localStorage.setItem('sl_auto_login_state' , request.states)
					sendResponse({'done':'done'});
				}
			}
			else 
			// 너싫어 서비스
			if(request.serv == 'ihateyou'){

				if(request.cmd == 'load'){
					var list = {};				
					for(var i=0; i < localStorage.length; i++){
						var key = localStorage.key(i);
						if(key.indexOf('sl_ihate_') == 0){
							list[key.substring(9, key.length)] = true;
						}
					}
					sendResponse({
						'list': list
					});
				}
				if(request.cmd == 'save'){
					localStorage.setItem('sl_ihate_' + request.userid, 1);
				}
				if(request.cmd == 'del'){
					localStorage.removeItem('sl_ihate_' + request.userid);
				}
			}
			else
			// 히스토리 기능
			if(request.serv == 'history'){		
				if(request.cmd == 'save'){
					db.transaction(function(tx){
						tx.executeSql(
							'INSERT INTO sl_hist (url, sno, ts, content)' + 
							'VALUES (?, ' + 
								'(select ifnull(max(sno),0)+1 from sl_hist where url=?),' + 
								'?,?);'
							, [request.url, request.url,request.timestamp, request.contents]
						);
						// 3개까지 기억한다.
						tx.executeSql(
							'DELETE FROM sl_hist WHERE url=? ' + 
							'AND sno = (select ifnull(max(sno),0)-3 from sl_hist where url=?)'
							, [request.url, request.url]
						);
					}, function(err, commited, snapshot){
						console.log(err);
					});
				}
				if(request.cmd == 'contents'){
					db.transaction(function(tx){
						tx.executeSql(
							'SELECT ts, content FROM sl_hist WHERE url=? ORDER BY sno DESC',
							[request.url],
							function(tx, results){								
								var res = [];
								for(var i=0; i < results.rows.length; i++){
									res[i] = results.rows.item(i);
								}
								fetched = res;
								fetch_on = false;
							}
						);
					}, function(err, commited, snapshot){
						console.log(err);
					});
					fetch_on = true;
					sendResponse(parseInt(Math.random()*100000));
				}
				if(request.cmd == 'search'){
					function make_or_cond(list){
						if (list.length > 0){
							var ret = [];
							for(var i=0; i < list.length; i++){
								if(list[i] == '') continue;

								ret.push( "content like '%"+ list[i] +"%'");
							}
							if(ret.length == 0)
								return 'url is null';
							ret = ret.join(' AND ');
							console.log(ret);
							return '(' + ret + ')' ;
						}else{
							return 'url is null';
						}
					}
					db.transaction(function(tx){
						tx.executeSql(
							'SELECT url, ts, content FROM sl_hist WHERE '
							+ make_or_cond(request.search) + " AND url like '%wr_id%';"
							//+ ' LIMIT ' + (request.page * 10) + ', 10;' 
							,
							[],
							function(tx, results){								
								var res = [];
								for(var i=0; i < results.rows.length; i++){
									res[i] = results.rows.item(i);
								}
								fetched = res;
								fetch_on = false;
							}
						);
					}, function(err, commited, snapshot){
						console.log(err);
					});
					fetch_on = true;
					sendResponse(parseInt(Math.random()*100000));
				}
				if(request.cmd == 'del_all'){
					db.transaction(function(tx){
						tx.executeSql('DELETE FROM sl_hist');
					}, function(err, commited, snapshot){
						console.log(err);
					});
					sendResponse(parseInt(Math.random()*100000));
				}
				if(request.cmd == 'fetched'){
					if(fetch_on == true){
						sendResponse({list: null, fetch_on: true});
					}else {
						sendResponse({list: fetched, fetch_on: false});
					}
				} // request cmd
			} // request serv
		} // service function
	);


})();
