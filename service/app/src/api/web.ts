export const verifyToken = async (token: string): Promise<boolean> => {
    // create request data
    let form = new FormData();
    form.append("token", token);

    const options: RequestInit = {
        method: "POST",
        body: form,
    };

    return fetch("/api/token").then((response) => {
        return response.status == 200
    });
}