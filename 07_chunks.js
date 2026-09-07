// ============================================================
// 7. CHUNK GENERATION
// ============================================================

function generateChunk(chunkX, chunkY) {

    let key =
        chunkX + "," + chunkY;

    if (window.chunks.has(key)) {
        return window.chunks.get(key);
    }

    let chunk = [];

    for (
        let y = 0;
        y < window.chunkSize;
        y++
    ) {

        let row = [];

        for (
            let x = 0;
            x < window.chunkSize;
            x++
        ) {

            let worldX =
                chunkX * window.chunkSize + x;

            let worldY =
                chunkY * window.chunkSize + y;

            row.push(
                getVein(worldX, worldY)
            );
        }

        chunk.push(row);
    }

    window.chunks.set(
        key,
        chunk
    );

    return chunk;
}


// Make it available to the other files.

window.generateChunk =
    generateChunk;