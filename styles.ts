export function registerStyles(styles: string | string[]) {
    if (!styles)
        return;

    let style;
    if (typeof styles === "string") {
        style = styles;
    } else {
        if (style.length === 0)
            return;
        style = styles.join(",");
    }
    const sheet = document.createElement("style");
    sheet.innerHTML = style;
    document.body.appendChild(sheet);
}