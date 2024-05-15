package org.autempsdonne.ticketdesktopapp.models;

public class Ticket {
    public static final int CLOSED_STATUS = 1;
    public static final int OPENED_STATUS = 0;
    private final int id;
    private String title;
    private String description;
    private int status;
    private int difficulty;
    private String date;
    private String category;
    private int authorId;
    private String authorName;
    private String authorPfp;

    public Ticket(int id, String title, String description, int status, int difficulty,
                  String date, String category, int authorId, String authorName, String authorPfp) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.difficulty = difficulty;
        this.date = date;
        this.category = (category.compareToIgnoreCase("null") == 0) ? "Pas de catégorie" : category;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorPfp = authorPfp;
    }

    // Getters
    public int getId() { return this.id; }

    public String getTitle() { return this.title; }

    public String getDescription() { return this.description; }

    public int getStatus() { return this.status; }

    public int getDifficulty() { return this.difficulty; }

    public String getDate() { return this.date; }

    public String getCategory() { return this.category; }

    public int getAuthorId() { return this.authorId; }

    public String getAuthorName() { return this.authorName; }

    public String getAuthorPfp() { return this.authorPfp; }

    // Setters
    public void setTitle(String title) { this.title = title; }

    public void setDescription(String description) { this.description = description; }

    public void setStatus(int status) { this.status = status; }

    public void setDifficulty(int difficulty) { this.difficulty = difficulty; }

    public void setDate(String date) { this.date = date; }

    public void setCategory(String category) { this.category = category; }

    public void setAuthorId(int authorId) { this.authorId = authorId; }

    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public void setAuthorPfp(String authorPfp) { this.authorPfp = authorPfp; }
}
