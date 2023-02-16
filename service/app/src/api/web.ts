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

export interface ApiResponse<T> {
    data: T | null,
    error: string | null,
}

// TODO: move these parameters into a props interface ?
const UploadFile = async (token: string, expire: string, fileName: string, fileData: File, abort: AbortController, progressCallback: (progress: number) => void): Promise<ApiResponse<FileResult>> => {
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
        },
        validateStatus: status => {
            return status >= 200 && status != 404;
        },
    }).then(response => {
        if (response.status != 200) {
            console.error('Failed to upload ' + fileName + '!', 'Result from service: ' + response.data)
            return {data: null, error: response.data}
        }

        return {data: response.data, error: null}
    }).catch(reason => {
        console.error(reason)
        return {data: null, error: reason}
    });
}

const DeleteFile = async (token: string, id: string): Promise<ApiResponse<boolean>> => {
    // create request data
    let form = new FormData();
    form.append("token", token);
    form.append("id", id);

    return axios.request({
        method: "POST",
        url: "/api/delete",
        data: form,
        validateStatus: status => {
            return status >= 200 && status != 404;
        },
    }).then(response => {
        if (response.status != 200) {
            console.error('Failed to delete ' + id + '!', 'Result from service: ' + response.data)
            return {data: null, error: response.data}
        }

        return {data: true, error: null};
    }).catch(reason => {
        console.error(reason);
        return {data: null, error: reason};
    });
}

const VerifyToken = async (token: string): Promise<ApiResponse<boolean>> => {
    // create request data
    let form = new FormData();
    form.append("token", token);

    return axios.request({
        method: "POST",
        url: "/api/token",
        data: form,
        validateStatus: status => {
            return status >= 200 && status != 404;
        },
    }).then(response => {
        if (response.status == 200) {
            return {data: true, error: null};
        }

        return {data: false, error: response.data}
    }).catch(reason => {
        console.error(reason);
        return {data: null, error: reason};
    });
};

const GetFiles = async (token: string): Promise<ApiResponse<FileResult[]>> => {
    return axios.request({
        method: "GET",
        url: `/api/filelist?token=${token}`,
        validateStatus: status => {
            return status >= 200 && status != 404;
        },
    }).then(response => {
        if (response.status != 200) {
            return {data: null, error: response.data};
        }

        if (response.data === null) {
            return {data: [], error: null};
        }

        return {data: response.data, error: null};
    }).catch(reason => {
        console.error(reason);
        return {data: null, error: reason};
    });
}

export { UploadFile, DeleteFile, VerifyToken, GetFiles }