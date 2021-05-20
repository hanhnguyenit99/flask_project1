/*
 ----------------------------------------------------------------------------------------------------------------------
 * IDS's PTZ Javascript
 ----------------------------------------------------------------------------------------------------------------------
 -- Author		: Arius Technology JSC - Phong D. Nguyen
 -- Date		: 2021/02/22
 -- Description	: Javascript to handles camera ptz control process for 侵入監視サービス.
 -- Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 -- History		:
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- -- No	Date 		Author	  	    Description
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- --   1 2021/02/22   Phong D. Nguyen	新規作成.
 ----------------------------------------------------------------------------------------------------------------------
 */

const G_PTZ_POSITION_RELATIVE = 0;
const G_PTZ_POSITION_ABSOLUTE = 1;

let PTZ = {

    'api_endpoint': "http://192.168.0.183:8080",

    moveCamera: function(x, y, z, flag) {
        let apiEndpoint = $('#api-endpoint').val();
        if (apiEndpoint == "") {
            apiEndpoint = PTZ.api_endpoint;
        }

        $.ajax({
            url: apiEndpoint + "/requestptz?clientname=gui",
            type: "GET",
            data: {},
            success: function (xml, textStatus, xhr) {
                console.log("Success (" + textStatus + ": " + xhr.status + ")");
                $.ajax({
                    url: apiEndpoint + "/move",
                    type: 'GET',
                    data: {
                        "x": x,
                        "y": y,
                        "z": z,
                        movetype: flag == G_PTZ_POSITION_RELATIVE ? "relative" : "absolute"
                    },
                    success: function (result) {
                        console.log("Result: ", result);
                        PTZ.releaseCamera();
                    }
                });
            },
            error: function (jqXHR, exception) {
                console.log("Error (" + jqXHR.status + ": " + exception + ")");
                alert("PTZは使用中なので、少々お待ちください。");
            }
        });
    },

    releaseCamera: function() {
        let apiEndpoint = $('#api-endpoint').val();
        if (apiEndpoint == "") {
            apiEndpoint = PTZ.api_endpoint;
        }

        $.ajax({
            url: apiEndpoint + "/releaseptz?clientname=gui",
            type: "GET",
            data: {
            },
            success: function(xml, textStatus, xhr) {
                console.log(arguments);
                console.log(xhr.status);

            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });
    },

    moveCenter: function(x, y, w, h) {
        let apiEndpoint = $('#api-endpoint').val();
        if (apiEndpoint == "") {
            apiEndpoint = PTZ.api_endpoint;
        }

        $.ajax({
            url: apiEndpoint + "/requestptz?clientname=gui",
            type: "GET",
            data: {},
            success: function (xml, textStatus, xhr) {
                console.log("Success (" + textStatus + ": " + xhr.status + ")");
                $.ajax({
                    url: apiEndpoint + "/move_center",
                    type: 'GET',
                    data: {
                        "x": x,
                        "y": y,
                        "width": Math.round(w),
                        "height": Math.round(h)
                    },
                    success: function (result) {
                        console.log("Result: ", result);
                        PTZ.releaseCamera();
                    }
                });
            },
            error: function (jqXHR, exception) {
                console.log("Error (" + jqXHR.status + ": " + exception + ")");
                alert("PTZは使用中なので、少々お待ちください。");
            }
        });
    },
}