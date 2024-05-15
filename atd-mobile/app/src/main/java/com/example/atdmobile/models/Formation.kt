package com.example.atdmobile.models

class Formation {
    private var formationId = 0
    private var formationType = ""
    private var title = ""
    private var startDate = ""
    private var endDate = ""
    private var description = ""
    private var place = ""
    private var responsableName = ""
    private var responsableLastName = ""

    constructor(
        formationId: Int,
        formationType: String,
        title: String,
        description: String,
        startDate: String,
        endDate: String,
        place: String,
        responsableName: String,
        responsableLastName: String,

    ) {
        this.formationId = formationId
        this.formationType = formationType
        this.title = title
        this.description = description
        this.startDate = startDate
        this.endDate = endDate
        this.place = place
        this.responsableName = responsableName
        this.responsableLastName = responsableLastName
    }

    fun getId(): Int { return this.formationId }

    fun getTitle(): String { return this.title }

    fun getFormationType(): String { return this.formationType }

    fun getFormationStartDate(): String { return this.startDate }

    fun geFormationEndDate(): String { return this.endDate }

    fun getFormationDescription(): String { return this.description }

    fun getFormationPlace(): String { return this.place }

    fun getFormationResponsableName(): String { return this.responsableName }

    fun getFormationResponsableLastName(): String { return this.responsableLastName }

}