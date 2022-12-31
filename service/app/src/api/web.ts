interface FileResult {
    id: string,
    tokenId: string,
    hash: string,
    name: string,
    mime: string,
    expire: string,
    uploadIp: string,
    uploadTime: string,
};

const VerifyToken = async (token: string): Promise<boolean> => {
    // create request data
    let form = new FormData();
    form.append("token", token);

    const options: RequestInit = {
        method: "POST",
        body: form,
    };

    return fetch("/api/token", options).then((response) => {
        return response.status == 200
    });
};

// TODO: add callback arg for progress?
const UploadFile = async (token: string, expire: string, fileName: string, fileData: ArrayBuffer): Promise<FileResult | null> => {
    let fileBlob = new Blob([new Uint8Array(fileData, 0, fileData.byteLength)]);

    // create request data
    let form = new FormData();
    form.append("token", token);
    form.append("expire", expire);
    form.append("file", fileBlob, fileName);

    const options: RequestInit = {
        method: "POST",
        body: form,
    };

    return fetch("/api/upload", options).then(async (response) => {
        // service rejected the request (TODO: maybe return error result?)
        if (response.status != 200) {
            console.error('Failed to upload' + fileName + '!', 'Result from service: ' + await response.text())
            return null
        }

        return JSON.parse(await response.json()) as FileResult
    });
}

export { VerifyToken, UploadFile }