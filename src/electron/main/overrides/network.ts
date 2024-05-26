import { session } from "electron";

session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, callback) => {
    if (responseHeaders) {
        Object.keys(responseHeaders)
            .filter(k => (/^content-security-policy/i).test(k))
            .map(k => (delete responseHeaders[k]));
    }
    callback({ responseHeaders });
});

session.defaultSession.webRequest.onBeforeRequest(({ url }, callback) => {
    const pattern = /api\/v\d\/(science|metrics)/;
    const michealDontLeaveMeHere = pattern.test(url);

    callback({ cancel: michealDontLeaveMeHere });
});