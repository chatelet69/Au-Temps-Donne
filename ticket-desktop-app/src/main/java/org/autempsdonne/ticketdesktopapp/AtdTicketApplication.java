package org.autempsdonne.ticketdesktopapp;

import io.github.cdimascio.dotenv.Dotenv;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import org.autempsdonne.ticketdesktopapp.services.ApiService;
import org.autempsdonne.ticketdesktopapp.utils.ConfigController;

import java.lang.String;

import java.io.IOException;

public class AtdTicketApplication extends Application {
    static public final String APPLICATION_NAME = "AuTempsDonne Ticketing";
    static public final boolean IS_RESIZABLE = true;
    static public final boolean DEBUG_STATUS = true;
    static public String API_BASE_URL;
    static public String BACK_OFFICE_URL;
    static private Stage mainStage = null;
    static public String BUCKET_URL;

    @Override
    public void start(Stage primaryStage) throws IOException {
        String baseResource;
        if (ApiService.checkApiStatus()) {
            boolean isConnected = AuthController.isLoggedIn();
            baseResource = (isConnected) ? "dashboard-view.fxml" : "login-view.fxml";
        } else {
            baseResource = "error-view.fxml";
            ConfigController.setActualWidth(ConfigController.MIN_WIDTH);
            ConfigController.setActualHeight(ConfigController.MIN_HEIGHT);
        }
        FXMLLoader fxmlLoader = new FXMLLoader(AtdTicketApplication.class.getResource(baseResource));
        Scene scene = new Scene(fxmlLoader.load(), ConfigController.getActualWidth(), ConfigController.getActualHeight(), Color.DARKRED);

        // Une stage représente une fenêtre, ici on récupère ici en paramètre la fenêtre principale
        mainStage = primaryStage;
        windowResizeListener();

        mainStage.initStyle(StageStyle.DECORATED);
        mainStage.setResizable(IS_RESIZABLE);
        mainStage.setMinWidth(ConfigController.MIN_WIDTH);
        mainStage.setMinHeight(ConfigController.MIN_HEIGHT);
        mainStage.setTitle(APPLICATION_NAME);
        mainStage.setScene(scene);
        mainStage.getIcons().add(new Image("file:assets/logoForLight.png"));
        mainStage.show();
    }

    static public void windowResizeListener() {
        try {
            mainStage.widthProperty().addListener((observable, oldValue, newValue) -> {
                ConfigController.setActualWidth(newValue.doubleValue());
                if (mainStage.getScene().getWidth() != newValue.doubleValue())
                    ConfigController.setActualWidth(mainStage.getScene().getWidth());
            });
            mainStage.heightProperty().addListener((observable, oldValue, newValue) -> {
                ConfigController.setActualHeight(newValue.doubleValue());
                if (mainStage.getScene().getHeight() != newValue.doubleValue())
                    ConfigController.setActualHeight(mainStage.getScene().getHeight());
            });
        } catch (Exception e) {
            if (DEBUG_STATUS) { System.out.println("Error at windowResizeListener : " + e.getMessage()); }
        }
    }

    static public Stage getMainStage() { return mainStage; }

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .filename("env")
                .load();
        API_BASE_URL = dotenv.get("API_BASE_URL");
        BACK_OFFICE_URL = dotenv.get("BACK_OFFICE_URL");
        BUCKET_URL = dotenv.get("BUCKET_URL");
        launch();
    }
}