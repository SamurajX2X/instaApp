const getRequestData = async (req) => {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                try {
                    const parsedBody = JSON.parse(body);
                    resolve(parsedBody);
                } catch (e) {
                    resolve(body);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

export default getRequestData;
