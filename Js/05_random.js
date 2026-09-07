// ============================================================
// 5. RANDOM NUMBER
// ============================================================

function random(x, y, extra = 0) {

    let value =
        Math.sin(
            x * 12.9898 +
            y * 78.233 +
            extra * 37.719
        ) *
        43758.5453;


    return value -
        Math.floor(value);
}
