package org.autempsdonne.ticketdesktopapp.services;

import okhttp3.Response;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.models.TicketMessage;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

public class TicketChatService {
    public static final String TICKET_CHAT_ENDPOINT = "/api/tickets/:id/chat";
    private List<TicketMessage> ticketMessageList;

    public TicketChatService() {
        ticketMessageList = new ArrayList<TicketMessage>();
    }

    public TicketChatService(List<TicketMessage> ticketMessageList) {
        this.ticketMessageList = ticketMessageList;
    }

    // Getters
    public List<TicketMessage> getTicketMessageList() { return this.ticketMessageList; }

    public int getTicketMessageListSize() { return this.ticketMessageList.size(); }

    // Setters

    public void setTicketMessageList(List<TicketMessage> ticketMessageList) {
        this.ticketMessageList = ticketMessageList;
    }

    // Methods
    public void fetchTicketChat(int ticketId) {
        try {
            this.ticketMessageList.clear();
            boolean status = false;
            String finalEndpoint = TICKET_CHAT_ENDPOINT.replace(":id", String.valueOf(ticketId));
            HttpResponse response = ApiService.getRequest(finalEndpoint);
            if (response != null && response.statusCode() == 200) {
                JSONObject json = new JSONObject(response.body().toString());
                int count = json.getInt("count");
                JSONArray tickets = json.getJSONArray("ticket_chats");
                if (count > 0) {
                    for (int i = 0; i < count; i++) {
                        JSONObject ticketChat = tickets.getJSONObject(i);
                        TicketMessage ticketMsg = new TicketMessage(
                                ticketChat.getInt("id"), ticketChat.getString("message_content"),
                                ticketChat.getInt("ticket_id"), ticketChat.getInt("author_id"),
                                ticketChat.getInt("type"), ticketChat.getString("username")
                        );
                        this.ticketMessageList.add(ticketMsg);
                    }
                }
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at fetchTicketChat : " + e.getMessage());
        }
    }

    public boolean sendTicketMessage(int ticketId, String message) {
        try {
            boolean status = false;
            String finalEndpoint = TICKET_CHAT_ENDPOINT.replace(":id", String.valueOf(ticketId));
            String body = "message="+message+"&type=0";
            HttpResponse response = ApiService.postRequest(finalEndpoint, body, ApiService.FORM_URL_ENCODED);
            if (response != null) {
                JSONObject json = new JSONObject(response.body().toString());
                if (json.keySet().contains("message")) status = true;
            }
            return status;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at sendTicketMessage : " + e.getMessage());
            return false;
        }
    }

    public boolean sendTicketFile(int ticketId, File file) {
        try {
            boolean status = false;
            String finalEndpoint = TICKET_CHAT_ENDPOINT.replace(":id", String.valueOf(ticketId));
            Response response = ApiService.sendFileRequest(finalEndpoint, file);
            if (response != null) {
                JSONObject json = new JSONObject(response.body().toString());
                if (json.keySet().contains("message")) status = true;
            }
            return status;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at sendTicketMessage : " + e.getMessage());
            return false;
        }
    }

    public boolean changeTicketDifficulty(int ticketId, int newDifficulty) {
        try {
            String finalEndpoint = TicketService.EDIT_TICKET_ENDPOINT.replace(":id", String.valueOf(ticketId));
            String body = "difficulty="+newDifficulty;
            HttpResponse response = ApiService.putRequest(finalEndpoint, body);
            if (response != null) {
                JSONObject json = new JSONObject(response.body().toString());
                return json.keySet().contains("message");
            }
            return false;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at changeTicketDifficulty : " + e.getMessage());
            return false;
        }
    }
}
