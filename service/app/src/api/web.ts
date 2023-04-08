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

const instance = axios.create({
    withCredentials: true,
    validateStatus: status => {
        return status >= 200 && status != 404;
    },
});

const VerifyToken = async (token: string): Promise<ApiResponse<boolean>> => {
    let form = new FormData();
    form.append("token", token);

    return instance.request({
        method: "POST",
        url: "/api/verify",
        data: form,
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

const GetFiles = async (): Promise<ApiResponse<FileResult[]>> => {
    return instance.request({
        method: "GET",
        url: "/api/filelist",
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
};

// TODO: move these parameters into a props interface ?
const UploadFile = async (expire: string, fileName: string, fileData: File, abort: AbortController, progressCallback: (progress: number) => void): Promise<ApiResponse<FileResult>> => {
    // create request data
    let form = new FormData();
    form.append("expire", expire);
    form.append("file", fileData, fileName);

    return instance.request({
        method: "POST",
        url: "/api/file",
        data: form,
        signal: abort.signal,
        onUploadProgress: (p) => {
            if (p.total === undefined) {
                return
            }

            progressCallback(Math.round((p.loaded * 100) / p.total))
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
};

const DeleteFile = async (id: string): Promise<ApiResponse<boolean>> => {
    return instance.request({
        method: "DELETE",
        url: `/api/file?id=${id}`,
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
};

const GetFileInfo = async (id: string): Promise<ApiResponse<FileResult>> => {
    return instance.request({
        method: "GET",
        url: `/api/file?id=${id}`,
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
};

export { VerifyToken, GetFiles, UploadFile, DeleteFile }