export class Photo {
    constructor(id, album, originalName, url) {
        this.id = id;
        this.album = album;
        this.originalName = originalName;
        this.url = url;
        this.lastChange = "original";
        this.history = [
            {
                status: "original",
                lastModifiedDate: id
            }
        ];
        this.tags = [];
    }

    updateHistory(status) {
        this.lastChange = status;
        this.history.push({
            status: status,
            lastModifiedDate: Date.now()
        });
    }
}

export const popularTags = [
    "#love",
    "#instagood",
    "#fashion",
    "#instagram",
    "#photooftheday",
    "#art",
    "#photography",
    "#beautiful",
    "#nature",
    "#picoftheday",
    "#travel",
    "#happy",
    "#cute",
    "#instadaily",
    "#style",
    "#tbt",
    "#repost",
    "#followme",
    "#summer",
    "#reels",
    "#like4like",
    "#beauty",
    "#fitness",
    "#food",
    "#instalike"
];
