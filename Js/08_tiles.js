// ============================================================
// 8. GET TILE
// ============================================================

function getTile(x, y) {

    let chunkX =
        Math.floor(
            x / window.chunkSize
        );

    let chunkY =
        Math.floor(
            y / window.chunkSize
        );

    let localX =
        x -
        chunkX * window.chunkSize;

    let localY =
        y -
        chunkY * window.chunkSize;

    let chunk =
        window.generateChunk(
            chunkX,
            chunkY
        );

    return chunk[localY][localX];
}
