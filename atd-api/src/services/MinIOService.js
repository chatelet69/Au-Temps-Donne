const MinIOClient       = require("../repository/MinIO.js");
const defaultBucketName = require("../../config.json").defaultBucketName;

class MinIOService {
    minioClient;

    constructor() {
        this.minioClient = new MinIOClient().minioClient;
    };

    async getBuckets() {
        try {
            const buckets = await this.minioClient.listBuckets();
            if (buckets) return buckets;
            else return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getAllObjects(bucketName) {
        try {
            bucketName = (bucketName) ? bucketName : defaultBucketName;
            const objects = await this.minioClient.listObjects(bucketName);
            objects.forEach((element) => console.log("elemnt=>",element.name));
            if (objects) return objects;
            else return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async isObjectExist(bucketName, objectName) {
        try {
            // Retrieving object metadata
            const test = await this.minioClient.statObject(bucketName, objectName);
            if (test.size && test.etag) return true;
            else return false;
        } catch (error) {
            // If an error is generated, the object does not exist (usually)
            console.log("is Object exist error :", error.code);
            return false;
        }
    }

    async getUserPfpLink(userId, bucketName, timeInSeconds, isTemporary) {
        try {
            bucketName = (bucketName) ? bucketName : defaultBucketName;
            let pfpLink = this.minioClient.protocol+"//"+this.minioClient.host+":"+this.minioClient.port+"/"+bucketName+"/"+"users-pfp/default-pfp.png";
            if (!timeInSeconds || timeInSeconds <= 0) timeInSeconds = 60 * 60;
            const objectName = "users-pfp/user-"+userId+"-pfp.png";

            const isPfpExist = await this.isObjectExist(bucketName, objectName);
            // Generating a link that allows access to the image publicly temporarily
            //if (isPfpExist) pfpLink = await this.minioClient.presignedUrl("GET", bucketName, objectName, timeInSeconds);
            if (isPfpExist) 
                pfpLink = this.minioClient.protocol+"//"+this.minioClient.host+":"+this.minioClient.port+"/"+bucketName+"/"+objectName;
            return pfpLink;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getFileTempLink(bucketName, objectName, timeInSeconds, isTemporary) {
        try {
            let link = null;
            bucketName = (bucketName) ? bucketName : defaultBucketName;
            if (!timeInSeconds || timeInSeconds <= 0) timeInSeconds = 60 * 60;

            const isFileExist = await this.isObjectExist(bucketName, objectName);
            // Generating a link that allows access to the file
            if (isFileExist) link = await this.minioClient.presignedUrl("GET", bucketName, objectName);
            return link;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getUserFiles(userId, bucketName) {
        try {
            let files = null;
            bucketName = (bucketName) ? bucketName : defaultBucketName;
            
            // Get files with metadata (see https://min.io/docs/minio/linux/developers/javascript/API.html#listobjectsv2withmetadata-bucketname-prefix-recursive-startafter)
            files = await this.minioClient.extensions.listObjectsV2WithMetadata(bucketName, "users-files/user-"+userId+"/", true, "");
            return files;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getEventFileTempLink(eventId, fileName, filetype) {
        try {            
            // Generating a link that allows access to the event file
            const file = await this.minioClient.presignedUrl("GET", defaultBucketName, "events-files/event-"+eventId+"/"+fileName+"."+filetype);
            if (file) return file;
            else return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    putFile(bucketName, objectName, filePath, metaData) {
        bucketName = (bucketName) ? bucketName : defaultBucketName;
        this.minioClient.fPutObject(bucketName, objectName, filePath, metaData, function(err, objInfo){
            if (err) return console.log(err);
            console.log('Success', objInfo.etag, objInfo.versionId);
        });
    }

    async deleteUserFolderByName(bucketName, folderName){
        bucketName = (bucketName) ? bucketName : defaultBucketName;
        await this.minioClient.removeObject(bucketName, folderName, function(err, objInfo){
            if(err){
                console.log(err);
                return console.log("err : " + err);
            }
            console.log('Removed the object ' + folderName)
        })
    }
    
    getObjectsByStream(stream) {
        // Creating a promise that will resolve the data
        return new Promise((resolve, reject) => {
            let objects = [];
            // Reading the data stream to retrieve each object and send it to the table
            stream.on("data", (object) => {
                objects.push(object);
            });
            // At the end of reading, we resolve the promise by returning the array of objects
            stream.on("end", () => {
                resolve(objects);
            });
            stream.on('error', function (error) {
                console.log("Get Objects by stream : ", error);
                reject(error);
            });
        })
    }
}

module.exports = MinIOService;