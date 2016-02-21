function windowLoaded() {
	var str = "";
	str +=  "<table>";
	str +=  "<tr>";
	str +=  "<td>";
	str +=  "HTML 태그를 삽입할 수 있습니다.";
	str +=  "</td>";
	str +=  "</tr>";
	str +=  "</table>";
	document.getElementById("contentFrame").contentWindow.document.getElementById('column0').innerHTML = str;
}
addEventListener("load", windowLoaded, false);