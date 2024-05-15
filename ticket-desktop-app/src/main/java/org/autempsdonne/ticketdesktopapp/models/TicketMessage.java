package org.autempsdonne.ticketdesktopapp.models;

import java.util.HashMap;

public class TicketMessage {
    public static final int TEXT_MESSAGE = 0;
    public static final int FILE_MESSAGE = 1;
    private int id;
    private String message;
    private int ticketId;
    private int authorId;
    private int type;
    private String username;
    public static final HashMap<Integer, String> difficultiesName = new HashMap<Integer, String>() {{
        put(0, "Basse");
        put(1, "Intermédiaire");
        put(2, "Importante");
        put(3, "Urgent");
    }};
    public static final HashMap<String, Integer> difficultiesValues = new HashMap<String, Integer>() {{
        put("Basse", 0);
        put("Intermédiaire", 1);
        put("Importante", 2);
        put("Urgent", 3);
    }};

    public TicketMessage(int id, String message, int ticketId, int authorId, int type, String username) {
        this.id = id;
        this.message = message;
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.type = type;
        this.username = username;
    }

    // Getters
    public int getId() { return this.id; }

    public String getMessage() { return this.message; }

    public int getTicketId() { return this.ticketId; }

    public int getAuthorId() { return this.authorId; }

    public int getType() { return this.type; }

    public String getUsername() { return this.username; }

    // Setters
    public void setId(int id) { this.id = id; }

    public void setMessage(String message) { this.message = message; }

    public void setTicketId(int ticketId) { this.ticketId = ticketId; }

    public void setAuthorId(int authorId) { this.authorId = authorId; }

    public void setType(int type) { this.type = type; }

    public void setUsername(String username) { this.username = username; }
}
