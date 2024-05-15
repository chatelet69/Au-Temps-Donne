package org.autempsdonne.ticketdesktopapp;

import io.github.cdimascio.dotenv.Dotenv;
import javafx.application.Application;

public class Launcher {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .filename("env")
                .load();
        AtdTicketApplication.API_BASE_URL = dotenv.get("API_BASE_URL");
        AtdTicketApplication.BACK_OFFICE_URL = dotenv.get("BACK_OFFICE_URL");
        AtdTicketApplication.BUCKET_URL = dotenv.get("BUCKET_URL");
        AtdTicketApplication.main(args);
    }
}
