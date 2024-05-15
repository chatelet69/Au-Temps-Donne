package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextArea;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;

public class LoginViewController {
    public Button onForgetPasswordButtonClick;
    public Label welcomeToLoginView;
    public PasswordField passwordInput;
    public TextArea usernameInput;
    @FXML private Label loginText;
    @FXML private Label onLoginFailedText;

    @FXML
    protected void onForgetPasswordButtonClick(ActionEvent actionEvent) {
        loginText.setText("Welcome to JavaFX Application!");
    }

    @FXML
    protected void onLoginButtonClick() {
        try {
            String username = usernameInput.getText();
            String password = passwordInput.getText();
            if (AuthController.checkAuthCredsSize(username, password)) {
                boolean checkLogin = AuthController.login(username, password);
                if (checkLogin) ViewsController.switchToView(ViewsController.DASHBOARD_VIEW);
                else this.onLoginFailed();
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println(e.getMessage());
        }
    }

    @FXML
    protected void onLoginFailed() {
        onLoginFailedText.setText("Connexion échouée (Identifiants incorrects)");
    }
}
