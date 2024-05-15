package org.autempsdonne.ticketdesktopapp.services;

import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.models.Ticket;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;

public class TicketService {
    public static final String GET_TICKETS_ENDPOINT = "/api/tickets";
    public static final String GET_TICKET_BY_ID_ENDPOINT = "/api/tickets/getTicketById/:id";
    public static final String TICKET_CHAT_ENDPOINT = "/api/tickets/:id/chat";
    public static final String CLOSE_TICKET_ENDPOINT = "/api/tickets/:id/close";
    public static final String OPEN_TICKET_ENDPOINT = "/api/tickets/:id/open";
    public static final String EDIT_TICKET_ENDPOINT = "/api/tickets/:id/edit";
    private List<Ticket> ticketList;

    public TicketService() {
        this.ticketList = new ArrayList<Ticket>();
    }

    public TicketService(List<Ticket> ticketList) {
        this.ticketList = ticketList;
    }

    // Getters
    public List<Ticket> getTicketList() { return this.ticketList; }

    // Setters
    public void setTicketList(List<Ticket> ticketList) { this.ticketList = ticketList; }

    // Methods

    public void fetchTicketsFromApi() {
        try {
            this.ticketList.clear();
            HttpResponse response = ApiService.getRequest(GET_TICKETS_ENDPOINT);
            if (response != null && response.statusCode() == 200) {
                String responseBody = response.body().toString();
                JSONObject json = new JSONObject(responseBody);
                JSONArray tickets = json.getJSONArray("tickets");
                int count = json.getInt("count");
                if (count > 0) {
                    for (int i = 0; i < count; i++) {
                        JSONObject ticket = tickets.getJSONObject(i);
                        Ticket ticketObj = new Ticket(
                                ticket.getInt("id"), ticket.getString("title"),
                                ticket.getString("description"), ticket.getInt("ticket_status"),
                                ticket.getInt("difficulty"), ticket.getString("date"),
                                ticket.get("category").toString(), ticket.getInt("author"),
                                ticket.getString("authorName"), ticket.getString("authorLastname")
                        );
                        this.ticketList.add(ticketObj);
                    }
                }
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at fetchTicketsFromApi : " + e.getMessage());
        }
    }

    public static boolean changeTicketStatus(int ticketId, int newStatus) {
        try {
            Boolean status = false;
            String finalEndpoint = (newStatus == Ticket.OPENED_STATUS) ? OPEN_TICKET_ENDPOINT : CLOSE_TICKET_ENDPOINT;
            finalEndpoint = finalEndpoint.replace(":id", String.valueOf(ticketId));
            String finalEndpoint1 = finalEndpoint;
            ExecutorService executor = Executors.newSingleThreadExecutor();
            String finalEndpoint2 = finalEndpoint;
            Future<Boolean> future = executor.submit(() -> {
                HttpResponse response = ApiService.getRequest(finalEndpoint2);
                if (response != null) {
                    String responseBody = response.body().toString();
                    JSONObject json = new JSONObject(responseBody);
                    return json.keySet().contains("message");
                }
                return false;
            });
            status = future.get();
            executor.shutdown();
            return status;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at changeTicketStatus : " + e.getMessage());
            return false;
        }
    }
}
