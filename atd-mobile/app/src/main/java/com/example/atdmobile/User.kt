package com.example.atdmobile

class User {
    var username = ""
    var rank = 0
    var userId = 0
    var pfp = ""
    var name = ""
    var lastname = ""
    var jwt = ""

    constructor(
        username: String,
        rank: Int,
        userId: Int,
        pfp: String,
        name: String,
        lastname: String,
        jwt: String
    ) {
        this.username = username
        this.rank = rank
        this.userId = userId
        this.pfp = pfp
        this.name = name
        this.lastname = lastname
        this.jwt = jwt
    }
}