/*
 ----------------------------------------------------------------------------------------------------------------------
 * IDS's Canvas Javascript
 ----------------------------------------------------------------------------------------------------------------------
 -- Author		: Arius Technology JSC - Phong D. Nguyen
 -- Date		: 2021/02/01
 -- Description	: Javascript to handles canvas drawing process for 侵入監視サービス.
 -- Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 -- History		:
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- -- No	Date 		Author	  	    Description
 -- -- --- ------------ --------------- -------------------------------------------------------------------------------
 -- --   1 2021/02/01   Phong D. Nguyen	新規作成.
 ----------------------------------------------------------------------------------------------------------------------
 */

/**********************************************************************************************************************
 * VARIABLES DEFINITION - 変数定義
 *********************************************************************************************************************/

let g_canvas = document.querySelector("#canvas");   // Canvasオブジェクト
let g_ctx = g_canvas.getContext('2d');              // Canvasコンテキスト

let g_isShowCanvas = false;
let g_isShowAreas = false;
let g_isDrawAllowed = false;

let g_isDrawing = false;
let g_isFinishedPoint = true;
let g_drawing_point_no = 0;

let g_isSelectedPoint = false;
let g_isSelectedArea = false;
let g_isMousePressed = false;
let g_isAreaHover = false;

let g_hoverAreaId = "";
let g_hoverPointId = "";

let g_selectedAreaId = "";
let g_selectedPointId = "";

let g_dragStartX, g_dragStartY;
let g_currentX, g_currentY;

let g_drawingPolygon = {
    'id': "",
    'title': '検知エリア',
    'camera_id': 0,
    'type': 0,
    'coordination_no': 0,
    'monitor_flag': 0,
    'crop_flg': 0,
    'points': [],
    'isSelected': false,
    'color': '#FF0000',
    'fill_color': '#FFFFFF'
};

let g_drawingPoint = {
    "id": "",
    "isSelected": false,
    "x": 0,
    "y": 0
};


/** 検知エリア対象 */
let Area = {
    'id': 0,
    'title': '検知エリア',
    'camera_id': 0,
    'type': 0,
    'coordination_no': 0,
    'monitor_flag': 0,
    'crop_flg': 0,
    'points': [],   // 頂点一覧
    'isSelected': false,
    'color': '#FF0000',
    'fill_color': '#FFFFFF'
}

let Point = {
    "id": "",
    "x": 0,
    "y": 0,
    "isSelected": false
}

const G_CAM_PTZ = 0;
const G_CAM_FIXED = 1;
const G_CAM_360 = 2;

const G_AREA_A_COLOR = '#ED0000';
const G_AREA_B_COLOR = '#00B0F0';
const G_AREA_C_COLOR = '#66FF33';
const G_AREA_D_COLOR = '#FFFF00';
const G_AREA_EXCLUDE_COLOR = '#F7BD61';

const G_AREA_A = 1;
const G_AREA_B = 2;
const G_AREA_C = 3;
const G_AREA_D = 4;

const G_DETECT_AREA = 1;
const G_EXCLUDE_AREA = 2;


let DATA = {

    // モード種別（1: 読み取り専用、2: 変更）
    'mode' : 1,

    // 監視中カメラID
    'activeCameraId': 0,

    // カメラ種別
    'cameraType': G_CAM_PTZ,

    // エリアタイプ (０：なし、１：Fixed1連携、２：Fixed2連携、３：360連携、４：監視ﾎﾟｼﾞｼｮﾝ）
    'areaType': 0,

    // 連携ポジション番号（０：なし、１：A、２：B、３：C、４：D）
    'areaCoordinationNo' : 0,

    // エリア監視フラグ (0: 除外エリア、1: 検知エリア)
    'areaMonitorFlag' : G_EXCLUDE_AREA,

    // 検知エリア一覧
    'aDetectAreas': [
    ],

    // 除外エリア一覧
    'aExcludeAreas': [
    ],

    // マウス(カーソル)がエリアの上に乗っている状態のエリア一覧
    'aHoverAreas': [
    ],

    //
    'isAreaCollide': false,

    // 編集した検知エリアが保存されたかどうか？
    'isSaved': true,

    /*
     * 監視エリア一のCanvasを再描画する。
     */
    redraw: function() {
        g_ctx.clearRect(0, 0, g_canvas.width, g_canvas.height);

        DATA.aDetectAreas.forEach((area, index, arr) => {
            COMMON.draw(area);
        });

        DATA.aExcludeAreas.forEach((area, index, arr) => {
            COMMON.draw(area);
        });
    },

    /*
     * 監視エリア一のCanvasをクリアーする。
     */
    clear: function() {
        g_isShowCanvas = false;
        g_isDrawAllowed = false;

        DATA.aDetectAreas = [];
        DATA.aExcludeAreas = [];
        DATA.aHoverAreas = [];

        g_ctx.clearRect(0, 0, g_canvas.width, g_canvas.height);
    },

    /**
     *
     */
    cancel: function() {
        g_isDrawing = false;
        g_drawingPolygon = {
            'id': "",
            'title': '検知エリア',
            'camera_id': 0,
            'type': 0,
            'coordination_no': 0,
            'monitor_flag': 0,
            'crop_flg': 0,
            'points': [],
            'isSelected': false,
            'color': '#FF0000',
            'fill_color': '#FFFFFF'
        };
        g_drawing_point_no = 0;
        g_isFinishedPoint = true;

        DATA.redraw();
    }
};


/**********************************************************************************************************************
 * FUNCTIONS DEFINITION - 関数定義
 *********************************************************************************************************************/
let COMMON = {

    draw: function(polygon) {
        g_ctx.fillStyle = "#ff0000";

        // Draw the line & build shape.
        g_ctx.lineWidth = 4;
        g_ctx.strokeStyle = polygon.color;

        DATA.aDetectAreas.forEach((area, index, arr) => {
            if (area.id != g_selectedAreaId) {
                area.isSelected = false;
            }

            area.points.forEach((point) => {
                if (point.id != g_selectedPointId) {
                    point.isSelected = false;
                }
            });
        });

        DATA.aExcludeAreas.forEach((area, index, arr) => {
            if (area.id != g_selectedAreaId) {
                area.isSelected = false;
            }

            area.points.forEach((point) => {
                if (point.id != g_selectedPointId) {
                    point.isSelected = false;
                }
            });
        });

        if (polygon.isSelected) {
            g_ctx.strokeStyle = "#A5E3ED";
        }

        g_ctx.beginPath();
        polygon.points.forEach((point, index, arr) => {
            if (arr.length > 1) {
                if (index == 0) {
                    g_ctx.moveTo(point.x, point.y);
                }

                if (index != arr.length -1) {
                    g_ctx.lineTo(arr[index + 1].x, arr[index + 1].y);
                }
            }
        });

        // Fill shapes color.
        g_ctx.fillStyle = "rgba(255, 255, 255, 0.0)";

        // console.log("isPointInPath: ", g_ctx.isPointInPath(g_currentX, g_currentY));
        if (g_ctx.isPointInPath(g_currentX, g_currentY)) {
            g_isAreaHover = true;
        } else {
            g_isAreaHover = false;
        }

        let hoverArea = COMMON.getHoverArea(polygon.id);
        if (hoverArea) {
            hoverArea.status = g_isAreaHover;
        } else {
            let hoverArea = {
                "id": polygon.id,
                "status": g_isAreaHover
            }
            DATA.aHoverAreas.push(hoverArea);
        }

        g_ctx.closePath();
        g_ctx.fill();
        g_ctx.stroke();

        // Draw the dots.
        polygon.points.forEach((point, index, arr) => {
            g_ctx.fillStyle = "#FF0000";
            if (point.isSelected) {
                g_ctx.fillStyle = "#F39C12";
            }

            g_ctx.beginPath();
            g_ctx.arc(point.x, point.y, 6, 0, 6 * Math.PI);
            g_ctx.fill();
        });
    },


    isPointHover: function(e) {
        let result = false;

        let areas = [] ;
        if (DATA.areaMonitorFlag == G_DETECT_AREA) {
            areas = DATA.aDetectAreas;
        } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
            areas = DATA.aExcludeAreas;
        }

        areas.every(area => {
            let isSkip = false;
            area.points.every(point => {

                let x = e.offsetX;	// e.pageX - canvasOffset.left
                let y = e.offsetY;	// e.pageY - canvasOffset.top
                let dx = point.x - x;
                let dy = point.y - y;

                if (dx * dx + dy * dy < 6 * 6) {
                    if (!result) {
                        result = true;

                        g_hoverAreaId = area.id;
                        g_hoverPointId = point.id;

                        isSkip = true;
                        return false;
                    }
                }

                return true;
            });

            if (isSkip) {
                return false;
            }
            return true;
        });

        return result;
    },


    getPoint: function(pointId) {
        let obj = {};

        let areas = [] ;
        if (DATA.areaMonitorFlag == G_DETECT_AREA) {
            areas = DATA.aDetectAreas;
        } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
            areas = DATA.aExcludeAreas;
        }

        areas.every(area => {
            area.points.every(point => {
                if (point.id == pointId) {
                    obj = point;
                    return false;
                }
                return true;
            });
            return true;
        });

        return obj;
    },

    getArea: function(areaId, pointId) {
        let obj = {};

        let areas = [];
        if (DATA.areaMonitorFlag == G_DETECT_AREA) {
            areas = DATA.aDetectAreas;
        } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
            areas = DATA.aExcludeAreas;
        }

        areas.every(area => {
            if (areaId) {
                if (area.id == areaId) {
                    obj = area;
                    return false;
                }
            } else {
                area.points.every(point => {
                    if (point.id == pointId) {
                        obj = area;
                        return false;
                    }
                    return true;
                });
            }
            return true;
        });

        return obj;
    },

    getHoverArea: function(areaId) {
        let obj;

        DATA.aHoverAreas.every(area => {
            if (areaId) {
                if (area.id == areaId) {
                    obj = area;
                    return false;
                }
            }
            return true;
        });

        return obj;
    },

    removeArea: function() {

        let result = confirm("エリアを削除しても宜しいですか?");
        if (result)  {
            if (g_isDrawing) {
                DATA.cancel();
            } else {
                if (DATA.areaMonitorFlag == G_DETECT_AREA) {
                    DATA.aDetectAreas = DATA.aDetectAreas.filter(function(area) {
                        return area.id !== g_selectedAreaId;
                    });

                    let areaTitle = "";
                    if (DATA.areaCoordinationNo == G_AREA_A) {
                        areaTitle = "Aﾎﾟｼﾞｼｮﾝ";
                    } else if (DATA.areaCoordinationNo == G_AREA_B) {
                        areaTitle = "Bﾎﾟｼﾞｼｮﾝ";
                    } else if (DATA.areaCoordinationNo == G_AREA_C) {
                        areaTitle = "Cﾎﾟｼﾞｼｮﾝ";
                    } else if (DATA.areaCoordinationNo == G_AREA_D) {
                        areaTitle = "Dﾎﾟｼﾞｼｮﾝ";
                    }
                    $('#area-title-fixed-' + DATA.areaCoordinationNo).val("");
                    $('#btn-fixed-title-' + DATA.areaCoordinationNo).html(areaTitle);

                    $('#chk-crop-status-' + DATA.areaCoordinationNo).prop('disabled', true);
                    $('#chk-crop-status-' + DATA.areaCoordinationNo).prop('checked', false);

                } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
                    DATA.aExcludeAreas = DATA.aExcludeAreas.filter(function(area) {
                        return area.id !== g_selectedAreaId;
                    });
                }
                DATA.redraw();
            }
        }
    },

    /**
     * Line色を取得する。
     */
    getColor: function() {
        let _color = "#FF0000";

        if (DATA.areaMonitorFlag == G_DETECT_AREA) {
            switch (DATA.areaCoordinationNo) {
                case G_AREA_A:
                    _color = G_AREA_A_COLOR;
                    break;
                case G_AREA_B:
                    _color = G_AREA_B_COLOR;
                    break;
                case G_AREA_C:
                    _color = G_AREA_C_COLOR;
                    break;
                case G_AREA_D:
                    _color = G_AREA_D_COLOR;
                    break;
                default:
                    break;
            }

        } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
            _color = G_AREA_EXCLUDE_COLOR;
        }
        return _color;
    },

    /*
	 * オブジェクトのコピーを作成。
	 */
    clone: function(obj) {
        let copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = COMMON.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = COMMON.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    },

    /*
	 * UIDを作成する。
	 */
    generateUID: function () {
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);

        return firstPart + secondPart;
    }
}




 /* ---------------------------------------------------------------------------------------------------------------
 | Canvasの描くに関する処理
 | ----------------------------------------------------------------------------------------------------------------
 */
$(g_canvas).mousedown(function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!g_isDrawAllowed) {
        return false;
    }

    if(e.button == 0) {	// Left click
        g_isMousePressed = true;

        if (!g_isDrawing && !g_isSelectedPoint && !COMMON.isPointHover(e)) {
            let _isHoverArea = false;
            let _hoverAreaId = "";

            DATA.aHoverAreas.forEach((hoverArea, index, arr) => {
                if (hoverArea.status) {
                    _isHoverArea = true;
                    _hoverAreaId = hoverArea.id;
                }
            });

            if (_isHoverArea) {
                let hoverArea = COMMON.getArea(_hoverAreaId, null);
                console.log(hoverArea);
                if (DATA.cameraType == G_CAM_FIXED && hoverArea.coordination_no != DATA.areaCoordinationNo) {
                    playNG();
                    return false;
                }

                console.log("Select Area.");
                g_isSelectedArea = true;

                g_selectedAreaId = _hoverAreaId;

                DATA.aDetectAreas.forEach((area, index, arr) => {
                    area.isSelected = false;
                });
                DATA.aExcludeAreas.forEach((area, index, arr) => {
                    area.isSelected = false;
                });
                hoverArea.isSelected = true;

                g_dragStartX = e.offsetX;
                g_dragStartY = e.offsetY;

                return false;
            }
        }

        if (COMMON.isPointHover(e)) {
            let area = COMMON.getArea(g_hoverAreaId, g_hoverPointId);
            if (DATA.cameraType == G_CAM_FIXED
                    && area.coordination_no != DATA.areaCoordinationNo) {
                playNG();
                return false;
            }

            console.log("Select Point.");
            g_isSelectedPoint = true;

            g_selectedAreaId = g_hoverAreaId;
            g_selectedPointId = g_hoverPointId;

            if (!jQuery.isEmptyObject(area)) {
                area.isSelected = true;

                area.points.every(point => {
                    if (point.id == g_selectedPointId) {
                        point.isSelected = true;
                    } else {
                        point.isSelected = false;
                    }

                    return true;
                });

                DATA.redraw();
            }
        }


        if (DATA.cameraType == G_CAM_PTZ) {
            if (DATA.areaMonitorFlag == G_DETECT_AREA && DATA.aDetectAreas.length >= 1 && !g_isSelectedPoint) {
                console.log("A");
                playNG();
                return false;
            }
        } else if (DATA.cameraType == G_CAM_FIXED) {
            let isDrew = false;

            if (DATA.areaMonitorFlag == G_DETECT_AREA) {
                let selectedArea = COMMON.getArea(g_selectedAreaId, g_selectedPointId);

            }
            DATA.aDetectAreas.forEach((area, index, arr) => {
                if (area.coordination_no == DATA.areaCoordinationNo) {
                    isDrew = true;
                }
            });
            if (isDrew && !g_isSelectedPoint) {
                console.log("B");
                playNG();
                return false;
            }

            console.log("g_isSelectedPoint: ", g_isSelectedPoint);
            if (g_isSelectedPoint) {
                console.log("AAAAAA");
                let targetArea = COMMON.getArea(g_selectedAreaId, null);
                if (targetArea.coordination_no != DATA.areaCoordinationNo) {
                    playNG();
                    return false;
                }
            }

            if (DATA.areaMonitorFlag == G_DETECT_AREA && DATA.aDetectAreas.length >= 4 && !g_isSelectedPoint) {
                console.log("C");
                playNG();
                return false;
            }
        }

        if (DATA.areaMonitorFlag == G_EXCLUDE_AREA && DATA.aExcludeAreas.length >= 8) {
            console.log("E");
            ngAudioElement.play();
            return false;
        }


        if (!g_isSelectedPoint && !g_isSelectedArea) {
            console.log("Just click.");
            g_isFinishedPoint = false;

            g_selectedAreaId = "";
            g_selectedPointId = "";

            let clickPoint = {
                "id": "p" + Date.now() + COMMON.generateUID(),
                "x": e.offsetX,
                "y": e.offsetY
            };

            g_drawingPoint.x = e.offsetX;
            g_drawingPoint.y = e.offsetY;

            if (!g_isDrawing) {
                g_isDrawing = true;

                let coordinationNo = 0;
                if (DATA.cameraType == G_CAM_PTZ) {
                    coordinationNo = DATA.areaCoordinationNo;
                } else if (DATA.cameraType == G_CAM_FIXED) {
                    coordinationNo = DATA.areaMonitorFlag == G_DETECT_AREA ? DATA.areaCoordinationNo : 0;
                }

                let _polygon = {
                    "id": "a" + Date.now() + COMMON.generateUID(),
                    'title': '検知エリア',
                    'camera_id': DATA.activeCameraId,
                    'type': DATA.areaType,
                    'coordination_no': coordinationNo,
                    'monitor_flag': DATA.areaMonitorFlag,
                    'crop_flg': 0,
                    'points': [],
                    'isSelected': false,
                    'color': '#FF0000',
                    'fill_color': '#FFFFFF'
                }
                _polygon.points.push(clickPoint);
                g_drawing_point_no++;

                _polygon.color = COMMON.getColor();

                g_drawingPolygon = _polygon;

            } else {
                g_drawingPolygon.points.push(clickPoint);
                g_drawing_point_no++;
            }

            DATA.redraw();
            COMMON.draw(g_drawingPolygon);
        }

    } else if (e.button == 2) {	// Right click
        DATA.redraw();

        if (g_drawing_point_no >= 4) {
            COMMON.draw(g_drawingPolygon);

            let area = COMMON.clone(g_drawingPolygon);

            if (DATA.areaMonitorFlag == G_DETECT_AREA) {
                DATA.aDetectAreas.push(area);
                $('#chk-crop-status-' + area.coordination_no).prop('disabled', false);
            } else if (DATA.areaMonitorFlag == G_EXCLUDE_AREA) {
                DATA.aExcludeAreas.push(area);
            }

            playOK();
            DATA.isSaved = false;
        } else {
            DATA.aHoverAreas = DATA.aHoverAreas.filter(function(area) {
                return area.id !== g_drawingPolygon.id;
            });
            console.log("D");
            playNG();
        }

        DATA.cancel();
    }
});

$(g_canvas).mouseup(function(e) {
    g_isMousePressed = false;
    g_isSelectedPoint = false;
    g_isSelectedArea = false;
});

$(g_canvas).mousemove(function(e) {
    g_currentX = e.offsetX;
    g_currentY = e.offsetY;

    if (g_isDrawing) {
        DATA.redraw();
        COMMON.draw(g_drawingPolygon);

        g_ctx.strokeStyle = COMMON.getColor();
        g_ctx.lineWidth = 4;
        g_ctx.beginPath();

        g_ctx.moveTo(g_drawingPoint.x, g_drawingPoint.y);
        g_ctx.lineTo(e.offsetX, e.offsetY);
        g_ctx.stroke();

    } else {
        if (g_isMousePressed && g_isSelectedPoint) {
            console.log("ID: ", g_selectedAreaId, " - ", g_selectedPointId,": Dragging...");

            let dragPoint = COMMON.getPoint(g_selectedPointId);

            if (!jQuery.isEmptyObject(dragPoint)) {
                dragPoint.x = e.offsetX;
                dragPoint.y = e.offsetY;

                DATA.isSaved = false;
                DATA.redraw();
            }

        } else if (g_isMousePressed && g_isSelectedArea) {
            let dx = e.offsetX - g_dragStartX;
            let dy = e.offsetY - g_dragStartY;

            let currentArea = COMMON.getArea(g_selectedAreaId, null);

            if (!jQuery.isEmptyObject(currentArea)) {
                currentArea.points.every(point => {
                    point.x += dx;
                    point.y += dy;

                    return true;
                });

                DATA.isSaved = false;
                DATA.redraw();

                g_dragStartX = e.offsetX;
                g_dragStartY = e.offsetY;
            }


        } else {
            if (g_isShowCanvas && g_isDrawAllowed) {
                DATA.aHoverAreas.forEach((hoverArea, index, arr) => {
                    if (hoverArea.status) {
                        //console.log(DATA.aHoverAreas);
                        //console.log(hoverArea);
                    }
                });

                console.log("Just moving...");
                DATA.redraw();
            }
        }
    }
});

$(g_canvas).off('dblclick');

$(g_canvas).contextmenu(function(e) {
    e.preventDefault();
    e.stopPropagation();
});










