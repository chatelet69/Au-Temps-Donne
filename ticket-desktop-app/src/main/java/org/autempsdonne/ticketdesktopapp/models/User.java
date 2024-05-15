package org.autempsdonne.ticketdesktopapp.models;

public class User {
    private int id;
    private int rank;
    private String username;
    private String name;
    private String lastname;
    private String lang;
    private String pfp;
    public User(int id, int rank, String username, String name, String lastname, String lang, String pfp) {
        this.id = id;
        this.rank = rank;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.lang = lang;
        this.pfp = pfp;
    }

    // Getters

    public int getId() { return id; }

    public int getRank() { return rank; }

    public String getUsername() { return username; }

    public String getName() { return name; }

    public String getLastname() { return lastname; }

    public String getLang() { return lang; }

    public String getPfp() { return pfp; }

    // Setters

    public void setId(int id) { this.id = id; }

    public void setRank(int rank) { this.rank = rank; }

    public void setUsername(String username) { this.username = username; }

    public void setName(String name) { this.name = name; }

    public void setLastname(String lastname) { this.lastname = lastname; }

    public void setLang(String lang) { this.lang = lang; }

    public void setPfp(String pfp) { this.pfp = pfp; }
}
