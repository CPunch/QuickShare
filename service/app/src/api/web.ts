import axios from "axios";

export interface FileResult {
    id: string,
    hash: string,
    size: number,
    name: string,
    mime: string,
    expire: Date | null,
    uploadTime: Date,
};

// TODO: move these parameters into a props interface ?
const UploadFile = async (token: string, expire: string, fileName: string, fileData: File, abort: AbortController, progressCallback: (progress: number) => void): Promise<FileResult | null> => {
    // create request data
    let form = new FormData();
    form.append("token", token);
    form.append("expire", expire);
    form.append("file", fileData, fileName);

    return axios.request({
        method: "POST",
        url: "/api/upload",
        data: form,
        signal: abort.signal,
        onUploadProgress: (p) => {
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

        console.log(response.data)
        return response.data as FileResult
    })
}

const DeleteFile = async (token: string, id: string): Promise<boolean> => {
    // create request data
    let form = new FormData();
    form.append("token", token);
    form.append("id", id);

    return axios.request({
        method: "POST",
        url: "/api/delete",
        data: form,
    }).then(response => {
        return response.status == 200
    });
}

const VerifyToken = async (token: string): Promise<boolean> => {
    // create request data
    let form = new FormData();
    form.append("token", token);

    const options: RequestInit = {
        method: "POST",
        body: form,
    };

    // TODO: maybe switch this to axios to be more cohesive ?
    return fetch("/api/token", options).then((response) => {
        return response.status == 200
    });
};

const GetFiles = async (token: string): Promise<FileResult[]> => {
    // create request data
    let form = new FormData();
    form.append("token", token);

    return axios.request({
        method: "POST",
        url: "/api/filelist",
        data: form,
    }).then(response => {
        return response.data as FileResult[]
    });
}

export { VerifyToken, GetFiles, UploadFile }