/*
 ----------------------------------------------------------------------------------------------------------------------
 * OTG's Common Javascript
 ----------------------------------------------------------------------------------------------------------------------
 -- Author		: Arius Technology JSC - Phong D. Nguyen
 -- Date		: 2021/02/16
 -- Description	: Javascript to handles common process for OntheWay.
 -- Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 -- History		:
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- -- No	Date 		Author	  	    Description
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- --   1 2021/02/16   Phong D. Nguyen	新規作成.
 ----------------------------------------------------------------------------------------------------------------------
 */

clearPassword = function() {
    $("input[name=password]").val("");
    $("input[name=new_password]").val("");
    $("input[name=confirm_password]").val("");
}

resizeCamera = function(camera) {
    let obj = $(camera).closest('div.camera-item');
    if ($(obj).hasClass('maximize')) {
        $(obj).removeClass("maximize");
        $(obj).addClass("minimize");
    } else {
        $(obj).removeClass("minimize");
        $(obj).addClass("maximize");
    }
}

