/**
 * Game configuration for gate challenges in HTTYD experience.
 * Games at areas 2 and 4.
 */
export const gameData = [
    {
        area: 2,
        gameType: "dino",
        label: "The Cove Challenge",
        preMessage: "A wild dragon blocks the path! Jump over obstacles to prove your worth as a dragon rider! ",
        postWinMessage: "You've earned the trust of the dragons! Onward to the Training Arena! ",
        postLoseMessage: "Even Hiccup fell off Toothless the first time. Try again, Viking! ",
        targetScore: 10,
    },
    {
        area: 4,
        gameType: "dart",
        label: "Cloud Kingdom Challenge",
        preMessage: " Target practice in the clouds! Hit the bullseyes to navigate through the sky kingdom! No pressure... ",
        postWinMessage: "Bullseye Master! You'd make Stoick proud. The volcanic islands await! ",
        postLoseMessage: "Your aim is worse than a Terrible Terror's fire breath. Try again! ",
        targetScore: 100,
    },
];
