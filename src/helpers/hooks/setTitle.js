export function useTitle(title) {
    if (typeof title !== "string") {
        throw new Error("Title should be an string");
     }
     document.title = title;
}