// ==================================================
// 18_info_ui.js
// ==================================================


// ==================================================
// 18A. INFO UI DATA
// ==================================================

window.infoPanel =
    document.getElementById(
        "infoPanel"
    );

window.infoTitle =
    document.getElementById(
        "infoTitle"
    );

window.infoContent =
    document.getElementById(
        "infoContent"
    );

window.infoClose =
    document.getElementById(
        "infoClose"
    );


// ==================================================
// 18B. OPEN INFO PANEL
// ==================================================

window.openInfoPanel = function() {

    window.infoPanel.classList.add(
        "open"
    );
};


// ==================================================
// 18C. CLOSE INFO PANEL
// ==================================================

window.closeInfoPanel = function() {

    window.infoPanel.classList.remove(
        "open"
    );
};

window.infoClose.addEventListener(
    "click",
    function() {

        window.closeInfoPanel();

    }
);


// ==================================================
// 18D. SHOW TILE INFO
// ==================================================

window.showTileInfo = function(
    tileX,
    tileY
) {

    let tile =
        window.getTile(
            tileX,
            tileY
        );

    if (!tile) {

        window.closeInfoPanel();

        return;
    }

    // ------------------------------------------
    // ORE
    // ------------------------------------------

    if (
        tile.type === "ore"
    ) {

        window.infoTitle.textContent =
            tile.ore.toUpperCase() +
            " ORE";

        window.infoContent.innerHTML =
            "Amount: " +
            tile.amount;

        window.openInfoPanel();

        return;
    }

    // ------------------------------------------
    // EMPTY TILE
    // ------------------------------------------

    window.closeInfoPanel();
};


// ==================================================
// 18E. SHOW INVENTORY
// ==================================================

window.showInventory = function(
    title,
    inventory,
    capacity
) {

    window.infoTitle.textContent =
        title;

    let html = "";

    let total =
        0;

    let keys =
        Object.keys(
            inventory
        );

    // ------------------------------------------
    // INVENTORY ITEMS
    // ------------------------------------------

    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        let item =
            keys[i];

        let amount =
            inventory[item];

        total +=
            amount;

        html +=
            "<div>" +
            item.charAt(0).toUpperCase() +
            item.slice(1) +
            ": " +
            amount +
            "</div>";
    }

    // ------------------------------------------
    // EMPTY INVENTORY
    // ------------------------------------------

    if (
        keys.length === 0
    ) {

        html =
            "<div>Empty</div>";
    }

    // ------------------------------------------
    // CAPACITY
    // ------------------------------------------

    if (
        capacity !== undefined
    ) {

        html +=
            "<div style='margin-top:10px; border-top:1px solid black; padding-top:8px;'>" +
            "Capacity: " +
            total +
            "/" +
            capacity +
            "</div>";
    }

    window.infoContent.innerHTML =
        html;

    window.openInfoPanel();
};


// ==================================================
// 18F. SHOW CORE INVENTORY
// ==================================================

window.showCoreInventory = function() {

    window.showInventory(
        "CORE",
        window.core.inventory
    );
};


// ==================================================
// 18G. TAP DETECTION
// ==================================================

canvas.addEventListener(
    "pointerdown",
    function(event) {

        // Building mode gets priority.
        if (
            window.buildMode
        ) {
            return;
        }

        let rect =
            canvas.getBoundingClientRect();

        let screenX =
            event.clientX -
            rect.left;

        let screenY =
            event.clientY -
            rect.top;

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

        // ------------------------------------------
        // CORE
        // ------------------------------------------

        if (
            tileX >= 0 &&
            tileX < 3 &&
            tileY >= 0 &&
            tileY < 3
        ) {

            window.showCoreInventory();

            return;
        }

        // ------------------------------------------
        // TILE
        // ------------------------------------------

        window.showTileInfo(
            tileX,
            tileY
        );
    },
    true
);


// ==================================================
// 18H. FILE LOADED
// ==================================================

if (
    typeof window.fileLoaded ===
    "function"
) {

    window.fileLoaded(
        "18_info_ui.js"
    );
          }
