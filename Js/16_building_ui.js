/* =========================================
   16 - BUILDING UI
========================================= */


/* =========================================
   BUILD MODE
========================================= */

window.buildMode = false;

window.selectedBuilding = null;


/* =========================================
   GET UI ELEMENTS
========================================= */

let buildingPanel =
    document.getElementById(
        "buildingPanel"
    );

let menuPanel =
    document.getElementById(
        "menuPanel"
    );

let statsPanel =
    document.getElementById(
        "statsPanel"
    );

let placementInfo =
    document.getElementById(
        "placementInfo"
    );


/* =========================================
   CLOSE ALL PANELS
========================================= */

function closeAllPanels() {

    if (buildingPanel) {
        buildingPanel.classList.remove("open");
    }

    if (menuPanel) {
        menuPanel.classList.remove("open");
    }

    if (statsPanel) {
        statsPanel.classList.remove("open");
    }
}


/* =========================================
   BUILD BUTTON
========================================= */

let buildButton =
    document.getElementById(
        "buildButton"
    );


if (buildButton) {

    buildButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            /*
                If already open, close it.
            */

            if (
                buildingPanel &&
                buildingPanel.classList.contains("open")
            ) {

                buildingPanel.classList.remove(
                    "open"
                );

                return;
            }


            /*
                Opening building menu closes
                the other menus.
            */

            if (menuPanel) {
                menuPanel.classList.remove(
                    "open"
                );
            }

            if (statsPanel) {
                statsPanel.classList.remove(
                    "open"
                );
            }


            if (buildingPanel) {
                buildingPanel.classList.add(
                    "open"
                );
            }
        }
    );
}


/* =========================================
   MENU BUTTON
========================================= */

let menuButton =
    document.getElementById(
        "menuButton"
    );


if (menuButton) {

    menuButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            cancelBuildMode();


            if (
                menuPanel &&
                menuPanel.classList.contains("open")
            ) {

                menuPanel.classList.remove(
                    "open"
                );

                return;
            }


            closeAllPanels();


            if (menuPanel) {
                menuPanel.classList.add(
                    "open"
                );
            }
        }
    );
}


/* =========================================
   STATS BUTTON
========================================= */

let statsButton =
    document.getElementById(
        "statsButton"
    );


if (statsButton) {

    statsButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            cancelBuildMode();


            if (
                statsPanel &&
                statsPanel.classList.contains("open")
            ) {

                statsPanel.classList.remove(
                    "open"
                );

                return;
            }


            closeAllPanels();


            if (statsPanel) {
                statsPanel.classList.add(
                    "open"
                );
            }
        }
    );
}


/* =========================================
   BUILDING BUTTONS
========================================= */

let buildingButtons =
    document.querySelectorAll(
        ".buildingButton"
    );


buildingButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                let buildingType =
                    button.dataset.building;


                /*
                    Currently only the turret
                    exists.
                */

                if (
                    buildingType === "turret"
                ) {

                    startBuildMode(
                        "turret"
                    );
                }
            }
        );
    }
);


/* =========================================
   START BUILD MODE
========================================= */

function startBuildMode(type) {

    window.buildMode = true;

    window.selectedBuilding =
        type;


    /*
        Close the building menu so
        it doesn't sit over the world
        while placing.
    */

    if (buildingPanel) {

        buildingPanel.classList.remove(
            "open"
        );
    }


    /*
        Close other menus too.
    */

    if (menuPanel) {
        menuPanel.classList.remove(
            "open"
        );
    }

    if (statsPanel) {
        statsPanel.classList.remove(
            "open"
        );
    }


    /*
        Show placement message.
    */

    if (placementInfo) {

        placementInfo.textContent =
            "Tap a tile to place turret";

        placementInfo.classList.add(
            "active"
        );
    }
}


/* =========================================
   CANCEL BUILD MODE
========================================= */

function cancelBuildMode() {

    window.buildMode = false;

    window.selectedBuilding =
        null;


    if (placementInfo) {

        placementInfo.classList.remove(
            "active"
        );
    }
}


/* =========================================
   CANVAS PLACEMENT
========================================= */

canvas.addEventListener(
    "pointerdown",
    function(event) {

        /*
            If we're not building,
            do absolutely nothing here.

            12_input.js owns the camera.
        */

        if (!window.buildMode) {
            return;
        }


        /*
            Prevent this pointer from
            becoming a camera movement.
        */

        event.preventDefault();

        event.stopPropagation();


        /*
            Get the position of the tap
            relative to the canvas.
        */

        let rect =
            canvas.getBoundingClientRect();


        let screenX =
            event.clientX -
            rect.left;


        let screenY =
            event.clientY -
            rect.top;


        /*
            Convert screen coordinates
            into world coordinates.

            camera.x/y are measured in pixels.
        */

        let worldPixelX =
            camera.x +
            (
                screenX -
                canvas.width / 2
            ) / camera.zoom;


        let worldPixelY =
            camera.y +
            (
                screenY -
                canvas.height / 2
            ) / camera.zoom;


        /*
            Convert pixels to world tiles.
        */

        let tileX =
            Math.floor(
                worldPixelX /
                tileSize
            );


        let tileY =
            Math.floor(
                worldPixelY /
                tileSize
            );


        /*
            Place the selected building.
        */

        if (
            window.selectedBuilding ===
            "turret"
        ) {

            /*
                Don't allow buildings to
                overlap the Core.
            */

            if (
                tileX >=
                    core.x -
                    Math.floor(
                        core.width / 2
                    ) &&

                tileX <
                    core.x +
                    Math.ceil(
                        core.width / 2
                    ) &&

                tileY >=
                    core.y -
                    Math.floor(
                        core.height / 2
                    ) &&

                tileY <
                    core.y +
                    Math.ceil(
                        core.height / 2
                    )
            ) {

                if (placementInfo) {

                    placementInfo.textContent =
                        "Cannot build on Core";
                }

                return;
            }


            /*
                Don't allow two buildings
                on the same tile.
            */

            if (
                isBuildingAt(
                    tileX,
                    tileY
                )
            ) {

                if (placementInfo) {

                    placementInfo.textContent =
                        "Tile already occupied";
                }

                return;
            }


            /*
                Actually build it.
            */

            buildTurret(
                tileX,
                tileY
            );


            /*
                Building successfully placed.
            */

            cancelBuildMode();
        }
    },
    true
);


/* =========================================
   CHECK BUILDING LOCATION
========================================= */

function isBuildingAt(x, y) {

    for (
        let building of buildings
    ) {

        if (
            building.x === x &&
            building.y === y
        ) {

            return true;
        }
    }


    return false;
}


/* =========================================
   UPDATE STATS UI
========================================= */

window.updateStatsUI = function() {

    let shotsElement =
        document.getElementById(
            "shotsFired"
        );


    let destroyedElement =
        document.getElementById(
            "wallDestroyed"
        );


    let turretElement =
        document.getElementById(
            "turretCount"
        );


    if (shotsElement) {

        shotsElement.textContent =
            stats.shotsFired;
    }


    if (destroyedElement) {

        destroyedElement.textContent =
            stats.wallDestroyed;
    }


    if (turretElement) {

        turretElement.textContent =
            window.turretCount || 0;
    }
};


/* =========================================
   FILE LOADED
========================================= */

if (typeof window.fileLoaded == "function") {
    window.fileLoaded("16_building_ui.js");
}
