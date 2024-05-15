package org.autempsdonne.ticketdesktopapp.models;

public enum TicketStatusMessage {
    TICKET_ALREADY_CLOSED("Ce ticket est déjà fermé !"),
    TICKET_HAS_BEEN_CLOSED("Le ticket a bien été fermé !"),
    TICKET_HAS_BEEN_OPENED("Le ticket a bien été ouvert !");

    private final String ticketStatusMessage;

    TicketStatusMessage(String ticketStatusMessage) {
        this.ticketStatusMessage = ticketStatusMessage;
    }

    public String getTicketStatusMessage() {
        return ticketStatusMessage;
    }
}
