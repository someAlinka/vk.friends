;(function(){
    var doc = document;
    var bodyElement = doc.getElementsByTagName("body")[0];
    var saveObj = {};

    /**** drag&drop ****/
    var boolEvent = boolDrop = false;
    var clone = currentLi = null;
    var clickX = clickY = 0;

    allFriends.addEventListener("mousedown", function(event){
    	var li = event.target;
    	if(li.tagName === "LI" || li.closest("li")){
    		currentLi = li.closest("li");
    		clone = currentLi.cloneNode(true);
    		boolEvent = true;
    		clickX = event.pageX - popup.offsetLeft - currentLi.offsetLeft ;
            clickY = event.pageY - popup.offsetTop - currentLi.offsetTop ;
    	}
    });

    bodyElement.addEventListener("mousemove", function(event){
        if(event.target.closest('#friendsList')) boolDrop = true;
        if(boolEvent){
        	if(clone.className.indexOf("current") == -1) clone.className = clone.className + " current";
        	bodyElement.appendChild(clone);
            clone.style.left = event.pageX - clickX  + 'px';
            clone.style.top = event.pageY - clickY + 'px';
        }
    });

    bodyElement.addEventListener("mouseup", function(event){
        dropEvent()
    });

    bodyElement.addEventListener("mouseleave", function(event){
        dropEvent()
    });

    function dropEvent(){
        if(boolEvent){
            if(boolDrop){
                friendsList.appendChild(currentLi);
            }
            if(clone)clone.remove();
            boolDrop = boolEvent = false;
            clone = currentLi = null;
            clickX = clickY = 0;
        }
    }
    /**** end drag&drop ****/

    popup.addEventListener("click", function(event){
        var item = event.target;
        if(item.className === "friend_icon"){
            var li = item.closest('li');
            if(li.closest('#allFriends')){
                friendsList.appendChild(li);
            }else{
                allFriends.appendChild(li);
            }
        }
    });

    /** поиск **/
    searchAllFriends.addEventListener("input", function(event){
        searchFriend(allFriends, event.target.value);
    });
    searchFriends.addEventListener("input", function(event){
        searchFriend(friendsList, event.target.value);
    });
    function searchFriend(obj, val){
        var arrLi = obj.getElementsByTagName("li");
        for(var i = 0; i < arrLi.length; i++){
            if(val === ""){
                arrLi[i].className = arrLi[i].className.replace(" hide", "");
            }else{
                if(arrLi[i].innerText.indexOf(val) == -1){
                    if(arrLi[i].className.indexOf("hide") === -1)
                        arrLi[i].className = arrLi[i].className + " hide";
                }else{
                    arrLi[i].className = arrLi[i].className.replace(" hide", "");
                }
            }
        }
    }

    /* save lists friends */
    save.addEventListener("click", function(event){
        saveObj = {};
        var arrLiAll = allFriends.getElementsByTagName("li");
        var arrLiCurrent = friendsList.getElementsByTagName("li");
        if(arrLiAll.length > 0){
            saveObj.allFriends = {};
            for(var i = 0; i < arrLiAll.length; i++){
                saveObj.allFriends[i] = {
                    'name':  arrLiAll[i].innerText,
                    'photo_50': arrLiAll[i].getElementsByTagName("img")[0].currentSrc
                }
            }
        }
        if(arrLiCurrent.length > 0){
            saveObj.friendsList = {};
            for(var i = 0; i < arrLiCurrent.length; i++){
                saveObj.friendsList[i] = {
                    'name':  arrLiCurrent[i].innerText,
                    'photo_50': arrLiCurrent[i].getElementsByTagName("img")[0].currentSrc
                }
            }
        }
        localStorage.myFriends = JSON.stringify(saveObj);
        alert("Сохранено");
    });

    /* vk and save localStorage */
    if(localStorage.myFriends){
        saveObj = JSON.parse(localStorage.myFriends);
        var templateFn = Handlebars.compile(friendsListTemplate.innerHTML);
        var template1 = templateFn({ list: saveObj.allFriends });
        allFriends.innerHTML = template1;
        var template2 = templateFn({ list: saveObj.friendsList });
        friendsList.innerHTML = template2;
    }else{
        new Promise(function(resolve) {
            if (document.readyState == 'complete') {
                resolve();
            } else {
                window.onload = resolve;
            }
        }).then(function() {
            return new Promise(function(resolve, reject) {
                VK.init({
                    apiId: 5760339
                });

                VK.Auth.login(function(response) {
                    if (response.session) {
                        resolve(response);
                    } else {
                        reject(new Error('Не удалось авторизоваться'));
                    }
                }, 2);
            });
        }).then(function() {
            return new Promise(function(resolve, reject) { // get friends IDs
                VK.api('friends.get', {'fields':'photo_50'}, function(serverAnswer) {
                    if (serverAnswer.error) {
                        reject(new Error(serverAnswer.error.error_msg));
                    } else {
                        let source = friendsListTemplate.innerHTML;
                        let templateFn = Handlebars.compile(source);
                        let template = templateFn({ list: serverAnswer.response });
                        allFriends.innerHTML = template;
                    }
                });
            });
        }).catch(function(e) {
            alert(`Ошибка: ${e.message}`);
        });
    }

}());