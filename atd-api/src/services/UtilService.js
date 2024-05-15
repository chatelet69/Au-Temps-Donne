const fs            = require("fs");
const moment        = require("moment"); 
const forms         = require("../utils/form.json");
const uploadPath    = require("../../config.json").uploadPath;

class UtilService {
    checkDatesPast(startDate, endDate) {
        try {
            if (startDate && startDate !== null) {
                if (moment(startDate).isBefore(moment())) return {error: "La date de début est dans le passé"};
            }
            if (endDate && endDate !== null) {
                if (moment(endDate).isBefore(moment())) return {error: "La date de fin est dans le passé"};
            }
            if (endDate && startDate && endDate !== null && startDate !== null) {
                if (moment(endDate).isBefore(startDate)) return {error: "La date de fin est avant la date de début"};
            }
    
            return true;
        } catch (error) {
            console.log(error)
            return {error: "Une erreur est survenue durant la verification de la date"};
        }
    }

    formatDateToMoment(date, dateStatus, timeStatus) {
        try {
            const format = (dateStatus) ? ((timeStatus) ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD") : "HH:mm:ss";
            const formattedDate = moment(date, format);
            return formattedDate;
        } catch (error) {
            console.log(error)
            return false;
        }
    }
    
    checkKeysInData(data, required, authorized) {
        try {
            if (!data) return false;
        
            if (required !== null) {
                for (let key in required)
                    if (!Object.hasOwn(data, required[key])) return false;
            }
            for (let key in data)
                if (!authorized.includes(key)) return false;
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }
    
    separateDataByParams(data, params){ // considère que checkKeysInData a été utilisé avant
        try {
            let prevObject = new Object;
            if(!params) return false;
    
            for (const [key, value] of Object.entries(data)) {
                if(params.includes(key)){
                    prevObject[key] = value;
                }
            }
            return prevObject;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      }

    changeFilename(userData, file){
        try {
            let newName = userData.name
            newName = newName.concat('-', userData.lastname);
            let date = moment().format('LTS');
            date = date.split(" ");
            date = date[0];
            date = date.replace(':','');
            date = date.replace(':','');
            newName = newName.concat('-', date);
            newName = newName.concat('-', this.getRandomInt(1, 99999));
            newName = newName.concat('-', file.originalname);
            return newName;
        } catch (error) {
            console.log(error)
            return false;
        }
    }
    

    renameFile(file, newName){
        try {
            file.filename = newName;
            file.destination = uploadPath;
            let newPath = file.destination;
            if (newPath !== undefined) {
                newPath = (newPath.concat) ? newPath.concat(newName) : newPath + newName;
                fs.rename(file.path, newPath, function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                file.path = newPath;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }
  
    encodeData(data){
        try {
            for(let val in data){
                data[val] = encodeURI(data[val]);
            }
            return data;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    decodeData(data){
        try {
            for(let val in data){
                data[val] = decodeURI(data[val]);
            }
            return data;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    checkMessageData(data) {
        try {
            const retObj = {message: null, filePath: null};
    
            if (data.message) {
                if (data.message.length === 0 || data.message.length > 255) return {error: forms.tooHighLengthString};
                retObj.message = encodeURI(data.message);   // Encode certains types de caractères
            }
    
            if (data.file) {
                // Vérification du MimeType du fichier
                if (!forms.imageMimetypeAuthorized.includes(data.file.mimetype)) return {error: "Type de fichier interdit"};
                // Récupération de la taille en MO
                if ((data.file.size / 1024 / 1024) > forms.imageMaxSize) return {error: "Taille du fichier trop lourde"};
                const tmpData = {name: "chat-image", lastname: "user-"+data.authorId};
                retObj.filePath = this.changeFilename(tmpData, data.file);
            }
    
            if (data.authorId === 0) return {error: "Votre utilisateur n'est pas reconnu"};
    
            return retObj;
        } catch (error) {
            console.log(error)
            return {error: "Une erreur est survenue durant la vérification du message"};
        }
    }
  
    deleteFile(filename) {
        try {
            fs.unlink(`uploads/${filename}`, (error) => {
                if (error) return false;
                else return true;
            })
        } catch (error) {
            console.log(error);
        }
        return false;
    }

    deleteFiles(files) {
        try {
          setTimeout(() => {
            for (var f in files) {
              if(fs.existsSync(files[f].path)){
                fs.unlinkSync(files[f].path);
              }
            }
          }, "4000");
        } catch (error) {
          console.log(error)
        }
      }

    createSalt(){
        try {
            // Generation of a 5-digit random number between 10000 and 99999
            let salt = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
            salt = salt.toString();
            return salt;
        } catch (error) {
            console.log("Error at createSalt : ", error);
            return false;
        }
    }
    
    checkFile(file){
        try {
            if (!forms.cvAndMotivLettersMimetypeAuthorized.includes(file.mimetype))
                return "Type de fichier interdit";
            
                // Récupération de la taille en MO
            if ((file.size / 1024 / 1024) > forms.imageMaxSize) 
                return "Taille du fichier trop lourde";

            return "ok";
        } catch (error) {
            console.log("Error at checkFile : ", error);
            return false;
        }
    }

    checkEditUserData(userId, data) {
        const dataReturned = true;

        if (userId <= 0) return { error: "Identifiant de l'utilisateur incorrect" };

        for (let key in data) {
            switch(key) {
                case "phone":{
                    if(data[key].includes(" "))
                    data[key].removeAll(" ", "");
                    break;
                }
                case "birthday":
                    data[key] = this.formatDateToMoment(data[key], true, false).format("DD/MM/YYYY");
                    break;
            }
        }
         
        return dataReturned;
    }

    static checkSearchedKeys(data, required, authorized) {
        if (required !== null) {
            for (let key in required)
                if (!Object.hasOwn(data, required[key])) return false;
        }
        for (let key in data)
            if (!authorized.includes(key)) return false;
        return true;
    }

    static formatUpdateQueryByObject(sqlQuery, data, isLike) {
        isLike = (isLike) ? " LIKE " : " = ";
        if (Object.keys(data).length > 0) {
            sqlQuery += " AND (";
            let count = 0;
            for (let key in data) {
                sqlQuery += (count == Object.keys(data).length - 1) ? key+isLike+"?" : key+isLike+"? OR ";
                count++;
            }
            sqlQuery += " )";
        }
        return sqlQuery;
    }

    static formatEventDates(eventData) {
        const dates = {
            startDate: moment(eventData.start_datetime).format("YYYY-MM-DD HH:mm:00"),
            endDate: moment(eventData.end_datetime).format("YYYY-MM-DD HH:mm:00")
        };
        return dates;
    }
}

module.exports = UtilService;