module org.autempsdonne.ticketdesktopapp {
    requires javafx.controls;
    requires javafx.fxml;
    requires io.github.cdimascio.dotenv.java;
    requires java.net.http;
    requires org.json;
    requires java.xml;
    requires java.desktop;
    requires okhttp3;

    opens org.autempsdonne.ticketdesktopapp to javafx.fxml;
    opens org.autempsdonne.ticketdesktopapp.viewsControllers to javafx.fxml;
    opens org.autempsdonne.ticketdesktopapp.utils to javafx.fxml;
    exports org.autempsdonne.ticketdesktopapp;
    exports org.autempsdonne.ticketdesktopapp.viewsControllers;
    exports org.autempsdonne.ticketdesktopapp.utils;
    exports org.autempsdonne.ticketdesktopapp.services;
    opens org.autempsdonne.ticketdesktopapp.services to javafx.fxml;
    exports org.autempsdonne.ticketdesktopapp.models;
    opens org.autempsdonne.ticketdesktopapp.models to javafx.fxml;
}