// ============================================================
// 6. ORE GENERATION
// ============================================================

function getVein(x, y) {

    // ========================================================
    // 6A. STARTING IRON
    // ========================================================

    let dx = x + 8;
    let dy = y;

    let distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance <= 4) {

        let richness =
            1 - distance / 4;

        let amount =
            Math.ceil(
                (
                    300 +
                    richness * 900
                ) / 100
            ) * 100;

        return {
            type: "ore",
            ore: "iron",
            amount: amount
        };
    }


    // ========================================================
    // 6B. STARTING COPPER
    // ========================================================

    dx = x - 8;
    dy = y;

    distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance <= 4) {

        let richness =
            1 - distance / 4;

        let amount =
            Math.ceil(
                (
                    300 +
                    richness * 900
                ) / 100
            ) * 100;

        return {
            type: "ore",
            ore: "copper",
            amount: amount
        };
    }


    // ========================================================
    // 6C. STARTING COAL
    // ========================================================

    dx = x;
    dy = y - 8;

    distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance <= 4) {

        let richness =
            1 - distance / 4;

        let amount =
            Math.ceil(
                (
                    300 +
                    richness * 900
                ) / 100
            ) * 100;

        return {
            type: "ore",
            ore: "coal",
            amount: amount
        };
    }


    // ========================================================
    // 6D. NORMAL DEPOSITS
    // ========================================================

    let spacing = 35;

    let regionX =
        Math.floor(
            x / spacing
        );

    let regionY =
        Math.floor(
            y / spacing
        );

    let bestDistance =
        Infinity;

    let bestRegionX = 0;
    let bestRegionY = 0;

    let bestDepositX = 0;
    let bestDepositY = 0;


    for (
        let ry = regionY - 1;
        ry <= regionY + 1;
        ry++
    ) {

        for (
            let rx = regionX - 1;
            rx <= regionX + 1;
            rx++
        ) {

            // 30% chance for a deposit

            if (
                random(rx, ry, 20) > 0.30
            ) {

                continue;
            }


            let depositX =
                rx * spacing +
                random(
                    rx,
                    ry,
                    10
                ) * spacing;

            let depositY =
                ry * spacing +
                random(
                    rx,
                    ry,
                    11
                ) * spacing;


            let diffX =
                x - depositX;

            let diffY =
                y - depositY;

            let depositDistance =
                Math.sqrt(
                    diffX * diffX +
                    diffY * diffY
                );


            if (
                depositDistance <
                bestDistance
            ) {

                bestDistance =
                    depositDistance;

                bestRegionX =
                    rx;

                bestRegionY =
                    ry;

                bestDepositX =
                    depositX;

                bestDepositY =
                    depositY;
            }
        }
    }


    // No nearby deposit

    if (
        bestDistance === Infinity
    ) {

        return {
            type: "empty"
        };
    }


    // ========================================================
    // 6E. DISTANCE SCALING
    // ========================================================

    let distanceFromStart =
        Math.sqrt(
            x * x +
            y * y
        );

    let distanceMultiplier =
        Math.pow(
            1.1,
            distanceFromStart / 1000
        );


    // ========================================================
    // 6F. DEPOSIT SIZE
    // ========================================================

    let baseRadius =
        4 +
        random(
            bestRegionX,
            bestRegionY,
            51
        ) * 10;

    let radius =
        baseRadius *
        distanceMultiplier;


    // Slightly irregular edge

    let edge =
        random(
            x,
            y,
            60
        ) * 2 - 1;

    let finalRadius =
        radius +
        edge;


    if (
        bestDistance >
        finalRadius
    ) {

        return {
            type: "empty"
        };
    }


    // ========================================================
    // 6G. ORE TYPE
    // ========================================================

    let oreRoll =
        random(
            bestRegionX,
            bestRegionY,
            30
        );

    let oreType;


    if (
        oreRoll < 0.20
    ) {

        oreType = "iron";

    } else if (
        oreRoll < 0.50
    ) {

        oreType = "copper";

    } else {

        oreType = "coal";
    }


    // ========================================================
    // 6H. ORE RICHNESS
    // ========================================================

    let richness =
        1 -
        Math.min(
            bestDistance / radius,
            1
        );


    let baseAmount =
        100 +
        richness * 900 +
        random(
            x,
            y,
            70
        ) * 200;


    // ========================================================
    // 6I. FINAL AMOUNT
    // ========================================================

    let amount =
        Math.ceil(
            (
                baseAmount *
                distanceMultiplier
            ) / 100
        ) * 100;


    // ========================================================
    // 6J. RETURN
    // ========================================================

    return {

        type: "ore",

        ore: oreType,

        amount: amount,

        depositX:
            bestDepositX,

        depositY:
            bestDepositY
    };
}
