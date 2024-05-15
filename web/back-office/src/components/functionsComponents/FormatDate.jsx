function FormatDate(date, initialFormat) {
    let finalDate = date;
    if (initialFormat === "%Y-%m-%d" || initialFormat === "Y-m-d") {
        let tmp = date.split("-");
        finalDate = tmp[2]+'/'+tmp[1]+'/'+tmp[0];
    } else if (initialFormat === "%d/%m/%Y" || initialFormat === "d-m-Y") {
        let tmp = date.split("/");
        finalDate = tmp[2]+"-"+tmp[1]+"-"+tmp[0];
    }

    return finalDate;
};

export default FormatDate;