package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;

import java.awt.*;
import java.io.File;
import java.net.URI;

public class MenuController {
    public ImageView imageLogoMenu;
    @FXML private Label menuUsernameText;

    @FXML protected void initialize() {
        try {
            menuUsernameText.setText(AuthController.getUser().getUsername());

            String logoPath = "./assets/logoForLight.png"; //System.getProperty("user.dir") + "\\assets\\logoForLight.png";
            Image logoImage = new Image(new File(logoPath).toURI().toString());
            imageLogoMenu.setImage(logoImage);
            imageLogoMenu.minWidth(100.0);
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at menu initialize : " + e.getMessage());
        }
    }

    public void onLogoutButtonClick() {
        try {
            boolean check = AuthController.logout();
            if (check) ViewsController.switchToView("login-view");
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at onLogoutButtonClick : " + e.getMessage());
        }
    }

    @FXML protected void switchModuleView(ActionEvent event) {
        try {
            Button clickedButton = (Button) event.getSource();
            String viewName = clickedButton.getUserData().toString();
            ViewsController.switchToView(viewName);
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at onSwitchModuleView : " + e.getMessage());
        }
    }

    public void goToBackOfficeButtonClicked(ActionEvent actionEvent) {
        try {
            String url = AtdTicketApplication.BACK_OFFICE_URL;
            Desktop.getDesktop().browse(new URI(url));
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at goToBackOfficeButtonClicked : " + e.getMessage());
        }
    }
}
