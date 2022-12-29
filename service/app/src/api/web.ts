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
}

export default VerifyToken