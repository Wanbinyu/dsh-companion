export const DIALOGUE_GROUPS = ['working', 'success', 'idle'];
export const MAX_DIALOGUE_LINES = 12;
export const MAX_DIALOGUE_LINE_LENGTH = 80;
export function normalizeDialogueLines(value) {
    if (!Array.isArray(value))
        return null;
    const lines = value
        .filter((line) => typeof line === 'string')
        .map(line => line.trim().slice(0, MAX_DIALOGUE_LINE_LENGTH))
        .filter(line => line.length > 0)
        .slice(0, MAX_DIALOGUE_LINES);
    return lines.length === 0 ? null : lines;
}
export function parseDialogueText(value) {
    return normalizeDialogueLines(value.split(/\r?\n/));
}
export function sameDialogueLines(left, right) {
    return left !== null
        && left.length === right.length
        && left.every((line, index) => line === right[index]);
}
export function pickDialogueLine(lines, seed) {
    if (lines.length === 0)
        return undefined;
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) | 0;
    }
    return lines[(hash >>> 0) % lines.length];
}
export function dialogueGroupForActivity(activity) {
    if (activity === 'idle')
        return 'idle';
    if (activity === 'success')
        return 'success';
    if (activity === 'thinking' || activity === 'tool')
        return 'working';
    return undefined;
}
