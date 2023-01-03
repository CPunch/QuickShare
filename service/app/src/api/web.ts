import axios from "axios";

export interface FileResult {
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

// TODO: move these parameters into a props interface?
const UploadFile = async (token: string, expire: string, fileName: string, fileData: File, progressCallback: (progress: number) => void): Promise<FileResult | null> => {
    // create request data
    let form = new FormData();
    form.append("token", token);
    form.append("expire", expire);
    form.append("file", fileData, fileName);

    return axios.request({
        method: "POST",
        url: "/api/upload",
        data: form,
        onUploadProgress: (p) => {
            console.log(p);
            if (p.total === undefined) {
                return
            }

            progressCallback(Math.round((p.loaded * 100) / p.total))
        }
    }).then(response => {
        if (response.status != 200) {
            console.error('Failed to upload' + fileName + '!', 'Result from service: ' + response.data)
            return null
        }

        return response.data as FileResult
    })
}

export { VerifyToken, UploadFile }