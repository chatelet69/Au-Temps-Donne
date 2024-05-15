var Minio = require("minio");

class MinIOClient {
    minioClient;

    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT,
            port: Number.parseInt(process.env.MINIO_PORT),
            useSSL: (process.env.SSL_STATUS == "true"),
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET,
        });
    }
}

module.exports = MinIOClient;