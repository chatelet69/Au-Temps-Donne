package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;
import org.autempsdonne.ticketdesktopapp.services.ApiService;
import org.autempsdonne.ticketdesktopapp.utils.ConfigController;

import java.io.File;

public class ErrorViewController {
    public ImageView errorViewImageLogo;

    @FXML protected void initialize() {
        String logoPath = "./assets/logoForLight.png";
        Image logoImage = new Image(new File(logoPath).toURI().toString());
        errorViewImageLogo.setImage(logoImage);
    }

    public void tryReconnectToApp(ActionEvent actionEvent) {
        try {
            if (ApiService.checkApiStatus()) {
                ConfigController.setActualWidth(ConfigController.DEFAULT_WIDTH);
                ConfigController.setActualHeight(ConfigController.DEFAULT_HEIGHT);
                if (AuthController.isLoggedIn()) ViewsController.switchToView(ViewsController.DASHBOARD_VIEW);
                else ViewsController.switchToView("login-view");
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at tryReconnectToApp : " + e.getMessage());
        }
    }
}