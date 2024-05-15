package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.stage.Modality;
import javafx.stage.Stage;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.models.Ticket;
import org.autempsdonne.ticketdesktopapp.utils.ConfigController;

public class ViewsController {
    public static Stage mainStage = AtdTicketApplication.getMainStage();
    public static final String DASHBOARD_VIEW = "dashboard-view";

    static public void switchToView(String viewName) {
        try {
            switchToView(viewName, null);
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.err.println("Error at @switchToView : " + e.getMessage());
        }
    }

    static public void switchToView(String viewName, Ticket ticket) {
        try {
            if (mainStage != null) {
                if (!viewName.contains(".fxml")) viewName = viewName + ".fxml";
                FXMLLoader fxmlLoader = new FXMLLoader(AtdTicketApplication.class.getResource(viewName));
                Scene newScene = new Scene(fxmlLoader.load(), ConfigController.getActualWidth(), ConfigController.getActualHeight(), Color.DARKRED);

                if (viewName.equals("ticket-view.fxml") && ticket != null) {
                    TicketViewController ticketController = fxmlLoader.getController();
                    ticketController.initialize(ticket);
                }

                //Scene oldScene = mainStage.getScene();
                /*mainStage.setScene(newScene);
                mainStage.show();
                if (oldScene != null) {
                    System.gc();
                    Stage stage = (Stage) oldScene.getWindow();
                    if (stage != null) stage.close();
                    oldScene.getRoot().getChildrenUnmodifiable().remove(oldScene);
                    if (oldScene.getWindow() != null) oldScene.getWindow().hide();
                }*/

                mainStage.setScene(newScene);
                mainStage.show();
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.err.println("Error at @switchToView : " + e.getMessage());
        }
    }

    static public void showInfoAlert(Alert.AlertType alertType, String title, String message) {
        try {
            Alert alert = new Alert(alertType);
            alert.setTitle(title);
            alert.setHeaderText(null);
            alert.setContentText(message);
            alert.showAndWait();
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at showInfoAlert : " + e.getMessage());
        }
    }
}
