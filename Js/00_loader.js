// ============================================================
// 0. THE WALL LOADER
// ============================================================


// ============================================================
// 0A. FILE LIST
// ============================================================

const files = [

    "01_canvas.js",
    "02_player.js",
    "03_camera.js",
    "04_world.js",
    "05_random.js",
    "06_ore_generation.js",
    "07_chunks.js",
    "08_tiles.js",
    "09_world_render.js",
    "10_ore_render.js",
    "11_player_render.js",
    "12_input.js",
    "14_wall.js",
    "15_Turrets.js",
    "17_stats.js",
    "16_building_ui.js",
    "13_game_loop.js"

];


// ============================================================
// 0B. LOADING SCREEN
// ============================================================

const loadingScreen =
    document.createElement("div");

loadingScreen.id =
    "loadingScreen";

loadingScreen.style.position =
    "fixed";

loadingScreen.style.left =
    "0";

loadingScreen.style.top =
    "0";

loadingScreen.style.width =
    "100%";

loadingScreen.style.height =
    "100%";

loadingScreen.style.background =
    "#111";

loadingScreen.style.color =
    "white";

loadingScreen.style.fontFamily =
    "monospace";

loadingScreen.style.display =
    "flex";

loadingScreen.style.flexDirection =
    "column";

loadingScreen.style.alignItems =
    "center";

loadingScreen.style.justifyContent =
    "center";

loadingScreen.style.zIndex =
    "999999";

loadingScreen.style.padding =
    "20px";

loadingScreen.style.boxSizing =
    "border-box";

document.body.appendChild(
    loadingScreen
);


// ============================================================
// 0C. TITLE
// ============================================================

const title =
    document.createElement("div");

title.textContent =
    "THE WALL";

title.style.fontSize =
    "32px";

title.style.marginBottom =
    "25px";

loadingScreen.appendChild(
    title
);


// ============================================================
// 0D. PROGRESS BAR
// ============================================================

const progressOuter =
    document.createElement("div");

progressOuter.style.width =
    "min(500px, 90vw)";

progressOuter.style.height =
    "20px";

progressOuter.style.border =
    "2px solid white";

progressOuter.style.boxSizing =
    "border-box";

loadingScreen.appendChild(
    progressOuter
);


const progressInner =
    document.createElement("div");

progressInner.style.width =
    "0%";

progressInner.style.height =
    "100%";

progressInner.style.background =
    "white";

progressOuter.appendChild(
    progressInner
);


// ============================================================
// 0E. STATUS
// ============================================================

const status =
    document.createElement("div");

status.textContent =
    "Loading...";

status.style.marginTop =
    "15px";

loadingScreen.appendChild(
    status
);


// ============================================================
// 0F. FILE LIST
// ============================================================

const fileList =
    document.createElement("div");

fileList.style.width =
    "min(500px, 90vw)";

fileList.style.marginTop =
    "25px";

fileList.style.fontSize =
    "14px";

loadingScreen.appendChild(
    fileList
);


// ============================================================
// 0G. FILE ROWS
// ============================================================

const fileRows = {};

for (
    let i = 0;
    i < files.length;
    i++
) {

    const row =
        document.createElement("div");

    row.style.height =
        "20px";

    row.textContent =
        "○  " +
        files[i];

    fileList.appendChild(
        row
    );

    fileRows[files[i]] =
        row;
}


// ============================================================
// 0H. UPDATE FILE
// ============================================================

function setFileStatus(
    file,
    symbol,
    message
) {

    const row =
        fileRows[file];

    if (!row) {
        return;
    }

    row.textContent =
        symbol +
        "  " +
        file;

    if (message) {

        row.textContent +=
            "  ← " +
            message;
    }
}


// ============================================================
// 0I. UPDATE PROGRESS
// ============================================================

function updateProgress(
    completed
) {

    let percent =
        (
            completed /
            files.length
        ) * 100;

    progressInner.style.width =
        percent + "%";

    status.textContent =
        "Loading " +
        completed +
        " / " +
        files.length;
}


// ============================================================
// 0J. ERROR BOX
// ============================================================

const errorBox =
    document.createElement("pre");

errorBox.style.width =
    "min(700px, 95vw)";

errorBox.style.maxHeight =
    "200px";

errorBox.style.overflow =
    "auto";

errorBox.style.marginTop =
    "20px";

errorBox.style.padding =
    "10px";

errorBox.style.boxSizing =
    "border-box";

errorBox.style.background =
    "#200";

errorBox.style.color =
    "#ff8080";

errorBox.style.display =
    "none";

errorBox.style.whiteSpace =
    "pre-wrap";

loadingScreen.appendChild(
    errorBox
);


// ============================================================
// 0K. SHOW ERROR
// ============================================================

function showError(
    file,
    message
) {

    console.error(
        "THE WALL ERROR:",
        file,
        message
    );

    setFileStatus(
        file,
        "X",
        "BUG"
    );

    errorBox.style.display =
        "block";

    errorBox.textContent +=
        "\n[" +
        file +
        "]\n" +
        message +
        "\n";

    status.textContent =
        "ERRORS FOUND";
}


// ============================================================
// 0L. CURRENT FILE
// ============================================================

let currentFile =
    null;


// ============================================================
// 0M. GLOBAL ERROR DETECTOR
// ============================================================

window.addEventListener(
    "error",
    function(event) {

        if (!currentFile) {
            return;
        }

        let message =
            event.message ||
            "Unknown JavaScript error";

        showError(
            currentFile,
            message +
            "\nLine: " +
            event.lineno +
            "\nColumn: " +
            event.colno
        );
    }
);


// ============================================================
// 0N. PROMISE ERROR DETECTOR
// ============================================================

window.addEventListener(
    "unhandledrejection",
    function(event) {

        if (!currentFile) {
            return;
        }

        showError(
            currentFile,
            "Unhandled promise error:\n" +
            event.reason
        );
    }
);


// ============================================================
// 0O. COMPATIBILITY FUNCTION
// ============================================================

window.fileLoaded =
    function(file) {

        console.log(
            "File reports loaded:",
            file
        );
    };


// ============================================================
// 0P. LOAD FILE
// ============================================================

function loadFile(
    index
) {

    if (
        index >= files.length
    ) {

        finishLoading();

        return;
    }


    let file =
        files[index];

    currentFile =
        file;


    setFileStatus(
        file,
        "○"
    );


    console.log(
        "Loading:",
        file
    );


    const script =
        document.createElement(
            "script"
        );


    // --------------------------------------------------------
    // CACHE BUSTING
    // --------------------------------------------------------

    script.src =
        "Js/" +
        file +
        "?v=" +
        Date.now();


    script.async =
        false;


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    script.onload =
        function() {

            setFileStatus(
                file,
                "O"
            );

            updateProgress(
                index + 1
            );

            console.log(
                "Loaded:",
                file
            );

            currentFile =
                null;

            loadFile(
                index + 1
            );
        };


    // --------------------------------------------------------
    // FAILURE
    // --------------------------------------------------------

    script.onerror =
        function() {

            showError(
                file,
                "The browser could not load this file.\n" +
                "Requested: Js/" +
                file
            );

            updateProgress(
                index + 1
            );

            currentFile =
                null;

            loadFile(
                index + 1
            );
        };


    document.body.appendChild(
        script
    );
}


// ============================================================
// 0Q. FINISH LOADING
// ============================================================

function finishLoading() {

    progressInner.style.width =
        "100%";


    if (
        errorBox.style.display ==
        "none"
    ) {

        status.textContent =
            "Loading complete!";


        setTimeout(
            function() {

                loadingScreen.remove();

            },
            400
        );

    } else {

        status.textContent =
            "Game has errors — see above.";
    }
}


// ============================================================
// 0R. START
// ============================================================

console.log(
    "THE WALL LOADER STARTING"
);

loadFile(0);
