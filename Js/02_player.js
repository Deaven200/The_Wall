// ============================================================
// 2. CORE
// ============================================================


// ============================================================
// 2A. CORE DATA
// ============================================================

window.core = {

    // World position of the center
    x: 0,
    y: 0,

    // Core occupies 3 × 3 tiles
    width: 3,
    height: 3,

    // Health for future enemies/damage systems
    maxHealth: 100,
    health: 100,

    destroyed: false
};


// ============================================================
// 2B. DESTROY CORE
// ============================================================

window.destroyCore = function() {

    if (
        window.core.destroyed
    ) {
        return;
    }

    window.core.destroyed =
        true;

    window.gameOver =
        true;

    console.log(
        "CORE DESTROYED"
    );
};


// ============================================================
// 2C. FILE LOADED
// ============================================================

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "02_player.js"
    );
}
