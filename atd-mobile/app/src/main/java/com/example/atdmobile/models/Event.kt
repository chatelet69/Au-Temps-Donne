package com.example.atdmobile.models

class Event {
    private var eventId = 0
    private var user = 0
    private var eventType = ""
    private var title = ""
    private var startDate = ""
    private var endDate = ""
    private var responsableId = 0
    private var description = ""
    private var place = ""
    private var collectName = ""
    private var responsableName = ""
    private var responsableLastName = ""

    constructor(
        eventId: Int,
        user: Int,
        eventType: String,
        title: String,
        startDate: String,
        endDate: String,
        responsableId: Int,
        description: String,
        place: String,
        collectName: String,
        responsableName: String,
        responsableLastName: String
    ) {
        this.eventId = eventId
        this.user = user
        this.eventType = eventType
        this.title = title
        this.startDate = startDate
        this.endDate = endDate
        this.responsableId = responsableId
        this.description = description
        this.place = place
        this.collectName
        this.responsableName = responsableName
        this.responsableLastName = responsableLastName
    }

    fun getId(): Int { return this.eventId }

    fun getTitle(): String { return this.title }

    fun getEventType(): String { return this.eventType }

    fun getEventStartDate(): String { return this.startDate }

    fun getEventEndDate(): String { return this.endDate }

    fun getEventDescription(): String { return this.description }

    fun getEventPlace(): String { return this.place }

    fun getEventResponsableName(): String { return this.responsableName }

    fun getEventResponsableLastName(): String { return this.responsableLastName }

    fun setId(newId: Int) { this.eventId = newId }
}